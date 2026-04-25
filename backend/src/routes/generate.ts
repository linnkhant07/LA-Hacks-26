import { Router } from 'express';
import { StoryGenerationRequest, StoryGenerationResponse, Story, StoryContext } from '../types';
import { generateStoryJSON, convertToStoryModel } from '../services/gemini-story';
import { generateAllContent } from '../services/content-generator';
import { database } from '../config/database';

const router = Router();

// Generate complete story with all branches
router.post('/', async (req, res) => {
  try {
    const { topic, narrator }: StoryGenerationRequest = req.body;

    // Validate input
    if (!topic || !narrator || !narrator.character) {
      return res.status(400).json({
        status: 'failed',
        message: 'Missing required fields: topic and narrator.character'
      } as StoryGenerationResponse);
    }

    console.log(`Story generation request - Topic: ${topic}, Narrator: ${narrator.character}`);

    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create story context for Gemini
      const storyContext: StoryContext = {
        topic,
        current_page: '',
        branch_taken: null,
        story_so_far: '',
        narrator_character: narrator.character,
        educational_facts_covered: [],
        adhd_mode: true
      };

      // Generate story with Gemini
      console.log('Generating story with Gemini...');
      const rawStoryJSON = await generateStoryJSON(topic, narrator, storyContext);

      let geminiStoryData;
      try {
        geminiStoryData = JSON.parse(rawStoryJSON);
      } catch (jsonError) {
        console.error('Invalid JSON from Gemini, falling back to fake story');
        throw new Error('Invalid JSON from Gemini');
      }

      // Convert to our Story model
      const story = convertToStoryModel(geminiStoryData, storyId, topic, narrator);

      // Generate all images and prepare audio
      await generateAllContent(story);

      // Save to MongoDB
      try {
        const { _id, ...storyData } = story;
        const result = await database.getDb().collection('stories').insertOne({
          ...storyData
        } as any);
        console.log(`✓ Saved story to MongoDB: ${result.insertedId}`);
      } catch (dbError) {
        console.error('Failed to save story to MongoDB:', dbError);
        // Don't fail the request if DB save fails
      }

      const response: StoryGenerationResponse = {
        story_id: storyId,
        status: 'completed',
        story,
        message: 'Story generated successfully with Gemini!'
      };

      console.log(`✓ Story generated successfully: ${storyId}`);
      return res.json(response);

    } catch (geminiError: any) {
      console.error('Gemini service error:', geminiError.message);

      // Fallback to fake story if Gemini fails
      console.log('Falling back to fake story generation...');

      const story: Story = generateFakeStory(topic, narrator, storyId);

      const response: StoryGenerationResponse = {
        story_id: storyId,
        status: 'completed',
        story,
        message: 'Story generated successfully (fallback mode)!'
      };

      return res.json(response);
    }

  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({
      status: 'failed',
      message: 'Failed to generate story'
    } as StoryGenerationResponse);
  }
});

// Get generation status
router.get('/:storyId/status', async (req, res) => {
  try {
    const { storyId } = req.params;

    // Check if story exists in database
    const story = await database.getDb().collection('stories').findOne({ _id: storyId } as any);

    if (!story) {
      return res.status(404).json({
        story_id: storyId,
        status: 'failed',
        message: 'Story not found'
      } as StoryGenerationResponse);
    }

    const response: StoryGenerationResponse = {
      story_id: storyId,
      status: 'completed',
      story: story as unknown as Story,
      message: 'Story generation completed'
    };

    return res.json(response);

  } catch (error) {
    console.error('Error checking generation status:', error);
    return res.status(500).json({
      story_id: req.params.storyId || 'unknown',
      status: 'failed',
      message: 'Failed to check generation status'
    } as StoryGenerationResponse);
  }
});

function generateFakeStory(topic: string, narrator: any, storyId: string): Story {
  const storyData = {
    tornadoes: {
      title: "The Incredible Journey of a Tornado",
      pages: [
        {
          page_id: 'p1',
          narration: `Hi there! I'm ${getCharacterName(narrator.character)}, and today we're going on an incredible adventure to learn about one of nature's most powerful forces — the TORNADO! Did you know a tornado is a spinning column of air that connects a cloud way up in the sky all the way down to the ground? Let's find out how they're made!`,
          image_prompt: 'A wide open Kansas prairie at dusk, dramatic dark green sky in the background, friendly cartoon narrator character standing in the foreground pointing excitedly at distant storm clouds, educational storybook illustration style',
          image_url: 'https://placehold.co/800x500/1a1a2e/white?text=🌪️+Tornado+Adventure+Begins!',
          audio_url: '', // Will be filled by TTS
          hotspots: [
            { object: 'storm clouds', bbox: [500, 50, 780, 200] as [number, number, number, number] },
            { object: 'narrator', bbox: [80, 280, 280, 500] as [number, number, number, number] },
          ],
          choice: null,
        }
      ]
    },
    pyramids: {
      title: "Mysteries of the Ancient Pyramids",
      pages: [
        {
          page_id: 'p1',
          narration: `Hello, young explorer! I'm ${getCharacterName(narrator.character)}, and I'm thrilled to take you on a journey to ancient Egypt to discover the incredible PYRAMIDS! These amazing stone triangles have stood in the desert for over 4,000 years. Can you imagine how long ago that was? Let's uncover their secrets together!`,
          image_prompt: 'The Great Pyramid of Giza at sunset with friendly cartoon narrator character in the foreground, warm golden lighting, camels and palm trees in the background, educational storybook illustration style',
          image_url: 'https://placehold.co/800x500/2d1810/white?text=🏛️+Pyramid+Adventure+Begins!',
          audio_url: '', // Will be filled by TTS
          hotspots: [
            { object: 'pyramid', bbox: [200, 50, 600, 400] as [number, number, number, number] },
            { object: 'narrator', bbox: [50, 300, 200, 500] as [number, number, number, number] },
          ],
          choice: null,
        }
      ]
    }
  };

  const topicData = storyData[topic as keyof typeof storyData];
  if (!topicData) {
    throw new Error(`Unsupported topic: ${topic}`);
  }

  return {
    _id: storyId,
    title: topicData.title,
    topic,
    narrator: {
      type: narrator.character === 'custom' ? 'custom' : 'animal',
      character: narrator.character,
      voice_id: narrator.voice_id || ''
    },
    pages: topicData.pages,
    cyu: [
      { type: 'voice', question: `What kind of ${topic === 'tornadoes' ? 'storm' : 'building'} did we learn about?` },
      { type: 'draw', question: `Draw what you think a ${topic === 'tornadoes' ? 'tornado' : 'pyramid'} looks like!` },
    ]
  };
}

function getCharacterName(character: string): string {
  const names = {
    fox: 'Finn the Fox',
    owl: 'Ollie the Owl',
    bear: 'Bruno the Bear',
    parent: 'your parent',
    custom: 'your narrator'
  };
  return names[character as keyof typeof names] || 'your storyteller';
}

export default router;