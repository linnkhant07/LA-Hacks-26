# educ-ATE Frontend 🐕📚

**Next.js 14 frontend for the educ-ATE voice-powered educational storybook**

This is the frontend client application that provides the user interface and voice interaction features for educ-ATE.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend server running (optional but recommended)

### Development Setup
```bash
# Install dependencies
npm install

# Copy environment template (optional)
cp .env.local.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Features

### Voice Interaction
- **Benny the Corgi**: Onboarding voice guide
- **Real-time Conversation**: WebSocket-based voice chat with story characters
- **Voice Cloning**: Parent voice recording and processing interface
- **Character Narrators**: Fox, Owl, Bear, or custom parent voice

### Interactive Story Experience
- **Story Viewer**: Animated page transitions with Framer Motion
- **Circle Mode**: Click on story illustrations for explanations
- **Drawing Canvas**: Draw to influence story progression
- **Branching Choices**: Interactive story decision points
- **ADHD-Optimized**: Proactive engagement and multiple interaction modes

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Onboarding with Benny
│   └── story/[id]/        # Dynamic story pages
├── components/            # React components
│   ├── VoiceCloning.tsx   # Voice recording interface
│   ├── StoryViewer.tsx    # Story layout wrapper
│   ├── NarratorPanel.tsx  # Voice controls
│   ├── VoiceConversationModal.tsx # Real-time voice chat
│   ├── IllustrationPanel.tsx # Story images with overlay
│   ├── DrawCanvas.tsx     # Canvas for drawing/circling
│   ├── ChoiceModal.tsx    # Story branching choices
│   └── CirclePopup.tsx    # Explanation popups
├── lib/                   # Utilities and hooks
│   ├── types.ts           # TypeScript interfaces
│   ├── websocket.ts       # WebSocket client utilities
│   ├── useVoiceConversation.ts # Voice chat hook
│   └── fakeStory.ts       # Demo story data
└── public/                # Static assets (if any)
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Backend API URL (optional - defaults to localhost:3001)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# WebSocket URLs (optional - defaults to localhost:3002)
NEXT_PUBLIC_NARRATOR_WS_URL=ws://localhost:3002/voice?agent=narrator
NEXT_PUBLIC_ONBOARDING_WS_URL=ws://localhost:3002/voice?agent=onboarding
```

### Running Without Backend

The frontend is designed to work standalone for demos:
- ✅ Onboarding with Benny (browser speech synthesis)
- ✅ Story viewer with demo content
- ✅ Voice cloning interface (mock processing)
- ✅ All UI interactions and animations
- ❌ Real-time voice conversation (requires backend)
- ❌ Story generation (uses fake data)

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Voice**: Web Speech API + WebSocket for real-time chat
- **Canvas**: HTML5 Canvas API for drawing/circling

## 🧠 ADHD-Specific Features

- **Proactive Engagement**: Automatic re-engagement every 30 seconds
- **Multi-modal Interaction**: Voice + visual + tactile options
- **Immediate Feedback**: Instant responses to all user actions
- **Short Content Chunks**: Bite-sized narration and interactions
- **Engaging Animations**: Smooth transitions to maintain attention

## 🔌 Backend Integration

The frontend connects to the backend via:

- **HTTP APIs**: Story generation, voice cloning
- **WebSocket**: Real-time voice conversation
- **Graceful Fallbacks**: Works without backend for demos

### API Endpoints Used
- `POST /api/generate` - Generate stories
- `POST /api/voice-clone` - Process parent voice
- `GET /api/story/:id` - Fetch stories
- `WebSocket /voice?agent=narrator` - Story conversation
- `WebSocket /voice?agent=onboarding` - Benny interaction

## 🎯 Voice Agent Integration

### Onboarding Flow
1. Benny greets user with voice synthesis
2. Guides through voice/narrator selection
3. Connects to backend WebSocket for real conversation

### Story Experience
1. Narrator reads story with character voice
2. User can interrupt for questions anytime
3. Real-time voice conversation via WebSocket
4. Context-aware responses based on story progress

### Voice Cloning
1. Parent records 3 sentences (30 seconds total)
2. Audio processed and sent to backend
3. Voice clone created and available for selection

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Voice Features**: Requires microphone permissions
- **WebSocket**: Supported in all modern browsers
- **Canvas**: HTML5 Canvas support required

## 🐛 Troubleshooting

**Voice not working:**
- Check microphone permissions
- Ensure backend WebSocket is running
- Try refreshing the page

**WebSocket connection failed:**
- Verify backend is running on port 3002
- Check CORS settings
- Check browser console for errors

**Story generation failed:**
- Backend API might be down
- Falls back to demo story automatically
- Check network connectivity

## 📝 License

MIT License - LA Hacks 2026 Team

---

**Part of the educ-ATE project for LA Hacks 2026** 🏆