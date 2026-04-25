'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fakeStory } from '@/lib/fakeStory';
import type { StoryPage } from '@/lib/types';
import StoryViewer from '@/components/StoryViewer';
import IllustrationPanel from '@/components/IllustrationPanel';
import NarratorPanel from '@/components/NarratorPanel';
import ChoiceModal from '@/components/ChoiceModal';
import CirclePopup from '@/components/CirclePopup';

// TODO (Angela): replace fakeStory with fetch(`/api/story/${params.id}`) when ready
// The id 'preview' is used by the onboarding page before API is wired up.

interface PageProps {
  params: { id: string };
}

export default function StoryPage({ params }: PageProps) {
  const story = fakeStory; // swap for real fetch later

  // Flat list of pages — grows when a branch is chosen
  const [pages, setPages] = useState<StoryPage[]>(story.pages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [showChoice, setShowChoice] = useState(false);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [circleExplanation, setCircleExplanation] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentPage = pages[currentIndex];

  // ── Speech synthesis (placeholder for ElevenLabs TTS) ─────────────────────
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  // Auto-speak when page changes
  useEffect(() => {
    if (currentPage.audio_url) {
      // TODO (Khant): play ElevenLabs audio_url instead
    } else {
      speak(currentPage.narration);
    }
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, [currentPage, speak]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  function goNext() {
    window.speechSynthesis?.cancel();

    // If current page has an unchosen branch (nothing after it), show choice modal
    if (currentPage.choice && currentIndex === pages.length - 1) {
      setShowChoice(true);
      return;
    }

    if (currentIndex < pages.length - 1) {
      setSlideDir(1);
      setCurrentIndex((i) => i + 1);
      setDrawEnabled(false);
      setCircleExplanation(null);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      window.speechSynthesis?.cancel();
      setSlideDir(-1);
      setCurrentIndex((i) => i - 1);
      setDrawEnabled(false);
      setCircleExplanation(null);
    }
  }

  // ── Choice branching ────────────────────────────────────────────────────────
  function handleChoice(branch: 'a' | 'b') {
    const chosen =
      branch === 'a'
        ? currentPage.choice!.option_a
        : currentPage.choice!.option_b;

    // Splice chosen branch pages in after the current choice page
    setPages((prev) => [...prev.slice(0, currentIndex + 1), ...chosen.pages]);
    setSlideDir(1);
    setCurrentIndex((i) => i + 1);
    setShowChoice(false);
    setDrawEnabled(false);
    setCircleExplanation(null);
  }

  // ── Circle / draw ───────────────────────────────────────────────────────────
  function handleCircleSubmit(dataUrl: string) {
    // TODO (Phase 2): POST /api/circle with { image: dataUrl, context }
    // For now: show a placeholder explanation
    console.log('circle submitted (sending to /api/circle in Phase 2)', dataUrl.slice(0, 60));
    setDrawEnabled(false);
    setCircleExplanation(
      "Great question! That's part of the tornado story. In Phase 2, the AI will explain exactly what you circled!"
    );
  }

  // ── Talk to character ───────────────────────────────────────────────────────
  function handleTalk() {
    // TODO (Khant): open ElevenLabs Conversational AI WebSocket
    console.log('talk clicked — ElevenLabs Conversational AI not yet wired');
    speak("Hey there! I can hear you! Once our voice system is ready I'll be able to chat with you for real!");
  }

  // ── Keyboard nav (nice to have) ────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const isLastPage = currentIndex === pages.length - 1 && !currentPage.choice;

  return (
    <StoryViewer title={story.title}>
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">

        {/* Page counter */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
          <span>Page {currentIndex + 1} / {pages.length}</span>
          <span>{story.narrator.character} {story.topic}</span>
        </div>

        {/* Illustration with animated page transition */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage.page_id}
              initial={{ opacity: 0, x: slideDir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDir * -60 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <IllustrationPanel
                imageUrl={currentPage.image_url}
                alt={currentPage.image_prompt}
                drawEnabled={drawEnabled}
                onCircleSubmit={handleCircleSubmit}
              />
            </motion.div>
          </AnimatePresence>

          {/* Circle explanation popup */}
          <AnimatePresence>
            {circleExplanation && (
              <CirclePopup
                explanation={circleExplanation}
                onClose={() => setCircleExplanation(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Narration + narrator controls */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage.page_id + '_narration'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            <NarratorPanel
              narration={currentPage.narration}
              character={story.narrator.character}
              isSpeaking={isSpeaking}
              onSpeak={() => speak(currentPage.narration)}
              onTalk={handleTalk}
            />
          </motion.div>
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-4 gap-3">

          {/* Left: previous */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            ← Previous
          </button>

          {/* Center: draw toggle */}
          <button
            onClick={() => {
              setDrawEnabled((d) => !d);
              setCircleExplanation(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              drawEnabled
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {drawEnabled ? '✏️ Drawing mode ON' : '✏️ Circle something'}
          </button>

          {/* Right: next / choose path */}
          {isLastPage ? (
            <div className="px-5 py-2 text-sm text-gray-500">The End 🎉</div>
          ) : currentPage.choice && currentIndex === pages.length - 1 ? (
            <button
              onClick={() => setShowChoice(true)}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              Choose path →
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={currentIndex >= pages.length - 1 && !currentPage.choice}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Next →
            </button>
          )}
        </div>

      </div>

      {/* Choice modal — full screen overlay */}
      <AnimatePresence>
        {showChoice && currentPage.choice && (
          <ChoiceModal choice={currentPage.choice} onChoose={handleChoice} />
        )}
      </AnimatePresence>
    </StoryViewer>
  );
}
