import { WebSocket } from 'ws';
import { VoiceMessage, StoryContext } from '@/types';

export abstract class BaseVoiceAgent {
  protected ws: WebSocket;
  protected isConnected: boolean = false;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.ws.on('open', () => {
      this.isConnected = true;
      this.sendMessage({
        type: 'connected',
        timestamp: Date.now()
      });
      this.onConnected();
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const message: VoiceMessage = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
        this.sendError('Invalid message format');
      }
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.onDisconnected();
    });

    this.ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.sendError('Connection error');
    });
  }

  protected sendMessage(message: VoiceMessage): void {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  protected sendError(error: string): void {
    this.sendMessage({
      type: 'error',
      content: error,
      timestamp: Date.now()
    });
  }

  protected sendResponse(content: string, context?: any): void {
    this.sendMessage({
      type: 'response',
      content,
      context,
      timestamp: Date.now()
    });
  }

  // Abstract methods to be implemented by specific agents
  protected abstract onConnected(): void;
  protected abstract onDisconnected(): void;
  protected abstract handleMessage(message: VoiceMessage): Promise<void>;

  // Common voice processing methods
  protected async processAudioInput(audioData: string): Promise<string> {
    // TODO: Implement ElevenLabs STT (Speech-to-Text)
    // For now, return placeholder
    return "I heard you say something! (STT not yet implemented)";
  }

  protected async generateResponse(input: string, context?: StoryContext): Promise<string> {
    // TODO: Implement Gemini AI response generation
    // For now, return placeholder based on context
    if (context) {
      return `Great question about ${context.topic}! I'm still learning how to give you the best answers. (AI response not yet implemented)`;
    }
    return "That's interesting! I'm still learning how to respond properly. (AI response not yet implemented)";
  }

  protected async generateAudio(text: string, voiceId?: string): Promise<string> {
    // TODO: Implement ElevenLabs TTS (Text-to-Speech)
    // Return empty string to fall back to browser speech synthesis
    return "";
  }

  public disconnect(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}