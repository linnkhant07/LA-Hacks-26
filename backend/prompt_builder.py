# prompt_builder.py

def build_image_prompt(scene, style_guide, characters):
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