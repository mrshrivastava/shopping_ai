# clip_service.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import io

app = FastAPI(title="CLIP Embedding Service")

# Load model and processor
print("🔄 Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print("✅ CLIP model loaded.")

@app.post("/embed")
async def embed_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            image_features = model.get_image_features(**inputs)
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)

        embedding = image_features[0].tolist()
        return JSONResponse({"embedding": embedding, "dims": len(embedding)})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
