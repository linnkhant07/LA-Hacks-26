import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { OnboardingAgent } from './services/voice-agents/onboarding-agent';
import { NarratorAgent } from './services/voice-agents/narrator-agent';
import { VoiceMessage } from './types';

interface WebSocketWithAgent extends WebSocket {
  agent?: OnboardingAgent | NarratorAgent;
  agentType?: 'onboarding' | 'narrator';
}

export class VoiceWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocketWithAgent> = new Set();

  constructor(port: number) {
    this.wss = new WebSocketServer({
      port,
      path: '/voice',
      verifyClient: this.verifyClient.bind(this)
    });

    this.setupWebSocketServer();
    console.log(`Voice WebSocket server listening on port ${port}`);
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // TODO: Implement proper origin verification in production
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    if (process.env.NODE_ENV === 'production') {
      return allowedOrigins.includes(info.origin);
    }

    return true; // Allow all origins in development
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocketWithAgent, req: IncomingMessage) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const agentType = url.searchParams.get('agent') as 'onboarding' | 'narrator';

      if (!agentType || !['onboarding', 'narrator'].includes(agentType)) {
        ws.close(1008, 'Invalid agent type. Use ?agent=onboarding or ?agent=narrator');
        return;
      }

      console.log(`New ${agentType} agent connection established`);

      // Create appropriate agent
      ws.agentType = agentType;
      if (agentType === 'onboarding') {
        ws.agent = new OnboardingAgent(ws);
      } else if (agentType === 'narrator') {
        ws.agent = new NarratorAgent(ws);
      }

      this.clients.add(ws);

      // Handle WebSocket events
      ws.on('close', () => {
        console.log(`${agentType} agent disconnected`);
        if (ws.agent) {
          ws.agent.disconnect();
        }
        this.clients.delete(ws);
      });

      ws.on('error', (error: Error) => {
        console.error(`WebSocket error for ${agentType} agent:`, error);
        this.clients.delete(ws);
      });

      // Send initial connection message
      this.sendToClient(ws, {
        type: 'connected',
        content: `${agentType} agent connected successfully`,
        timestamp: Date.now()
      });
    });

    this.wss.on('error', (error: Error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private sendToClient(ws: WebSocketWithAgent, message: VoiceMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public broadcastToAgentType(agentType: 'onboarding' | 'narrator', message: VoiceMessage): void {
    this.clients.forEach(client => {
      if (client.agentType === agentType && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  public getConnectedClients(): { onboarding: number; narrator: number; total: number } {
    let onboarding = 0;
    let narrator = 0;

    this.clients.forEach(client => {
      if (client.agentType === 'onboarding') onboarding++;
      else if (client.agentType === 'narrator') narrator++;
    });

    return {
      onboarding,
      narrator,
      total: this.clients.size
    };
  }

  public close(): void {
    this.clients.forEach(client => {
      if (client.agent) {
        client.agent.disconnect();
      }
      client.close();
    });

    this.wss.close();
    console.log('Voice WebSocket server closed');
  }
}