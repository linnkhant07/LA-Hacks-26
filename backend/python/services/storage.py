# storage.py

import os
import cloudinary
import cloudinary.uploader
from io import BytesIO
from typing import Optional

# Configure Cloudinary (get credentials from environment)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_to_cloudinary(image, page_id: str, folder: str = "educ-ate/stories") -> str:
    """
    Upload PIL image to Cloudinary and return public URL.
    Replaces local storage with cloud storage for production.
    """
    try:
        # Convert PIL image to bytes
        img_bytes = BytesIO()
        image.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            img_bytes.getvalue(),
            folder=folder,
            public_id=f"page_{page_id}_{os.urandom(4).hex()}",
            format="png",
            quality="auto",
            fetch_format="auto"
        )

        print(f"✓ Uploaded image for page {page_id}: {result['secure_url']}")
        return result["secure_url"]

    except Exception as e:
        print(f"✗ Cloudinary upload failed for page {page_id}: {e}")
        # Fallback to local storage
        return save_image_local(image, "fallback", page_id)

def save_image_local(image, story_id: str, scene_id: str) -> str:
    """
    Fallback local storage (for development/testing).
    Original function preserved for local development.
    """
    folder = f"../outputs/{story_id}"
    os.makedirs(folder, exist_ok=True)

    path = f"{folder}/scene_{scene_id}.png"
    image.save(path)

    print(f"✓ Saved image locally: {path}")
    return path

# Backward compatibility
def save_image(image, story_id, scene_id):
    """Legacy function - now uses Cloudinary by default"""
    return upload_to_cloudinary(image, scene_id, f"educ-ate/stories/{story_id}")