from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any

router = APIRouter()

@router.get("/health", summary="Health check endpoint")
async def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "face-recognition-backend"}

@router.post("/recognize", summary="Detect and recognize face from uploaded image")
async def recognize_face(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    
    # Ready for face recognition logic integration (e.g. face_recognition, insightface, opencv)
    return {
        "status": "success",
        "filename": file.filename,
        "content_type": file.content_type,
        "matches": []
    }
