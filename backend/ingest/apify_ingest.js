// ingest/apify_ingest.js
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { downloadImageToFile } from "../services/downloadImage.js";
import { detectClothesLocal } from "../services/detectClothes.js";
import { cropAndComputePhash } from "../services/cropAndHash.js";
import { query } from "../db/index.js";
import fs from "fs";
import path from "path";
import { computeClipEmbedding } from "../services/clipEmbedding.js";

const APIFY_URL_LIST = [process.env.APIFY_PINTEREST_DATASET_URL, process.env.APIFY_INSTAGRAM_DATASET_URL];

async function fetchDataset(APIFY_URL) {
  const resp = await axios.get(APIFY_URL, { timeout: 60000 });
  return resp.data; // array of records
}

function extractPostFields(record) {

  // Apify record shape varies; adapt these accesses to your dataset
  return {
    apify_id: record._id || record.id || null,
    image_url: record?.images?.orig?.url || record.image || record.images?.[0] || record.imageUrl || record.media?.url || record.thumbnail,
    caption: record.caption || record.description || record.full_text || record.text || null,
    hashtags: (record.hashtags || record.tags || []).map(s => s.replace(/^#/, '')) || [],
    tags: record.mentions || [],
    likes: record.likes_count || record.engagement?.likes || record.stats?.likes || null,
    comments: record.comments_count || record.engagement?.comments || null,
    posted_at: record.published_at || record.date || record.created || null,
    user_handle: record.user?.username || record.author || record.owner || null,
    user_name: record.user?.name || null,
    source_url: record.url || record.sourceUrl || record.post_url || record.link
  };
}

export async function runIngest() {
  
  for(const APIFY_URL of APIFY_URL_LIST){
  const items = await fetchDataset(APIFY_URL);
  var count=0;
  for (const rec of items) {
    try {
      const p = extractPostFields(rec);
      if (!p.image_url) {
        console.log("Skipping record, no image:", rec._id || rec.id);
        count++;
        continue;
      }

      // download image
      let localPath;
      try {
        if(p.image_url.length)
        localPath = await downloadImageToFile(p.image_url, `post_${rec._id || Date.now()}`);
      } catch (err) {
        console.warn("Download failed for", p.image_url, "— skipping");
        continue;
      }

      // run detector
      const preds = await detectClothesLocal(localPath);
      // insert post
      const insertPost = await query(
        `INSERT INTO posts (apify_id,image_url,caption,hashtags,tags,likes,comments,posted_at,user_handle,user_name,source_url,local_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [
          p.apify_id, p.image_url, p.caption,
          p.hashtags, p.tags, p.likes, p.comments,
          p.posted_at, p.user_handle, p.user_name, p.source_url, localPath
        ]
      );
      const postId = insertPost.rows[0].id;

      // save each detection and compute crop + phash
      for (const pred of preds) {
        try {
          const { outPath, phash } = await cropAndComputePhash(localPath, pred, `post${postId}_det`);
          const clipEmb = await computeClipEmbedding(outPath);
          await query(
            `INSERT INTO detections (post_id, type, x, y, width, height, confidence, crop_path, phash, clip_embedding)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [postId, pred.type, pred.x, pred.y, pred.width, pred.height, pred.confidence, outPath, phash, clipEmb]
          );
        } catch (err) {
          console.error("Error processing prediction", err);
        }
      }

      // console.log(`Post ${postId} saved with ${preds.length} detections`);
    } catch (err) {
      console.error("Record ingest failed:", err);
    }
  }

  // console.log(`Ingest complete. total skipped = "${count}"`);
  }
}

// if run directly
if (process.argv[1].endsWith("apify_ingest.js")) {
  runIngest().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
}
