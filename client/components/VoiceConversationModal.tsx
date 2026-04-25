'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceConversationModalProps {
  character: string;
  voiceConversation: {
    isConnected: boolean;
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    error: string | null;
    lastResponse: string | null;
    startListening: () => void;
    stopListening: () => void;
    sendText: (text: string) => void;
  };
  onClose: () => void;
}

const CHARACTER_EMOJI: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  bear: '🐻',
  parent: '❤️',
  custom: '🎤',
};

const CHARACTER_NAMES: Record<string, string> = {
  fox: 'Finn the Fox',
  owl: 'Ollie the Owl',
  bear: 'Bruno the Bear',
  parent: 'Your Parent',
  custom: 'Custom Voice',
};

export default function VoiceConversationModal({
  character,
  voiceConversation,
  onClose,
}: VoiceConversationModalProps) {
  const [textInput, setTextInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ type: 'user' | 'narrator'; text: string; timestamp: number }>
  >([]);

  const emoji = CHARACTER_EMOJI[character] ?? '🎤';
  const name = CHARACTER_NAMES[character] ?? 'Narrator';

  // Add responses to conversation history
  useEffect(() => {
    if (voiceConversation.lastResponse) {
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'narrator',
          text: voiceConversation.lastResponse!,
          timestamp: Date.now()
        }
      ]);
    }
  }, [voiceConversation.lastResponse]);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'user',
          text: textInput.trim(),
          timestamp: Date.now()
        }
      ]);
      voiceConversation.sendText(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const toggleListening = () => {
    if (voiceConversation.isListening) {
      voiceConversation.stopListening();
    } else {
      voiceConversation.startListening();
    }
  };

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
        className="bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{emoji}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">Talk to {name}</h3>
              <p className="text-sm text-gray-400">
                {voiceConversation.isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Connection Status */}
        {voiceConversation.error && (
          <div className="p-4 bg-red-900/30 border-b border-gray-700">
            <p className="text-red-400 text-sm">⚠️ {voiceConversation.error}</p>
          </div>
        )}

        {/* Conversation History */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0 space-y-3">
          {conversationHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">{emoji}</div>
              <p>Start a conversation by speaking or typing!</p>
              <p className="text-sm mt-2">
                Ask me about the story, characters, or anything you're curious about.
              </p>
            </div>
          ) : (
            conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))
          )}

          {voiceConversation.isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="animate-bounce">⚡</div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Status */}
        {voiceConversation.isListening && (
          <div className="px-4 py-2 bg-red-900/30 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <div className="animate-pulse">🔴</div>
              <span className="text-sm">Listening... Speak now!</span>
            </div>
          </div>
        )}

        {voiceConversation.isSpeaking && (
          <div className="px-4 py-2 bg-blue-900/30 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <div className="animate-pulse">🔊</div>
              <span className="text-sm">{name} is speaking...</span>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={voiceConversation.isProcessing}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || voiceConversation.isProcessing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>

          {/* Voice Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              disabled={!voiceConversation.isConnected || voiceConversation.isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${
                voiceConversation.isListening
                  ? 'bg-red-600 hover:bg-red-500 animate-pulse'
                  : voiceConversation.isConnected
                  ? 'bg-green-600 hover:bg-green-500 active:scale-95'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {voiceConversation.isListening ? '🔴' : '🎙️'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {voiceConversation.isListening
              ? 'Release to stop recording'
              : 'Hold to speak or type your message above'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}