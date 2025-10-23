// services/downloadImage.js
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "./downloads";
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

export async function downloadImageToFile(url, filenamePrefix = "img") {
  try {
    const resp = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
    const ext = (resp.headers["content-type"] || "").split("/")[1] || "jpg";
    const name = `${filenamePrefix}_${Date.now()}.${ext}`;
    const outPath = path.join(DOWNLOAD_DIR, name);
    fs.writeFileSync(outPath, resp.data);
    return outPath;
  } catch (err) {
    console.error("download failed", url, err.message);
    throw err;
  }
}
