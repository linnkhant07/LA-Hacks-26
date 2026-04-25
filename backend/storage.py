# storage.py

import os

def save_image(image, story_id, scene_id):
    folder = f"outputs/{story_id}"
    os.makedirs(folder, exist_ok=True)

    path = f"{folder}/scene_{scene_id}.png"
    image.save(path)

    return path