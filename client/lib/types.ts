export interface Hotspot {
  object: string;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface StoryChoice {
  question: string;
  option_a: {
    label: string;
    pages: StoryPage[];
  };
  option_b: {
    label: string;
    pages: StoryPage[];
  };
}

export interface StoryPage {
  page_id: string;
  narration: string;
  image_prompt: string;
  image_url: string;       // Cloudinary URL (empty string in dev)
  audio_url: string;       // ElevenLabs URL (empty string in dev → use speechSynthesis)
  hotspots: Hotspot[];
  choice: StoryChoice | null;
}

export interface Narrator {
  type: 'animal' | 'custom';
  character: 'fox' | 'owl' | 'bear' | 'custom';
  voice_id: string;        // ElevenLabs voice_id
}

export interface CYUItem {
  type: 'voice' | 'drag' | 'draw';
  question: string;
}

export interface Story {
  _id?: string;            // MongoDB id, present after saving
  title: string;
  topic: string;
  narrator: Narrator;
  pages: StoryPage[];
  cyu: CYUItem[];
}

// Passed on every Gemini/AI call — keeps responses ADHD-aware and contextual
export interface StoryContext {
  topic: string;
  current_page: string;
  branch_taken: string | null;
  story_so_far: string;
  narrator_character: string;
  educational_facts_covered: string[];
  adhd_mode: true;
}
