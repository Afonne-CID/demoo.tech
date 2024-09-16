# app/api/endpoints.py
from fastapi import APIRouter, UploadFile, File
from app.modules.clothing import ClothingTryOn
from PIL import Image
import io
import base64

router = APIRouter()
clothing_tryon = ClothingTryOn()

def process_image(file: UploadFile):
    contents = file.file.read()
    image = Image.open(io.BytesIO(contents))
    return image

def encode_image_to_base64(image: Image.Image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@router.post("/try-on/clothing")
async def try_on_clothing(person_image: UploadFile = File(...), clothing_image: UploadFile = File(...)):
    person_img = await process_image(person_image)
    cloth_img = await process_image(clothing_image)
    
    result = clothing_tryon.try_on(person_img, cloth_img)
    
    return {"result": encode_image_to_base64(result)}
