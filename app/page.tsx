'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Topic = 'tornadoes' | 'pyramids' | '';
type NarratorCharacter = 'fox' | 'owl' | 'bear' | '';

const TOPICS = [
  { id: 'tornadoes', label: 'Tornadoes', emoji: '🌪️', description: 'How spinning storms form and what makes them so powerful' },
  { id: 'pyramids', label: 'Pyramids', emoji: '🏛️', description: 'The ancient wonder built by the Egyptians thousands of years ago' },
] as const;

const NARRATORS = [
  { id: 'fox', label: 'Finn the Fox', emoji: '🦊' },
  { id: 'owl', label: 'Ollie the Owl', emoji: '🦉' },
  { id: 'bear', label: 'Bruno the Bear', emoji: '🐻' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic>('');
  const [narrator, setNarrator] = useState<NarratorCharacter>('');

  function handleStart() {
    if (!topic || !narrator) return;
    // TODO (Angela): POST /api/generate with { topic, narrator } and navigate to /story/:id
    // For now, always go to /story/preview which loads fakeStory
    router.push('/story/preview');
  }

  function handleVoiceUpload() {
    // TODO (Khant): wire up ElevenLabs Voice Cloning API
    console.log('voice upload clicked — ElevenLabs cloning not yet wired');
    alert("Parent voice upload coming soon! For now, pick an animal narrator.");
  }

  const canStart = topic !== '' && narrator !== '';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">educ-ATE</h1>
          <p className="mt-2 text-gray-400 text-lg">Pick a topic and a narrator to start your story!</p>
        </div>

        {/* Step 1: Topic */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
            1. What do you want to learn about?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`rounded-xl border-2 p-5 text-left transition-all ${
                  topic === t.id
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                }`}
              >
                <div className="text-4xl mb-2">{t.emoji}</div>
                <div className="font-semibold text-white">{t.label}</div>
                <div className="text-xs text-gray-400 mt-1">{t.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Narrator */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
            2. Who will tell your story?
          </h2>
          <div className="flex gap-3">
            {NARRATORS.map((n) => (
              <button
                key={n.id}
                onClick={() => setNarrator(n.id)}
                className={`flex-1 rounded-xl border-2 py-4 flex flex-col items-center gap-2 transition-all ${
                  narrator === n.id
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                }`}
              >
                <span className="text-3xl">{n.emoji}</span>
                <span className="text-sm font-medium">{n.label}</span>
              </button>
            ))}
          </div>

          {/* Parent voice upload */}
          <button
            onClick={handleVoiceUpload}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-700 py-4 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>🎤</span>
            <span>Or use a parent&apos;s voice (record 30 seconds)</span>
          </button>
        </section>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full py-5 rounded-2xl text-xl font-bold transition-all ${
            canStart
              ? 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          Create My Story ✨
        </button>

      </div>
    </div>
  );
}
