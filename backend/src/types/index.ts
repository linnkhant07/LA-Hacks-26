// Shared types with frontend
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
  image_url: string;
  audio_url: string;
  hotspots: Hotspot[];
  choice: StoryChoice | null;
}

export interface Narrator {
  type: 'animal' | 'custom';
  character: 'fox' | 'owl' | 'bear' | 'custom';
  voice_id: string;
}

export interface Story {
  _id?: string;
  title: string;
  topic: string;
  narrator: Narrator;
  pages: StoryPage[];
  cyu: CYUItem[];
}

export interface CYUItem {
  type: 'voice' | 'drag' | 'draw';
  question: string;
}

export interface StoryContext {
  topic: string;
  current_page: string;
  branch_taken: string | null;
  story_so_far: string;
  narrator_character: string;
  educational_facts_covered: string[];
  adhd_mode: true;
}

// Voice agent types
export interface VoiceMessage {
  type: 'speak' | 'listen' | 'response' | 'error' | 'connected' | 'disconnected';
  content?: string;
  context?: StoryContext;
  timestamp?: number;
  agent?: 'onboarding' | 'narrator' | 'voice_cloning';
}

export interface VoiceCloneRequest {
  audioData: string; // base64 encoded audio
  sentences: string[];
  voiceName: string;
}

export interface VoiceCloneResponse {
  voice_id: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
}

// Story generation types
export interface StoryGenerationRequest {
  topic: string;
  narrator: {
    character: string;
    voice_id?: string;
  };
}

export interface StoryGenerationResponse {
  story_id: string;
  status: 'processing' | 'completed' | 'failed';
  story?: Story;
  message?: string;
}