import type { Story } from './types';

// Hardcoded fake tornado story — used by Dev 3 (frontend) until Angela's
// /api/generate is ready. 3 trunk pages, choice on page 3, each branch has 1 page.
export const fakeStory: Story = {
  _id: 'preview',
  title: 'The Incredible Journey of a Tornado',
  topic: 'tornadoes',
  narrator: {
    type: 'animal',
    character: 'fox',
    voice_id: '',
  },
  pages: [
    {
      page_id: 'p1',
      narration:
        "Hi there! I'm Finn the Fox, and today we're going on an incredible adventure to learn about one of nature's most powerful forces — the TORNADO! Did you know a tornado is a spinning column of air that connects a cloud way up in the sky all the way down to the ground? Let's find out how they're made!",
      image_prompt:
        'A wide open Kansas prairie at dusk, dramatic dark green sky in the background, a friendly cartoon fox wearing a small adventure hat standing in the foreground pointing excitedly at distant storm clouds, educational storybook illustration style',
      image_url: 'https://placehold.co/800x500/1a1a2e/white?text=🌪️+Tornado+Adventure+Begins!',
      audio_url: '',
      hotspots: [
        { object: 'storm clouds', bbox: [500, 50, 780, 200] },
        { object: 'fox', bbox: [80, 280, 280, 500] },
      ],
      choice: null,
    },
    {
      page_id: 'p2',
      narration:
        "Tornadoes are born inside giant thunderstorms called supercells! Here's the cool part: warm, wet air near the ground zooms upward really fast. Cold, dry air rushes in to fill the gap. When they meet — whoooosh — the air starts to SPIN! It's like when you swirl water in a bathtub. The spin gets tighter and tighter, stretching down from the cloud toward the ground. That spinning tube of air is a tornado!",
      image_prompt:
        'A cross-section diagram showing a supercell thunderstorm formation, with colorful arrows showing warm air rising and cold air descending, spinning air vortex forming, friendly cartoon style, educational illustration, bright colors with labels',
      image_url: 'https://placehold.co/800x500/0d1b2a/white?text=⚡+How+Tornadoes+Form',
      audio_url: '',
      hotspots: [
        { object: 'spinning vortex', bbox: [300, 150, 550, 450] },
        { object: 'warm air arrows', bbox: [50, 300, 300, 500] },
        { object: 'thunderstorm cloud', bbox: [200, 20, 650, 200] },
      ],
      choice: null,
    },
    {
      page_id: 'p3',
      narration:
        "Wow, now we know how tornadoes form! They can be tiny dust devils or MASSIVE storms over a mile wide. The strongest tornadoes — called EF5 — can have winds faster than 200 miles per hour! So what do you want to explore next? You can follow the tornado's path and see its incredible power, or visit the underground shelter where scientists keep people safe!",
      image_prompt:
        'A dramatic illustration showing a large tornado touching down on the left side, and an underground storm shelter entrance on the right side, two glowing path arrows pointing to each option, friendly storybook art style, warm golden lighting around the shelter',
      image_url: 'https://placehold.co/800x500/16213e/white?text=🌪️+Choose+Your+Path!',
      audio_url: '',
      hotspots: [
        { object: 'tornado funnel', bbox: [50, 80, 380, 480] },
        { object: 'storm shelter door', bbox: [460, 280, 750, 480] },
      ],
      choice: {
        question: 'Where do you want to explore?',
        option_a: {
          label: "Follow the tornado's path 🌪️",
          pages: [
            {
              page_id: 'p3a1',
              narration:
                "Following the tornado's path is AMAZING — but stay back, it's dangerous! The tornado's powerful winds can pick up cars, toss trees, and even lift houses right off the ground! Scientists called storm chasers drive specially armored trucks called Doppler on Wheels to get close and measure the tornado. All that data helps us give people more warning time to get safe. Tornadoes are scary, but science makes us safer!",
              image_prompt:
                'An armored storm chaser truck with radar equipment driving near a large tornado on a highway, dramatic golden-hour lighting, swirling debris in the air, a cartoon fox in the truck waving excitedly, educational adventure illustration style',
              image_url:
                'https://placehold.co/800x500/2d0b00/white?text=🚗+Storm+Chasers!',
              audio_url: '',
              hotspots: [
                { object: 'storm chaser truck', bbox: [400, 300, 750, 480] },
                { object: 'tornado', bbox: [50, 50, 380, 480] },
              ],
              choice: null,
            },
          ],
        },
        option_b: {
          label: 'Visit the tornado shelter 🏠',
          pages: [
            {
              page_id: 'p3b1',
              narration:
                "Underground storm shelters are like a superpower — they keep people safe even from the strongest tornadoes! The shelter is dug deep into the earth, with thick concrete walls and a heavy metal door. When the tornado sirens go off, families run here fast and stay until the storm passes. Meteorologists — that's what weather scientists are called — use Doppler radar to track tornadoes and send out warnings so everyone has time to reach safety!",
              image_prompt:
                'A cozy underground storm shelter interior with a family inside, concrete walls, emergency supplies on shelves, a small window showing a storm outside, a cartoon fox sitting with the family looking at a weather radar screen, warm comforting lighting, storybook illustration style',
              image_url:
                'https://placehold.co/800x500/0a1628/white?text=🏠+Safe+in+the+Shelter!',
              audio_url: '',
              hotspots: [
                { object: 'weather radar screen', bbox: [450, 200, 720, 400] },
                { object: 'emergency supplies', bbox: [50, 250, 300, 450] },
              ],
              choice: null,
            },
          ],
        },
      },
    },
  ],
  cyu: [
    { type: 'voice', question: 'What kind of storm do tornadoes come from?' },
    { type: 'drag', question: 'Put these tornado facts in order from smallest to largest!' },
    { type: 'draw', question: 'Draw what you think a tornado looks like from above!' },
  ],
};
