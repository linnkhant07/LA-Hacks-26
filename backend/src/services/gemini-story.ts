import { GoogleGenerativeAI } from '@google/generative-ai';
import { Story, StoryPage, Narrator, CYUItem, StoryContext } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeminiStoryResponse {
  story_id: string;
  title: string;
  style_guide: {
    art_style: string;
    color_palette: string;
    lighting: string;
  };
  characters: Array<{
    name: string;
    description: string;
  }>;
  scenes: Array<{
    scene_id: number;
    text: string;
    visual: {
      setting: string;
      characters: string[];
      action: string;
      mood: string;
      time_of_day: string;
    };
    choice?: {
      question: string;
      option_a: {
        label: string;
        scenes: Array<any>;
      };
      option_b: {
        label: string;
        scenes: Array<any>;
      };
    };
  }>;
}

export async function generateStoryJSON(topic: string, narrator: Narrator, context: StoryContext): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `You are a children's educational story generator for kids with ADHD.
Create interactive, engaging stories with branching choices and rich visuals.

Return ONLY valid JSON. No explanation.

Requirements:
- 4-6 main scenes with educational content about ${topic}
- Include 1-2 branching choice points
- Each choice leads to 2-3 additional scenes
- ADHD-friendly: short scenes, high engagement, interactive elements
- Educational facts woven naturally into the story
- Narrator character: ${narrator.character}

Schema:
{
  "story_id": "string",
  "title": "string (engaging title about ${topic})",
  "style_guide": {
    "art_style": "vibrant children's book illustration, detailed but not overwhelming",
    "color_palette": "bright, friendly colors suitable for children",
    "lighting": "warm, inviting lighting"
  },
  "characters": [
    {
      "name": "${narrator.character} (narrator)",
      "description": "friendly ${narrator.character} guide who explains ${topic}"
    }
  ],
  "scenes": [
    {
      "scene_id": 1,
      "text": "narrator introduces the topic in an exciting way",
      "visual": {
        "setting": "detailed scene description for image generation",
        "characters": ["${narrator.character}"],
        "action": "what's happening in the scene",
        "mood": "excited, curious",
        "time_of_day": "appropriate time"
      }
    }
  ]
}

Include branching choices after scene 2 or 3. Each choice should lead to 2-3 unique educational scenes.
Make the story interactive and educational about: ${topic}`;

  const response = await model.generateContent(systemPrompt);
  return response.response.text();
}

export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const enhancedPrompt = `Create a children's book illustration: ${prompt}

Style: Vibrant, colorful children's book illustration, digital art, friendly and approachable
Quality: High detail, professional children's book quality
Mood: Educational, engaging, fun for kids with ADHD
Format: Wide aspect ratio suitable for storybook pages`;

    console.log(`Generating image with Gemini...`);

    // Note: Gemini 1.5 Flash doesn't support image generation yet
    // For now, we'll return null and use Cloudinary for placeholder images
    console.warn('Gemini image generation not yet available, using placeholder');
    return null;

  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

export function convertToStoryModel(geminiData: GeminiStoryResponse, storyId: string, topic: string, narrator: Narrator): Story {
  const pages: StoryPage[] = [];

  // Convert main scenes
  if (geminiData.scenes) {
    for (const scene of geminiData.scenes) {
      const page: StoryPage = {
        page_id: `scene_${scene.scene_id}`,
        narration: scene.text,
        image_prompt: buildImagePrompt(scene.visual, geminiData.style_guide),
        image_url: '', // Will be populated by image generation
        audio_url: '', // Will be populated by voice service
        hotspots: [], // Could be generated based on scene content
        choice: scene.choice ? {
          question: scene.choice.question,
          option_a: {
            label: scene.choice.option_a.label,
            pages: scene.choice.option_a.scenes?.map((s: any, i: number) => ({
              page_id: `choice_a_${i + 1}`,
              narration: s.text || '',
              image_prompt: buildImagePrompt(s.visual, geminiData.style_guide),
              image_url: '',
              audio_url: '',
              hotspots: [],
              choice: null
            })) || []
          },
          option_b: {
            label: scene.choice.option_b.label,
            pages: scene.choice.option_b.scenes?.map((s: any, i: number) => ({
              page_id: `choice_b_${i + 1}`,
              narration: s.text || '',
              image_prompt: buildImagePrompt(s.visual, geminiData.style_guide),
              image_url: '',
              audio_url: '',
              hotspots: [],
              choice: null
            })) || []
          }
        } : null
      };
      pages.push(page);
    }
  }

  // Generate CYU items
  const cyuItems: CYUItem[] = [
    {
      type: 'voice',
      question: `What was the most interesting thing you learned about ${topic}?`
    },
    {
      type: 'draw',
      question: `Draw your favorite part of the ${topic} story!`
    }
  ];

  return {
    _id: storyId,
    title: geminiData.title || `Learning About ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    topic,
    narrator,
    pages,
    cyu: cyuItems
  };
}

function buildImagePrompt(visual: any, styleGuide: any): string {
  if (!visual) return '';

  const elements = [
    `Setting: ${visual.setting}`,
    visual.characters?.length ? `Characters: ${visual.characters.join(', ')}` : '',
    `Action: ${visual.action}`,
    `Mood: ${visual.mood}`,
    `Time: ${visual.time_of_day}`,
    `Style: ${styleGuide.art_style}`,
    `Colors: ${styleGuide.color_palette}`,
    `Lighting: ${styleGuide.lighting}`
  ].filter(Boolean);

  return elements.join(', ');
}