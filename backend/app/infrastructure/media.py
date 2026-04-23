import cloudinary
import cloudinary.uploader
from app.core.config import settings
import logging

# Configure cloudinary if URL is present
if settings.CLOUDINARY_URL and "api_key" not in settings.CLOUDINARY_URL:
    cloudinary.config(
        cloudinary_url=settings.CLOUDINARY_URL
    )

async def upload_image(file: any, folder: str = "fast-feast") -> str:
    try:
        if not settings.CLOUDINARY_URL or "api_key" in settings.CLOUDINARY_URL:
            return "https://via.placeholder.com/150"
            
        response = cloudinary.uploader.upload(file, folder=folder)
        return response.get("secure_url")
    except Exception as e:
        logging.error(f"Cloudinary upload failed: {e}")
        return "https://via.placeholder.com/150"
