import { BaseVoiceAgent } from './base-agent';
import { VoiceMessage, StoryContext } from '@/types';

export class NarratorAgent extends BaseVoiceAgent {
  private character: string = 'fox';
  private voiceId?: string;
  private storyContext?: StoryContext;
  private lastEngagement: number = Date.now();
  private engagementTimer?: NodeJS.Timeout;

  protected onConnected(): void {
    console.log('Narrator agent connected');
    this.startEngagementTimer();
  }

  protected onDisconnected(): void {
    console.log('Narrator agent disconnected');
    this.stopEngagementTimer();
  }

  protected async handleMessage(message: VoiceMessage): Promise<void> {
    try {
      this.updateLastEngagement();

      switch (message.type) {
        case 'speak':
          if (message.content) {
            if (message.content.startsWith('data:audio/')) {
              // Audio input
              const transcript = await this.processAudioInput(message.content);
              await this.handleConversation(transcript, message.context);
            } else {
              // Text input
              await this.handleConversation(message.content, message.context);
            }
          }
          break;

        case 'listen':
          // User started listening (acknowledge)
          this.sendMessage({
            type: 'response',
            content: 'listening_acknowledged',
            timestamp: Date.now()
          });
          break;

        default:
          console.log(`Narrator agent received unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling narrator message:', error);
      this.sendError('I had trouble understanding that. Could you try asking again?');
    }
  }

  private async handleConversation(input: string, context?: StoryContext): Promise<void> {
    if (context) {
      this.storyContext = context;
      this.character = context.narrator_character;
    }

    // Generate contextual response based on the story and character
    const response = await this.generateContextualResponse(input, context);

    // Generate audio for the response
    const audioUrl = await this.generateAudio(response, this.voiceId);

    this.sendResponse(response, { audioUrl });
  }

  private async generateContextualResponse(input: string, context?: StoryContext): Promise<string> {
    const normalizedInput = input.toLowerCase().trim();

    // Handle common questions about the story
    if (normalizedInput.includes('what') && normalizedInput.includes('tornado')) {
      return this.getTornadoExplanation(normalizedInput);
    }

    if (normalizedInput.includes('what') && normalizedInput.includes('pyramid')) {
      return this.getPyramidExplanation(normalizedInput);
    }

    if (normalizedInput.includes('how') && context?.topic === 'tornadoes') {
      return this.getTornadoHowExplanation(normalizedInput);
    }

    if (normalizedInput.includes('why') && context?.topic === 'pyramids') {
      return this.getPyramidWhyExplanation(normalizedInput);
    }

    // General encouragement and engagement
    if (normalizedInput.includes('cool') || normalizedInput.includes('awesome') || normalizedInput.includes('wow')) {
      return this.getEncouragementResponse();
    }

    if (normalizedInput.includes('scared') || normalizedInput.includes('afraid')) {
      return this.getReassuranceResponse();
    }

    if (normalizedInput.includes('more') || normalizedInput.includes('tell me')) {
      return this.getMoreInfoResponse(context);
    }

    // Default response with character personality
    return this.getCharacterResponse(input, context);
  }

  private getTornadoExplanation(input: string): string {
    if (input.includes('supercell')) {
      return "A supercell is a special kind of thunderstorm that spins! Think of it like a giant washing machine in the sky. The warm air goes up, up, up, and the cold air rushes down, making everything spin around and around!";
    }

    return "Tornadoes are spinning columns of air that stretch from storm clouds all the way down to the ground! They're like nature's spinning tops, but MUCH bigger and more powerful!";
  }

  private getPyramidExplanation(input: string): string {
    if (input.includes('built') || input.includes('made')) {
      return "The ancient Egyptians built pyramids over 4,000 years ago! They used huge stone blocks, some as heavy as cars, and moved them without any trucks or cranes. Isn't that amazing?";
    }

    return "Pyramids are incredible triangle-shaped buildings that the ancient Egyptians built as tombs for their pharaohs - that's what they called their kings and queens!";
  }

  private getTornadoHowExplanation(input: string): string {
    return "Tornadoes form when warm, wet air meets cold, dry air in a thunderstorm. The warm air zooms up really fast, and the cold air rushes in to fill the space. All that moving air starts to spin, just like water going down a bathtub drain!";
  }

  private getPyramidWhyExplanation(input: string): string {
    return "The Egyptians built pyramids because they believed their pharaohs would need them in the afterlife! They filled them with treasures, food, and everything the pharaoh might need for their journey to the next world.";
  }

  private getEncouragementResponse(): string {
    const responses = [
      "I'm so glad you think it's cool! Science and history are full of amazing surprises!",
      "Right? Nature is absolutely incredible! There's so much to discover and learn!",
      "Your curiosity is wonderful! Keep asking questions - that's how we learn the coolest things!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getReassuranceResponse(): string {
    const responses = [
      "It's totally normal to feel that way! Remember, we're learning about these things to understand them better, and understanding helps us feel safer.",
      "You're very brave for learning about this! Scientists study these things so they can help keep people safe.",
      "That's okay to feel scared sometimes. But isn't it amazing how much people have learned to stay safe?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getMoreInfoResponse(context?: StoryContext): string {
    if (context?.topic === 'tornadoes') {
      return "There's so much more to learn! Did you know that scientists can predict where tornadoes might form? They use special radar to see inside storms!";
    } else if (context?.topic === 'pyramids') {
      return "The pyramids are full of secrets! Some have hidden chambers that we're still discovering today with special cameras and robots!";
    }

    return "There's always more to discover! What would you like to know more about?";
  }

  private getCharacterResponse(input: string, context?: StoryContext): string {
    const characterResponses = {
      fox: "That's a great question! Foxes like me love to explore and discover new things. What you're asking shows you're thinking like a true explorer!",
      owl: "Hoot hoot! As an owl, I love sharing wisdom. Your question shows you're really thinking deeply about this!",
      bear: "That's such a thoughtful question! Bears like me appreciate when someone takes time to really understand things.",
      parent: "What a wonderful question, sweetheart! I love how curious you are about the world around us."
    };

    return characterResponses[this.character as keyof typeof characterResponses] ||
           "That's a really interesting question! I love how curious you are!";
  }

  private updateLastEngagement(): void {
    this.lastEngagement = Date.now();
  }

  private startEngagementTimer(): void {
    // Check for inactivity every 10 seconds
    this.engagementTimer = setInterval(() => {
      const timeSinceLastEngagement = Date.now() - this.lastEngagement;

      // Re-engage after 30 seconds of inactivity (ADHD-aware)
      if (timeSinceLastEngagement > 30000) {
        this.sendProactiveEngagement();
        this.updateLastEngagement();
      }
    }, 10000);
  }

  private stopEngagementTimer(): void {
    if (this.engagementTimer) {
      clearInterval(this.engagementTimer);
      this.engagementTimer = undefined;
    }
  }

  private sendProactiveEngagement(): void {
    const engagementPrompts = [
      "Hey there! What do you think about what we just learned?",
      "I'm curious - what's the most interesting thing so far?",
      "Want to know something really cool about this?",
      "What questions are popping into your head right now?",
      "Are you ready to discover something amazing?"
    ];

    const prompt = engagementPrompts[Math.floor(Math.random() * engagementPrompts.length)];

    this.sendMessage({
      type: 'response',
      content: prompt,
      timestamp: Date.now()
    });
  }

  public setCharacter(character: string, voiceId?: string): void {
    this.character = character;
    this.voiceId = voiceId;
  }
}