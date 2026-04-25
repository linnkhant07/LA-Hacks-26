'use client';

import { motion } from 'framer-motion';

interface CirclePopupProps {
  explanation: string;
  audioUrl?: string;
  onClose: () => void;
}

// Shown after a user circles something and the AI returns an explanation.
// In Phase 2: explanation comes from /api/circle + ElevenLabs speaks it.
// For now: just display the text.
export default function CirclePopup({ explanation, onClose }: CirclePopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full mx-4"
    >
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl">
        <p className="text-white text-sm leading-relaxed">{explanation}</p>
        <button
          onClick={onClose}
          className="mt-3 text-xs text-gray-400 hover:text-white underline"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
