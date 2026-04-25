'use client';

const CHARACTER_EMOJI: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  bear: '🐻',
  custom: '🎤',
};

interface NarratorPanelProps {
  narration: string;
  character: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  onTalk: () => void;
}

// Shows narration text, narrator character, speak button, and mic button.
// onSpeak: re-reads narration via speechSynthesis (placeholder for ElevenLabs)
// onTalk: opens conversational AI (placeholder — console.log until Khant's work is ready)
export default function NarratorPanel({
  narration,
  character,
  isSpeaking,
  onSpeak,
  onTalk,
}: NarratorPanelProps) {
  const emoji = CHARACTER_EMOJI[character] ?? '🎤';

  return (
    <div className="flex gap-4 p-4 bg-gray-800 rounded-b-xl">
      {/* Character avatar */}
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
        {emoji}
      </div>

      {/* Narration text */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-base leading-relaxed">{narration}</p>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex flex-col gap-2">
        <button
          onClick={onSpeak}
          title="Re-read narration"
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${
            isSpeaking
              ? 'bg-blue-600 animate-pulse'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          🔊
        </button>
        <button
          onClick={onTalk}
          title="Talk to narrator"
          className="w-10 h-10 rounded-full bg-gray-600 hover:bg-green-700 flex items-center justify-center text-lg transition-colors"
        >
          🎙️
        </button>
      </div>
    </div>
  );
}
