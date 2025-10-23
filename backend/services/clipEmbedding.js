import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

export async function computeClipEmbedding(imagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));

  try {
    const res = await fetch("http://localhost:8000/embed", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    console.log(`✅ Received embedding with ${json.dims} dimensions`);
    return json.embedding;
  } catch (err) {
    console.error("❌ Failed to fetch embedding:", err);
    return null;
  }
}
