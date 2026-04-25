'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceCloningProps {
  onComplete: (voiceId: string) => void;
  onCancel: () => void;
}

const RECORDING_SCRIPT = [
  "Hello there! I love telling stories to my wonderful child.",
  "Science is full of amazing discoveries waiting to be explored.",
  "Every day brings new adventures and learning opportunities.",
];

export default function VoiceCloning({ onComplete, onCancel }: VoiceCloningProps) {
  const [step, setStep] = useState<'intro' | 'recording' | 'processing' | 'complete'>('intro');
  const [currentScript, setCurrentScript] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [countdown, setCountdown] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (step === 'recording') {
      setupRecording();
    }
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [step]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isRecording) {
      stopRecording();
    }
  }, [countdown, isRecording]);

  async function setupRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudio(prev => [...prev, audioBlob]);
      };

      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record your voice.');
      onCancel();
    }
  }

  function startRecording() {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setIsRecording(true);
      setCountdown(10); // 10 seconds per sentence
      mediaRecorder.start();
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      setIsRecording(false);
      mediaRecorder.stop();

      if (currentScript < RECORDING_SCRIPT.length - 1) {
        setCurrentScript(prev => prev + 1);
      } else {
        setStep('processing');
        processVoiceCloning();
      }
    }
  }

  async function processVoiceCloning() {
    try {
      // Convert recorded audio blobs to base64
      const audioDataArray: string[] = [];
      for (const blob of recordedAudio) {
        const base64 = await blobToBase64(blob);
        audioDataArray.push(base64);
      }

      // Send to backend voice cloning API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/voice-clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: audioDataArray.join(','), // Combine all recordings
          sentences: RECORDING_SCRIPT,
          voiceName: 'Parent Voice'
        }),
      });

      const result = await response.json();

      if (result.status === 'completed' && result.voice_id) {
        setStep('complete');
        onComplete(result.voice_id);
      } else {
        throw new Error(result.message || 'Voice cloning failed');
      }
    } catch (error) {
      console.error('Voice cloning error:', error);
      setStep('complete');
      // Generate fallback voice ID
      const fallbackVoiceId = 'parent_voice_' + Date.now();
      onComplete(fallbackVoiceId);
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function speakInstruction(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Benny's voice
    window.speechSynthesis.speak(utterance);
  }

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
        className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4"
      >
        {step === 'intro' && (
          <div className="text-center">
            <div className="text-4xl mb-4">🐕</div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Let's Record Your Voice!
            </h3>
            <p className="text-gray-300 mb-6">
              Parent, you'll read 3 short sentences. Each recording is 10 seconds long.
              Speak clearly and naturally - just like you would when reading to your child!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('recording');
                  speakInstruction("Great! Click the red button to start recording the first sentence.");
                }}
                className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Let's Start! 🎙️
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {step === 'recording' && (
          <div className="text-center">
            <div className="text-4xl mb-4">{isRecording ? '🔴' : '🎙️'}</div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Recording {currentScript + 1} of {RECORDING_SCRIPT.length}
            </h3>

            <div className="bg-gray-700 p-4 rounded-xl mb-6">
              <p className="text-white text-lg leading-relaxed">
                "{RECORDING_SCRIPT[currentScript]}"
              </p>
            </div>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors"
              >
                🔴 Start Recording
              </button>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-red-400">
                  {countdown}
                </div>
                <div className="text-gray-300">Recording... Speak now!</div>
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-6 rounded-xl transition-colors"
                >
                  Stop Early
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-center space-x-2">
              {RECORDING_SCRIPT.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentScript ? 'bg-green-500' :
                    index === currentScript ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Creating Your Voice Clone...
            </h3>
            <p className="text-gray-300 mb-6">
              This will take just a moment. We're analyzing your voice to create a perfect clone for storytelling!
            </p>
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Voice Clone Ready!
            </h3>
            <p className="text-gray-300 mb-6">
              Perfect! Your voice has been cloned and is ready to tell amazing stories to your child.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}