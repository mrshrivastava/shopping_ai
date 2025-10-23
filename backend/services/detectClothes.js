// services/detectClothes.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export async function detectClothesLocal(imagePath) {
  // posts file to Roboflow model endpoint (returns predictions)
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const url = process.env.ROBOFLOW_MODEL_URL;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        api_key: process.env.ROBOFLOW_API_KEY,
        inputs: {
            "image": {
              type: "base64",
              value: base64Image,
            }
        }
    })
});

const result = await resp.json();

  // Roboflow returns predictions array with x,y,width,height (in pixels) and class/confidence
  const predictions =
  result?.outputs?.[0]?.predictions?.predictions?.map(p => ({
    type: p.class,          
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
    confidence: p.confidence
  })) || [];


  return predictions;
}
