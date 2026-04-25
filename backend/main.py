# main.py

import json
from gemini_client import generate_story_json, generate_image
from prompt_builder import build_image_prompt
from storage import save_image


def generate_full_story(user_prompt: str):
    # ------------------------
    # 1. Generate story JSON
    # ------------------------
    raw_json = generate_story_json(user_prompt)

    try:
        story = json.loads(raw_json)
    except:
        raise Exception("Invalid JSON from Gemini")

    story_id = story["story_id"]
    style_guide = story["style_guide"]
    characters = story["characters"]

    # ------------------------
    # 2. Generate images
    # ------------------------
    for scene in story["scenes"]:
        scene_id = scene["scene_id"]

        print(f"Generating image for scene {scene_id}...")

        # Build prompt
        prompt = build_image_prompt(scene, style_guide, characters)
        print(prompt)

        # Generate image
        image = generate_image(prompt)

        if image is None:
            print(f"Failed scene {scene_id}")
            continue

        # Save image
        path = save_image(image, story_id, scene_id)

        # Attach path to JSON
        scene["image_path"] = path

    return story

story = generate_full_story("A curious fox learns about gravity in a magical forest")
print(story)

'''
# main.py (add this at bottom)

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class StoryRequest(BaseModel):
    prompt: str


@app.post("/generate-story")
def generate_story(req: StoryRequest):
    story = generate_full_story(req.prompt)
    return story
'''