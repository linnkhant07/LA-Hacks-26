'use client';

import { motion } from 'framer-motion';
import type { StoryChoice } from '@/lib/types';

interface ChoiceModalProps {
  choice: StoryChoice;
  onChoose: (branch: 'a' | 'b') => void;
}

// Full-screen overlay shown when the current page has a branching choice.
// Two big buttons — selecting one advances to that branch instantly (pre-loaded).
export default function ChoiceModal({ choice, onChoose }: ChoiceModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 text-center"
      >
        <p className="text-white text-xl font-semibold mb-8">{choice.question}</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onChoose('a')}
            className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-lg font-medium rounded-xl transition-all"
          >
            {choice.option_a.label}
          </button>
          <button
            onClick={() => onChoose('b')}
            className="w-full py-5 px-6 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-lg font-medium rounded-xl transition-all"
          >
            {choice.option_b.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
