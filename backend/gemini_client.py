# gemini_client.py

from google import genai
from google.genai import types
import os

# os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ------------------------
# TEXT → STORY JSON
# ------------------------
def generate_story_json(user_prompt: str):
    system_prompt = """You are a children's story generator.

Return ONLY valid JSON. No explanation.

Schema:
{
  "story_id": "string",
  "style_guide": {
    "art_style": "string",
    "color_palette": "string",
    "lighting": "string"
  },
  "characters": [
    {
      "name": "string",
      "description": "string"
    }
  ],
  "scenes": [
    {
      "scene_id": 1,
      "text": "string",
      "visual": {
        "setting": "string",
        "characters": ["string"],
        "action": "string",
        "mood": "string",
        "time_of_day": "string"
      }
    }
  ]
}

User request: """ + user_prompt

    response = client.models.generate_content(
        model="gemini-3.1-pro-preview", # or "gemini-3.1-image-flash-preview" if you want to test image generation
        contents=system_prompt,
    )

    return response.text  # JSON string

# gemini_client.py (add this)

def generate_image(prompt: str):
    try:
        print(f"  [DEBUG] Calling Gemini image API...")
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                image_config=types.ImageConfig(
                    aspect_ratio="16:9",
                    image_size="2K"
                )
            )
        )

        print(f"  [DEBUG] Response type: {type(response)}")
        print(f"  [DEBUG] Has candidates: {hasattr(response, 'candidates')}")
        
        # Extract image - correct way to access response parts
        if response.candidates and len(response.candidates) > 0:
            print(f"  [DEBUG] Num candidates: {len(response.candidates)}")
            parts = response.candidates[0].content.parts
            print(f"  [DEBUG] Num parts: {len(parts)}")
            
            for i, part in enumerate(parts):
                print(f"  [DEBUG] Part {i}: {type(part).__name__}")
                print(f"  [DEBUG] Has inline_data: {hasattr(part, 'inline_data')}")
                
                if hasattr(part, 'inline_data') and part.inline_data:
                    print(f"  [DEBUG] ✓ Found inline_data, converting to image...")
                    image = part.as_image()
                    print(f"  [DEBUG] ✓ Image created: {type(image)}")
                    return image
        
        print(f"  [DEBUG] ✗ No inline_data found in response")
        return None
        
    except Exception as e:
        print(f"  [ERROR] Image generation failed: {e}")
        import traceback
        traceback.print_exc()
        return None