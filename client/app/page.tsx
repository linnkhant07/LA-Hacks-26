'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import VoiceCloning from '@/components/VoiceCloning';

type Topic = 'tornadoes' | 'pyramids' | '';
type NarratorCharacter = 'fox' | 'owl' | 'bear' | 'parent' | '';
type VoiceOption = 'animal' | 'parent' | null;

const TOPICS = [
  { id: 'tornadoes', label: 'Tornadoes', emoji: '🌪️', description: 'How spinning storms form and what makes them so powerful' },
  { id: 'pyramids', label: 'Pyramids', emoji: '🏛️', description: 'The ancient wonder built by the Egyptians thousands of years ago' },
] as const;

const NARRATORS = [
  { id: 'fox', label: 'Finn the Fox', emoji: '🦊' },
  { id: 'owl', label: 'Ollie the Owl', emoji: '🦉' },
  { id: 'bear', label: 'Bruno the Bear', emoji: '🐻' },
] as const;

const PARENT_NARRATOR = { id: 'parent', label: "Parent's Voice", emoji: '❤️' };

export default function OnboardingPage() {
  const router = useRouter();
  const [voiceOption, setVoiceOption] = useState<VoiceOption>(null);
  const [showVoiceCloning, setShowVoiceCloning] = useState(false);
  const [parentVoiceId, setParentVoiceId] = useState<string>('');
  const [topic, setTopic] = useState<Topic>('');
  const [narrator, setNarrator] = useState<NarratorCharacter>('');
  const [bennySpoke, setBennySpoke] = useState(false);

  // Benny speaks welcome message
  useEffect(() => {
    if (!bennySpoke) {
      setBennySpoke(true);
      speakAsBenny("Woof! Hi there! I'm Benny the Corgi! Would you like to use your parent's voice for your story, or pick an animal friend?");
    }
  }, [bennySpoke]);

  function speakAsBenny(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }

  function handleVoiceOptionSelect(option: VoiceOption) {
    setVoiceOption(option);
    if (option === 'parent') {
      setShowVoiceCloning(true);
      speakAsBenny("Great! Let's record your parent's voice. Parent, please click the record button and say the sentences clearly.");
    } else {
      speakAsBenny("Perfect! Now, what do you want to learn about today?");
    }
  }

  function handleVoiceCloned(voiceId: string) {
    setParentVoiceId(voiceId);
    setShowVoiceCloning(false);
    setNarrator('parent');
    speakAsBenny("Amazing! Your parent's voice is ready. Now, what would you like to learn about?");
  }

  function handleTopicSelect(selectedTopic: Topic) {
    setTopic(selectedTopic);
    const topicData = TOPICS.find(t => t.id === selectedTopic);
    if (voiceOption === 'parent') {
      speakAsBenny(`${topicData?.label} sounds fascinating! Your parent will tell you this amazing story!`);
    } else {
      speakAsBenny(`${topicData?.label} sounds exciting! Who should tell your story?`);
    }
  }

  function handleNarratorSelect(selectedNarrator: NarratorCharacter) {
    setNarrator(selectedNarrator);
    const narratorData = NARRATORS.find(n => n.id === selectedNarrator);
    if (narratorData) {
      speakAsBenny(`${narratorData.label} is a wonderful storyteller! Ready to start your adventure?`);
    }
  }

  async function handleStart() {
    if (!topic || !narrator) return;

    speakAsBenny("Off we go on an amazing adventure! Have fun learning!");

    try {
      // Generate story using backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          narrator: {
            character: narrator,
            voice_id: narrator === 'parent' ? parentVoiceId : undefined
          }
        }),
      });

      const result = await response.json();

      if (result.status === 'completed' && result.story_id) {
        router.push(`/story/${result.story_id}`);
      } else {
        console.warn('Story generation failed, using preview story:', result.message);
        router.push('/story/preview');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      // Fallback to preview story
      router.push('/story/preview');
    }
  }

  const canStart = voiceOption !== null && topic !== '' && narrator !== '';
  const showContent = voiceOption !== null && !showVoiceCloning;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-10">

        {/* Header with Benny */}
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐕</div>
          <h1 className="text-4xl font-bold tracking-tight">educ-ATE</h1>
          <p className="mt-2 text-gray-400 text-lg">Hi! I'm Benny the Corgi, your learning guide!</p>
        </div>

        {/* Voice Option Selection */}
        {voiceOption === null && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Would you like to use your parent's voice or choose an animal friend?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => handleVoiceOptionSelect('parent')}
                className="flex-1 rounded-xl border-2 border-gray-700 bg-gray-900 hover:border-pink-500 hover:bg-pink-900/30 p-6 transition-all"
              >
                <div className="text-4xl mb-2">❤️</div>
                <div className="font-semibold text-white">Parent's Voice</div>
                <div className="text-xs text-gray-400 mt-1">Record your parent's voice</div>
              </button>
              <button
                onClick={() => handleVoiceOptionSelect('animal')}
                className="flex-1 rounded-xl border-2 border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-blue-900/30 p-6 transition-all"
              >
                <div className="text-4xl mb-2">🦊</div>
                <div className="font-semibold text-white">Animal Friend</div>
                <div className="text-xs text-gray-400 mt-1">Choose a fun character</div>
              </button>
            </div>
          </motion.section>
        )}

        {/* Step 1: Topic */}
        {showContent && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              🐕 What do you want to learn about?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicSelect(t.id)}
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
          </motion.section>
        )}

        {/* Step 2: Narrator */}
        {showContent && voiceOption === 'animal' && topic && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              🐕 Who will tell your story?
            </h2>
            <div className="flex gap-3">
              {NARRATORS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNarratorSelect(n.id)}
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
          </motion.section>
        )}

        {/* Parent Voice Confirmation */}
        {showContent && voiceOption === 'parent' && topic && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              🐕 Your parent will tell your story!
            </h2>
            <div className="rounded-xl border-2 border-pink-500 bg-pink-900/30 p-6">
              <span className="text-4xl mb-2 block">❤️</span>
              <span className="text-lg font-medium text-white">Parent's Voice Ready</span>
            </div>
          </motion.section>
        )}

        {/* CTA */}
        {showContent && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-5 rounded-2xl text-xl font-bold transition-all ${
              canStart
                ? 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            🐕 Let's Start the Adventure! ✨
          </motion.button>
        )}

        {/* Voice Cloning Modal */}
        <AnimatePresence>
          {showVoiceCloning && (
            <VoiceCloning
              onComplete={handleVoiceCloned}
              onCancel={() => {
                setShowVoiceCloning(false);
                setVoiceOption(null);
                speakAsBenny("No problem! You can choose an animal friend instead.");
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
