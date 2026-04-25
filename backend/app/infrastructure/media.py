import cloudinary
import cloudinary.uploader
from app.core.config import settings
import logging
import os
import re

# Helper to parse Cloudinary URL manually if needed
def configure_cloudinary():
    if not settings.CLOUDINARY_URL:
        return

    # Standard format: cloudinary://api_key:api_secret@cloud_name
    pattern = r"cloudinary://([^:]+):([^@]+)@(.+)"
    match = re.match(pattern, settings.CLOUDINARY_URL)
    
    if match:
        api_key = match.group(1)
        api_secret = match.group(2)
        cloud_name = match.group(3)
        
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        logging.info(f"Cloudinary configured manually for cloud: {cloud_name}")
    else:
        # Fallback to automatic parsing
        os.environ["CLOUDINARY_URL"] = settings.CLOUDINARY_URL
        cloudinary.config(secure=True)
        logging.info("Cloudinary configured via environment variable")

# Initialize configuration
configure_cloudinary()

async def upload_image(file: any, folder: str = "fast-feast") -> str:
    logger = logging.getLogger("fastapi")
    
    if not settings.CLOUDINARY_URL or "api_key" in settings.CLOUDINARY_URL:
        logger.warning("Cloudinary URL is invalid or using placeholder.")
        return "https://via.placeholder.com/150"

    try:
        # Uploading spooled file directly
        response = cloudinary.uploader.upload(
            file, 
            folder=folder,
            resource_type="auto"
        )
        url = response.get("secure_url")
        if url:
            logger.info(f"Image uploaded successfully: {url}")
            return url
        return "https://via.placeholder.com/150"
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        return "https://via.placeholder.com/150"
