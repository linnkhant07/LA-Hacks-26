export interface VoiceMessage {
  type: 'speak' | 'listen' | 'response' | 'error' | 'connected' | 'disconnected';
  content?: string;
  context?: any;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class VoiceWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private messageQueue: VoiceMessage[] = [];
  private listeners: Map<string, Set<(message: VoiceMessage) => void>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config
    };
  }

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected', { type: 'connected' });

          // Send queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) this.send(message);
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: VoiceMessage = JSON.parse(event.data);
            this.emit(message.type, message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.emit('disconnected', { type: 'disconnected' });
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.emit('error', { type: 'error', content: 'WebSocket connection error' });
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  send(message: VoiceMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      if (!this.isConnecting) {
        this.connect();
      }
    }
  }

  on(type: string, callback: (message: VoiceMessage) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  off(type: string, callback: (message: VoiceMessage) => void): void {
    this.listeners.get(type)?.delete(callback);
  }

  private emit(type: string, message: VoiceMessage): void {
    this.listeners.get(type)?.forEach(callback => callback(message));
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts!) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.connect().catch(console.error);
        }
      }, this.config.reconnectInterval);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.messageQueue.length = 0;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Narrator WebSocket client singleton
let narratorWS: VoiceWebSocket | null = null;

export function getNarratorWebSocket(): VoiceWebSocket {
  if (!narratorWS) {
    const wsUrl = process.env.NEXT_PUBLIC_NARRATOR_WS_URL || 'ws://localhost:3002/voice?agent=narrator';
    narratorWS = new VoiceWebSocket({ url: wsUrl });
  }
  return narratorWS;
}

// Onboarding WebSocket client singleton
let onboardingWS: VoiceWebSocket | null = null;

export function getOnboardingWebSocket(): VoiceWebSocket {
  if (!onboardingWS) {
    const wsUrl = process.env.NEXT_PUBLIC_ONBOARDING_WS_URL || 'ws://localhost:3002/voice?agent=onboarding';
    onboardingWS = new VoiceWebSocket({ url: wsUrl });
  }
  return onboardingWS;
}