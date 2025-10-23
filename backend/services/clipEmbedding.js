import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

const base_url=process.env.MICRO_SERVICE_BASE_URL || "http://localhost:8000";

export async function computeClipEmbedding(imagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));

  try {
    const res = await fetch(`${base_url}/embed`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    
    try {
      fs.unlinkSync(imagePath);
    } catch (deleteErr) {
      console.warn(`Could not delete file ${imagePath}:`, deleteErr.message);
    }

    return json.embedding;
  } catch (err) {
    console.error("Failed to fetch embedding:", err);
    return null;
  }
}
