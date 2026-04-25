import { useState, useEffect, useCallback, useRef } from 'react';
import { getNarratorWebSocket, VoiceMessage } from './websocket';
import type { StoryContext } from './types';

interface VoiceConversationState {
  isConnected: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  error: string | null;
  lastResponse: string | null;
}

export interface VoiceConversationOptions {
  storyContext?: StoryContext;
  autoConnect?: boolean;
}

export function useVoiceConversation(options: VoiceConversationOptions = {}) {
  const [state, setState] = useState<VoiceConversationState>({
    isConnected: false,
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    error: null,
    lastResponse: null,
  });

  const wsRef = useRef(getNarratorWebSocket());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // WebSocket event handlers
  useEffect(() => {
    const ws = wsRef.current;

    const handleConnected = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    };

    const handleDisconnected = () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };

    const handleError = (message: VoiceMessage) => {
      setState(prev => ({
        ...prev,
        error: message.content || 'Connection error',
        isListening: false,
        isProcessing: false,
        isSpeaking: false
      }));
    };

    const handleResponse = (message: VoiceMessage) => {
      setState(prev => ({
        ...prev,
        lastResponse: message.content || null,
        isProcessing: false,
        isSpeaking: true
      }));

      // Play response audio if available
      if (message.content) {
        playResponseAudio(message.content);
      }
    };

    ws.on('connected', handleConnected);
    ws.on('disconnected', handleDisconnected);
    ws.on('error', handleError);
    ws.on('response', handleResponse);

    // Auto-connect if requested
    if (options.autoConnect !== false) {
      ws.connect().catch(console.error);
    }

    return () => {
      ws.off('connected', handleConnected);
      ws.off('disconnected', handleDisconnected);
      ws.off('error', handleError);
      ws.off('response', handleResponse);
    };
  }, [options.autoConnect]);

  const playResponseAudio = useCallback((text: string) => {
    // TODO: Replace with actual ElevenLabs audio playback
    // For now, use speech synthesis as fallback
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
      };
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to voice service' }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioToServer(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setState(prev => ({ ...prev, isListening: true, error: null }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Microphone access denied. Please allow microphone access to talk to the narrator.',
        isListening: false
      }));
    }
  }, [state.isConnected]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && state.isListening) {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isListening: false, isProcessing: true }));
    }
  }, [state.isListening]);

  const sendAudioToServer = useCallback((audioBlob: Blob) => {
    const ws = wsRef.current;

    // Convert blob to base64 for transmission
    const reader = new FileReader();
    reader.onload = () => {
      const audioData = reader.result as string;

      ws.send({
        type: 'speak',
        content: audioData.split(',')[1], // Remove data:audio/webm;base64, prefix
        context: options.storyContext,
        timestamp: Date.now()
      });
    };
    reader.readAsDataURL(audioBlob);
  }, [options.storyContext]);

  const sendText = useCallback((text: string) => {
    const ws = wsRef.current;

    if (!state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to voice service' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    ws.send({
      type: 'speak',
      content: text,
      context: options.storyContext,
      timestamp: Date.now()
    });
  }, [state.isConnected, options.storyContext]);

  const connect = useCallback(() => {
    return wsRef.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    wsRef.current.disconnect();
    setState({
      isConnected: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      error: null,
      lastResponse: null,
    });
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    sendText,
    connect,
    disconnect,
  };
}