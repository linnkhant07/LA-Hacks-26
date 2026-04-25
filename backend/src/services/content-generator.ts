import { Story, StoryPage } from '../types';
import cloudinary from 'cloudinary';
import axios from 'axios';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function generateAllContent(story: Story): Promise<void> {
  console.log(`Generating content for story: ${story._id}`);

  // Collect all pages including branch pages
  const allPages = getAllPages(story);

  // Generate images and audio in parallel
  const imagePromises = allPages.map(page => generatePageImage(page));
  const audioPromises = allPages.map(page => generatePageAudio(page, story.narrator.voice_id));

  try {
    await Promise.all([...imagePromises, ...audioPromises]);
    console.log(`✓ Generated all content for story ${story._id}`);
  } catch (error) {
    console.error(`Error generating content for story ${story._id}:`, error);
    throw error;
  }
}

function getAllPages(story: Story): StoryPage[] {
  const pages: StoryPage[] = [...story.pages];

  // Add pages from choices
  for (const page of story.pages) {
    if (page.choice) {
      pages.push(...page.choice.option_a.pages);
      pages.push(...page.choice.option_b.pages);
    }
  }

  return pages;
}

async function generatePageImage(page: StoryPage): Promise<void> {
  if (!page.image_prompt) {
    console.log(`Skipping image generation for page ${page.page_id} - no prompt`);
    return;
  }

  try {
    console.log(`Generating image for page ${page.page_id}...`);

    // For now, use placeholder images since Gemini image generation isn't ready
    // In production, you would use Gemini Imagen API or another image service
    const placeholderUrl = generatePlaceholderImage(page.page_id, page.image_prompt);

    page.image_url = placeholderUrl;
    console.log(`✓ Generated placeholder image for page ${page.page_id}`);

  } catch (error) {
    console.error(`Error generating image for page ${page.page_id}:`, error);
    page.image_url = 'https://placehold.co/800x500/cccccc/333333?text=Image+Error';
  }
}

async function generatePageAudio(page: StoryPage, voiceId: string): Promise<void> {
  if (!page.narration) {
    console.log(`Skipping audio generation for page ${page.page_id} - no narration`);
    return;
  }

  try {
    console.log(`Generating audio for page ${page.page_id}...`);

    // This would integrate with ElevenLabs TTS
    // For now, we'll set up the structure but leave the audio URL empty
    // The voice services will handle this when the story is played

    page.audio_url = ''; // Will be generated on-demand by voice services
    console.log(`✓ Prepared audio generation for page ${page.page_id}`);

  } catch (error) {
    console.error(`Error generating audio for page ${page.page_id}:`, error);
    page.audio_url = '';
  }
}

function generatePlaceholderImage(pageId: string, prompt: string): string {
  // Generate a more descriptive placeholder based on the prompt
  const keywords = extractKeywords(prompt);
  const emoji = getEmojiForKeywords(keywords);
  const encodedText = encodeURIComponent(`${emoji} ${pageId}`);

  return `https://placehold.co/800x500/4a90e2/ffffff?text=${encodedText}`;
}

function extractKeywords(prompt: string): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return prompt
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 3);
}

function getEmojiForKeywords(keywords: string[]): string {
  const emojiMap: { [key: string]: string } = {
    tornado: '🌪️',
    storm: '⛈️',
    wind: '💨',
    cloud: '☁️',
    pyramid: '🏛️',
    egypt: '🏜️',
    ancient: '🏺',
    desert: '🐪',
    pharaoh: '👑',
    fox: '🦊',
    owl: '🦉',
    bear: '🐻',
    narrator: '📚',
    story: '📖',
    adventure: '🗺️',
    learning: '🎓',
    education: '📚'
  };

  for (const keyword of keywords) {
    if (emojiMap[keyword]) {
      return emojiMap[keyword];
    }
  }

  return '📚'; // Default education emoji
}

export async function uploadImageToCloudinary(imageBuffer: Buffer, pageId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: `educ-ate/story-images/${pageId}`,
        overwrite: true,
        format: 'jpg',
        quality: 'auto:good',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          console.log(`✓ Uploaded image to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    ).end(imageBuffer);
  });
}