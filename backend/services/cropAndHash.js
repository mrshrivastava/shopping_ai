// services/cropAndHash.js
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { computePhashHex } from "./imageHash.js";
import dotenv from "dotenv";
dotenv.config();

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "./downloads";

export async function cropAndComputePhash(fullImagePath, bbox, filenamePrefix = "crop") {
  // bbox: { x, y, width, height } in pixels (as Roboflow gives)
  // Save crop file
  const outName = `${filenamePrefix}_${Date.now()}.jpg`;
  const outPath = path.join(DOWNLOAD_DIR, outName);

  // sharp: extract requires integer coords
  const left = Math.max(0, Math.round(bbox.x - bbox.width / 2));
  const top = Math.max(0, Math.round(bbox.y - bbox.height / 2));
  const w = Math.max(1, Math.round(bbox.width));
  const h = Math.max(1, Math.round(bbox.height));

  await sharp(fullImagePath).extract({ left, top, width: w, height: h }).toFile(outPath);

  const phash = await computePhashHex(outPath);
  return { outPath, phash };
  // .resize(256, 256)
}
