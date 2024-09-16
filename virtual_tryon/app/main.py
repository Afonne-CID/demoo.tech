from fastapi import FastAPI
from app.api.endpoints import router as clothing_router

app = FastAPI(title="Virtual Try-On Service", version="1.0.0")

app.include_router(clothing_router, prefix="/api/v1", tags=["clothing"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Virtual Try-On Service"}
