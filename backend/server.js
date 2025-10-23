// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { fileURLToPath } from "url";
dotenv.config();
import { query } from "./db/index.js";
import fs from "fs";
import path from "path";
import { hexHammingDistance } from "./services/imageHash.js";
// import { cosineSimilarity } from 'scikitjs';
import { computeClipEmbedding } from "./services/clipEmbedding.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.resolve('uploads')

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath)

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed!'))
  }
})

app.use(cors());
app.use(express.json());

// Helper function: download image and save locally
async function downloadImage(imageUrl, localPath) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(buffer));
  return localPath;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}


// list posts (basic)
// app.get("/posts", async (req, res) => {
//   const r = await query("SELECT id, image_url, caption, local_path FROM posts ORDER BY id DESC");
//   res.json({ posts: r.rows });
// });

app.get('/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 20
  const offset = (page - 1) * limit

  const result = await query(
    'SELECT * FROM posts ORDER BY id LIMIT $1 OFFSET $2;',
    [limit, offset]
  )
  res.json({ posts: result.rows })
})


// get one post with detections
app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const p = await query("SELECT * FROM posts WHERE id=$1", [id]);
  if (!p.rows.length) return res.status(404).json({ error: "not found" });
  const post = p.rows[0];
  const d = await query("SELECT * FROM detections WHERE post_id=$1", [id]);
  res.json({ post, detections: d.rows });
});

//get the product details
app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  const p = await query("SELECT * FROM products WHERE id=$1", [id]);
  if (!p.rows.length) return res.status(404).json({ error: "not found" });
  const product = p.rows[0];
  res.json({ product });
});

// get similar products for a detection
app.get("/posts/:id/similar", async (req, res) => {
  try {
    const { dotId, threshold=0.8  } = req.query; // similarity threshold (0.0 - 1.0)
    if (!dotId) return res.status(400).json({ error: "missing dotId" });

    // Get query detection with clip_embedding
    const detQ = await query("SELECT * FROM detections WHERE id=$1", [dotId]);
    if (!detQ.rows.length) return res.status(404).json({ error: "detection not found" });
    const det = detQ.rows[0];
    if (!det.clip_embedding) return res.status(400).json({ error: "no clip embedding for detection" });

    const queryEmbedding = det.clip_embedding;

    // Fetch candidate detections to compare against
    const result = await query("SELECT * FROM products LIMIT 1000");

    // Compute cosine similarity
    const sims = result.rows
      .map(row => ({
        product: row,
        score: cosineSimilarity(row.clip_embedding, queryEmbedding),
      }))
      .filter(s => s.score >= parseFloat(threshold)) // Filter by similarity threshold
      .sort((a, b) => b.score - a.score) // Higher = more similar
      .slice(0, 50); // top N

    res.json({ matches: sims });

  } catch (err) {
    console.error("❌ Error in similarity search:", err);
    res.status(500).json({ error: err.message });
  }
});

// text search
app.get('/search', async (req, res) => {
  const q = req.query.query;
  console.log("Text search query:", q);
  const result = await query(
    'SELECT * FROM products where title ILIKE $1 OR brand_name ILIKE $1 OR category ILIKE $1 OR description ILIKE $1 LIMIT 20;',
    [`%${q}%`]
  );
  if(!result.rows.length) {
    return res.status(400).json("No results found");
  }
  res.json({ results: result.rows });
});

// image search
app.post('/search', upload.single('image'), async (req, res) => {
  const embedding = await computeClipEmbedding(req.file.path);
  const dbRes = await query('SELECT * FROM products');
  const match = dbRes.rows.map((r) => ({
    product: r,
    score: cosineSimilarity(embedding, r.clip_embedding),
  }))
  .filter(s => s.score >= parseFloat(0.8)) // Filter by similarity threshold
  .sort((a, b) => b.score - a.score) // Higher = more similar
  .slice(0, 50);
  res.json({ matches : match });
});
// app.post('/search', upload.single('image'), async (req, res) => {
//   let localImagePath;
//   try {
//     const uploadDir = path.resolve(__dirname, "uploads");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     if (req.file) {
//       localImagePath = path.join(uploadDir, req.file.filename);
//     } else if (req.body.imageUrl) {
//       const imageName = `downloaded_${Date.now()}.jpg`;
//       const savePath = path.join(uploadDir, imageName);
//       await downloadImage(req.body.imageUrl, savePath);
//       localImagePath = savePath;
//     } else {
//       return res.status(400).json({ error: "No image provided" });
//     }

//     const embedding = await computeClipEmbedding(localImagePath);

//     const dbRes = await query('SELECT * FROM products');
//     const matches = dbRes.rows
//       .map((r) => {
//         const dbEmbedding = typeof r.clip_embedding === 'string'
//           ? JSON.parse(r.clip_embedding)
//           : r.clip_embedding;
//         return {
//           product: r,
//           score: cosineSimilarity(embedding, dbEmbedding),
//         };
//       })
//       .filter((s) => s.score >= 0.8)
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 50);

//     res.json({ matches });
//   } catch (err) {
//     console.error("❌ Search error:", err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     if (localImagePath && fs.existsSync(localImagePath)) {
//       fs.unlinkSync(localImagePath);
//     }
//   }
// });



const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));
