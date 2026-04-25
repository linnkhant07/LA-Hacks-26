import { BaseVoiceAgent } from './base-agent';
import { VoiceMessage } from '@/types';

export class OnboardingAgent extends BaseVoiceAgent {
  private currentStep: 'welcome' | 'voice_choice' | 'topic' | 'narrator' | 'complete' = 'welcome';
  private userChoices: {
    voiceOption?: 'animal' | 'parent';
    topic?: string;
    narrator?: string;
    parentVoiceId?: string;
  } = {};

  protected onConnected(): void {
    console.log('Onboarding agent connected');
    // Send welcome message
    this.sendResponse(
      "Woof! Hi there! I'm Benny the Corgi! Would you like to use your parent's voice for your story, or pick an animal friend?"
    );
  }

  protected onDisconnected(): void {
    console.log('Onboarding agent disconnected');
  }

  protected async handleMessage(message: VoiceMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'speak':
          if (message.content) {
            if (message.content.startsWith('data:audio/')) {
              // Audio input
              const transcript = await this.processAudioInput(message.content);
              await this.handleUserInput(transcript);
            } else {
              // Text input
              await this.handleUserInput(message.content);
            }
          }
          break;

        case 'listen':
          // User wants to start listening (no action needed, handled by frontend)
          break;

        default:
          console.log(`Onboarding agent received unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling onboarding message:', error);
      this.sendError('Failed to process your request. Please try again.');
    }
  }

  private async handleUserInput(input: string): Promise<void> {
    const normalizedInput = input.toLowerCase().trim();

    switch (this.currentStep) {
      case 'welcome':
        await this.handleVoiceChoice(normalizedInput);
        break;

      case 'voice_choice':
        await this.handleTopicChoice(normalizedInput);
        break;

      case 'topic':
        await this.handleNarratorChoice(normalizedInput);
        break;

      case 'narrator':
        await this.completeOnboarding();
        break;

      default:
        this.sendResponse("I'm not sure what you need help with right now. Let's start over!");
        this.currentStep = 'welcome';
    }
  }

  private async handleVoiceChoice(input: string): Promise<void> {
    if (input.includes('parent') || input.includes('mom') || input.includes('dad')) {
      this.userChoices.voiceOption = 'parent';
      this.currentStep = 'voice_choice';
      this.sendResponse(
        "Great choice! Your parent's voice will make the story extra special. Now, what would you like to learn about today? Say 'tornadoes' or 'pyramids'!"
      );
    } else if (input.includes('animal') || input.includes('friend') || input.includes('character')) {
      this.userChoices.voiceOption = 'animal';
      this.currentStep = 'topic';
      this.sendResponse(
        "Perfect! Animal friends are wonderful storytellers. What would you like to learn about? Say 'tornadoes' to learn about spinning storms, or 'pyramids' to discover ancient wonders!"
      );
    } else {
      this.sendResponse(
        "I didn't quite catch that! Would you like to use your parent's voice, or choose an animal friend to tell your story?"
      );
    }
  }

  private async handleTopicChoice(input: string): Promise<void> {
    if (input.includes('tornado') || input.includes('storm') || input.includes('wind')) {
      this.userChoices.topic = 'tornadoes';
      await this.proceedToNarratorOrComplete();
    } else if (input.includes('pyramid') || input.includes('egypt') || input.includes('ancient')) {
      this.userChoices.topic = 'pyramids';
      await this.proceedToNarratorOrComplete();
    } else {
      this.sendResponse(
        "That sounds interesting! For now, I can help you learn about 'tornadoes' or 'pyramids'. Which one sounds more exciting to you?"
      );
    }
  }

  private async proceedToNarratorOrComplete(): Promise<void> {
    if (this.userChoices.voiceOption === 'parent') {
      // Skip narrator selection for parent voice
      this.currentStep = 'complete';
      this.sendResponse(
        `${this.userChoices.topic === 'tornadoes' ? 'Tornadoes' : 'Pyramids'} - what an amazing choice! Your parent will tell you this fascinating story. Get ready for an incredible learning adventure!`
      );
      await this.completeOnboarding();
    } else {
      // Animal narrator selection
      this.currentStep = 'narrator';
      this.sendResponse(
        `${this.userChoices.topic === 'tornadoes' ? 'Tornadoes' : 'Pyramids'} - exciting! Now, who should tell your story? Say 'fox' for Finn the Fox, 'owl' for Ollie the Owl, or 'bear' for Bruno the Bear!`
      );
    }
  }

  private async handleNarratorChoice(input: string): Promise<void> {
    if (input.includes('fox') || input.includes('finn')) {
      this.userChoices.narrator = 'fox';
      this.sendResponse("Finn the Fox is a wonderful storyteller! Get ready for an amazing adventure!");
      await this.completeOnboarding();
    } else if (input.includes('owl') || input.includes('ollie')) {
      this.userChoices.narrator = 'owl';
      this.sendResponse("Ollie the Owl is very wise and knows so many interesting facts!");
      await this.completeOnboarding();
    } else if (input.includes('bear') || input.includes('bruno')) {
      this.userChoices.narrator = 'bear';
      this.sendResponse("Bruno the Bear is gentle and tells the most heartwarming stories!");
      await this.completeOnboarding();
    } else {
      this.sendResponse(
        "I didn't catch which friend you'd like! Say 'fox' for Finn, 'owl' for Ollie, or 'bear' for Bruno!"
      );
    }
  }

  private async completeOnboarding(): Promise<void> {
    this.currentStep = 'complete';

    // Send final configuration to client
    this.sendMessage({
      type: 'response',
      content: "Perfect! Everything is ready. Let's start your amazing learning adventure!",
      context: {
        topic: this.userChoices.topic || '',
        current_page: '',
        branch_taken: null,
        story_so_far: '',
        narrator_character: this.userChoices.narrator || '',
        educational_facts_covered: [],
        adhd_mode: true
      },
      timestamp: Date.now()
    });

    console.log('Onboarding completed:', this.userChoices);
  }

  public resetOnboarding(): void {
    this.currentStep = 'welcome';
    this.userChoices = {};
  }
}