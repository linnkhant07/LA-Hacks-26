# prompt_builder.py

from models.story_models import Narrator, StoryContext

def build_educational_story_prompt(topic: str, narrator: Narrator, context: StoryContext) -> str:
    """
    Build comprehensive Gemini prompt for educational story generation.
    Optimized for ADHD kids with branching choices and interactive elements.
    """

    narrator_personality = get_narrator_personality(narrator.character)

    return f"""
You are an expert children's educational story writer specializing in interactive stories for kids with ADHD.

TASK: Create a complete educational story about {topic} with the {narrator.character} narrator.

REQUIREMENTS:
- Target age: 6-12 years old with ADHD (short attention spans, need frequent engagement)
- Educational focus: {topic} with age-appropriate scientific facts
- Story structure: 3-4 main pages with 1 branching choice leading to 2 different endings
- Interactive elements: Include objects kids can click/circle in each scene
- Narrator voice: {narrator_personality}

STORY STRUCTURE TO GENERATE:
{{
  "title": "Educational title about {topic}",
  "pages": [
    {{
      "page_id": "p1",
      "narration": "Engaging introduction by {narrator.character} about {topic} (2-3 sentences, conversational)",
      "image_prompt": "Educational storybook illustration: [detailed scene description for {topic}]",
      "hotspots": [
        {{"object": "clickable_object_1", "bbox": [100, 100, 200, 200]}},
        {{"object": "clickable_object_2", "bbox": [300, 150, 450, 300]}}
      ],
      "choice": null
    }},
    {{
      "page_id": "p2",
      "narration": "Explain how {topic} works with simple science (2-3 sentences, exciting)",
      "image_prompt": "Educational illustration showing [scientific process of {topic}]",
      "hotspots": [...],
      "choice": null
    }},
    {{
      "page_id": "p3",
      "narration": "Present a choice about {topic} (1-2 sentences ending with question)",
      "image_prompt": "Split scene showing two different aspects of {topic}",
      "hotspots": [...],
      "choice": {{
        "question": "What would you like to explore about {topic}?",
        "option_a": {{
          "label": "Explore [aspect A] 🔬",
          "pages": [
            {{
              "page_id": "p3a1",
              "narration": "Deep dive into aspect A of {topic} (2-3 sentences, wonder-filled)",
              "image_prompt": "Detailed illustration of [aspect A of {topic}]",
              "hotspots": [...],
              "choice": null
            }}
          ]
        }},
        "option_b": {{
          "label": "Discover [aspect B] 🌟",
          "pages": [
            {{
              "page_id": "p3b1",
              "narration": "Exploration of aspect B of {topic} (2-3 sentences, encouraging)",
              "image_prompt": "Detailed illustration of [aspect B of {topic}]",
              "hotspots": [...],
              "choice": null
            }}
          ]
        }}
      }}
    }}
  ]
}}

NARRATION STYLE:
- Use {narrator.character} personality: {narrator_personality}
- Keep sentences short and exciting
- Include "wow" moments and questions to maintain engagement
- Use age-appropriate vocabulary but don't dumb down the science
- End with encouragement for curiosity

IMAGE PROMPT STYLE:
- "Educational storybook illustration in vibrant cartoon style"
- Include the {narrator.character} character in appropriate scenes
- Bright, engaging colors suitable for children
- Clear scientific accuracy in visual elements
- Composition: centered subjects, clean backgrounds, good for clicking/circling objects

HOTSPOT GUIDELINES:
- Each page should have 2-3 clickable objects
- Objects should be educationally relevant to {topic}
- Bounding boxes should be realistic for the described scene
- Objects kids would naturally be curious about

Return ONLY the JSON. No explanation or additional text.
"""

def build_image_prompt(base_prompt: str) -> str:
    """
    Enhance a basic image prompt for educational storybook style.
    Adds consistent styling for educ-ATE project.
    """
    return f"""
{base_prompt}

STYLE REQUIREMENTS:
- Educational children's storybook illustration
- Vibrant, friendly cartoon art style
- Bright engaging colors (not overstimulating)
- Soft edges and rounded shapes
- Clean composition with clear focal points
- Professional children's book quality
- 16:9 aspect ratio
- High detail but not cluttered

TECHNICAL:
- No text overlays or watermarks
- Suitable for interactive clicking/hotspots
- Clear object boundaries for AI recognition
- Warm, inviting lighting
- Child-friendly and educational focus
"""

def get_narrator_personality(character: str) -> str:
    """Get personality description for story narrator"""
    personalities = {
        "fox": "Clever, curious, and adventurous. Uses phrases like 'Let's discover!' and 'Isn't that amazing?' Often mentions exploring and being clever like a fox.",
        "owl": "Wise, thoughtful, and encouraging. Uses 'Hoot hoot!' and phrases like 'Let me share some wisdom' and 'Think about this carefully.' Emphasizes learning and wisdom.",
        "bear": "Gentle, strong, and protective. Uses warm, encouraging language like 'Stay close, little one' and 'Bears know that...' Emphasizes safety and strength.",
        "custom": "Warm, caring, and personally connected. Uses loving, familiar language appropriate for a parent or guardian. Emphasizes personal connection and care."
    }
    return personalities.get(character, personalities["custom"])

# Legacy function for backward compatibility
def build_image_prompt_legacy(scene, style_guide, characters):
    """Original function - kept for backward compatibility"""
    char_desc = [
        c["description"]
        for c in characters
        if c["name"] in scene["visual"]["characters"]
    ]

    return f"""
Children's storybook illustration.

Style:
{style_guide['art_style']}, {style_guide['color_palette']}, {style_guide['lighting']}

Characters:
{", ".join(char_desc)}

Scene:
{scene['visual']['setting']}, {scene['visual']['action']}

Mood:
{scene['visual']['mood']}

Time:
{scene['visual']['time_of_day']}

Composition:
soft edges, centered subject, cinematic framing

No text, no watermark.
"""