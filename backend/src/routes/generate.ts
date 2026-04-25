import { Router } from 'express';
import axios from 'axios';
import { StoryGenerationRequest, StoryGenerationResponse, Story } from '@/types';

const router = Router();

// Python service URL
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

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

    // Call Python story generation service
    try {
      const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/generate-story`, {
        topic,
        narrator
      }, {
        timeout: 60000, // 60 seconds for story generation
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response: StoryGenerationResponse = pythonResponse.data;

      // TODO: Save to MongoDB if successful
      if (response.status === 'completed' && response.story) {
        // await database.getDb().collection('stories').insertOne(response.story);
        console.log(`✓ Story generated successfully: ${response.story_id}`);
      }

      res.json(response);

    } catch (pythonError: any) {
      console.error('Python service error:', pythonError.message);

      // Fallback to fake story if Python service fails
      console.log('Falling back to fake story generation...');

      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const story: Story = generateFakeStory(topic, narrator, storyId);

      const response: StoryGenerationResponse = {
        story_id: storyId,
        status: 'completed',
        story,
        message: 'Story generated successfully (fallback mode)!'
      };

      res.json(response);
    }

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Failed to generate story'
    } as StoryGenerationResponse);
  }
});

// Get generation status
router.get('/:storyId/status', async (req, res) => {
  try {
    const { storyId } = req.params;

    // TODO: Check actual generation status from database
    const response: StoryGenerationResponse = {
      story_id: storyId,
      status: 'completed',
      message: 'Story generation completed'
    };

    res.json(response);

  } catch (error) {
    console.error('Error checking generation status:', error);
    res.status(500).json({
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
            { object: 'storm clouds', bbox: [500, 50, 780, 200] },
            { object: 'narrator', bbox: [80, 280, 280, 500] },
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
            { object: 'pyramid', bbox: [200, 50, 600, 400] },
            { object: 'narrator', bbox: [50, 300, 200, 500] },
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