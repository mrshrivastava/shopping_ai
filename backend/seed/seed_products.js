// seed/seed_products.js
import fs from "fs";
import { downloadImageToFile } from "../services/downloadImage.js";
import { computePhashHex } from "../services/imageHash.js";
import { query } from "../db/index.js";
import { detectClothesLocal } from "../services/detectClothes.js";
import { cropAndComputePhash } from "../services/cropAndHash.js";
import { computeClipEmbedding } from "../services/clipEmbedding.js";
import dayjs from 'dayjs';
const products = JSON.parse(fs.readFileSync("./seed/products.json","utf8"));

function formatToISO(dateStr) {
  if (!dateStr) return null;
  const parsed = dayjs(dateStr, ['DD-MM-YYYY HH:mm', 'YYYY-MM-DD HH:mm:ss'], true);
  return parsed.isValid() ? parsed.toISOString() : null;
}

async function run() {
  for (const p of products) {
    try {
      const localPath = await downloadImageToFile(p.featured_image, `prod_${p.sku_id}`);
      const preds = await detectClothesLocal(localPath);
      if(preds.length === 0) {
        console.log("No detections for", p.sku_id, "- skipping");
        continue;
      }
      for (const pred of preds) {
        try {
          const { outPath, phash } = await cropAndComputePhash(localPath, pred, `product${p.sku_id}_det`);
          const clipEmb = await computeClipEmbedding(outPath);
          let created_at = null;
          let release_date = null;
          let updated_at = null;
          if(p.created_at) {
            created_at = formatToISO(p.created_at);
          }
          if(p.release_date) {
            release_date = formatToISO(p.release_date);
          }
          if(p.updated_at) {
            updated_at = formatToISO(p.updated_at);
          }
          await query(
            `INSERT INTO products (
              id,
              sku_id,
              title,
              slug,
              category,
              sub_category,
              brand_name,
              product_type,
              gender,
              colorways,
              brand_sku,
              model,
              lowest_price,
              description,
              is_d2c,
              is_active,
              is_certificate_required,
              featured_image,
              quantity_left,
              wishlist_num,
              stock_claimed_percent,
              discount_percentage,
              note,
              tags,
              release_date,
              created_at,
              updated_at,
              pdp_url,
              local_path,
              phash, 
              clip_embedding
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18,
              $19, $20, $21, $22, $23, $24, $25, $26,
              $27, $28, $29, $30, $31
            )
            ON CONFLICT (id) DO NOTHING;`,
            [
              p.id,
              p.sku_id,
              p.title,
              p.slug,
              p.category,
              p.sub_category,
              p.brand_name,
              p.product_type,
              p.gender,
              p.colorways,
              p.brand_sku,
              p.model,
              p.lowest_price,
              p.description,
              p.is_d2c,
              p.is_active,
              p.is_certificate_required,
              p.featured_image,
              p.quantity_left,
              p.wishlist_num,
              p.stock_claimed_percent,
              p.discount_percentage,
              p.note,
              p.tags,
              release_date,
              created_at,
              updated_at,
              p.pdp_url,
              localPath,
              phash,
              clipEmb
            ]
          );

          console.log("Inserted", p.sku_id);
        } catch (err) {
                console.error("Failed product", p.sku_id, err.message);
              }
            }
      // const phash = await computePhashHex(localPath);
      // await query(
      //   `INSERT INTO products (product_id,title,brand_name,category,image_url,price,local_path,phash)
      //    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (product_id) DO NOTHING`,
      //   [p.product_id, p.title, p.brand_name, p.category, p.image_url, p.price, localPath, phash]
      // );
      // console.log("Inserted", p.product_id);
    } catch (err) {
      console.error("Failed product", p.sku_id, err.message);
    }
  }
  console.log("Product seed complete");
}

run();
