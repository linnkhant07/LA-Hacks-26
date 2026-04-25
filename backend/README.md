# educ-ATE Backend

Backend API server for the educ-ATE voice-powered educational storybook application.

## Features

- **Voice Agents**: WebSocket-based voice conversation agents
  - Benny the Corgi (Onboarding Agent)
  - Story Narrator Agent (Fox, Owl, Bear, or Parent voice)
- **Story Generation**: AI-powered story creation with Gemini
- **Voice Cloning**: Parent voice cloning with ElevenLabs
- **Image Processing**: Story illustration generation and circle explanations

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
# Required API Keys
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional (defaults provided)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/educare_db
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` with WebSocket support on `ws://localhost:3002`.

## API Endpoints

### Story Management
- `POST /api/generate` - Generate complete story with all branches
- `GET /api/story/:id` - Get story by ID
- `POST /api/story` - Save story (internal use)

### Voice Services
- `POST /api/voice-clone` - Clone parent's voice
- `GET /api/voice-clone/:id/status` - Check cloning status

### Interactive Features
- `POST /api/circle` - Explain circled objects in illustrations
- `POST /api/draw` - Process user drawings
- `POST /api/talk` - Text conversation (WebSocket preferred)

### Health & Status
- `GET /health` - Server health check

## WebSocket Voice Agents

### Onboarding Agent (Benny the Corgi)
Connect: `ws://localhost:3002/voice?agent=onboarding`

Guides users through:
- Voice option selection (parent vs animal)
- Topic selection (tornadoes, pyramids)
- Narrator selection (fox, owl, bear)

### Narrator Agent
Connect: `ws://localhost:3002/voice?agent=narrator`

Provides:
- Story narration with character voices
- Interactive Q&A about story content
- ADHD-aware proactive engagement (30-second intervals)
- Context-aware responses based on story progress

### WebSocket Message Format

```typescript
interface VoiceMessage {
  type: 'speak' | 'listen' | 'response' | 'error' | 'connected' | 'disconnected';
  content?: string;
  context?: StoryContext;
  timestamp?: number;
}
```

## Development

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Project Structure

```
backend/
├── src/
│   ├── config/         # Database and service configuration
│   ├── routes/         # Express route handlers
│   ├── services/       # Business logic and voice agents
│   ├── types/          # TypeScript type definitions
│   ├── server.ts       # Main application server
│   └── websocket-server.ts  # WebSocket server for voice agents
├── package.json
├── tsconfig.json
└── .env.example
```

## Voice Agent Implementation

### Base Agent
All voice agents extend `BaseVoiceAgent` which provides:
- WebSocket connection management
- Message parsing and error handling
- Common voice processing methods
- Audio input/output handling

### Character Personalities
- **Fox (Finn)**: Curious explorer personality
- **Owl (Ollie)**: Wise and educational responses
- **Bear (Bruno)**: Gentle and comforting tone
- **Parent**: Warm, familial communication style

### ADHD Optimizations
- Proactive engagement every 30 seconds
- Short, focused responses
- Encouraging and reassuring tone
- Visual and audio feedback for all interactions

## Integration with Frontend

The backend provides WebSocket URLs that the frontend connects to:

```typescript
// Frontend WebSocket configuration
const NARRATOR_WS_URL = 'ws://localhost:3002/voice?agent=narrator'
const ONBOARDING_WS_URL = 'ws://localhost:3002/voice?agent=onboarding'
```

## TODO: Full Implementation

### Phase 2 Features
- [ ] Implement actual ElevenLabs STT/TTS integration
- [ ] Add Gemini AI response generation
- [ ] Set up MongoDB for story persistence
- [ ] Implement Cloudinary image processing
- [ ] Add circle detection with Gemini Vision
- [ ] Implement drawing analysis pipeline
- [ ] Add user session management
- [ ] Implement story caching and optimization

### Production Readiness
- [ ] Add authentication and rate limiting
- [ ] Implement proper error handling and logging
- [ ] Add monitoring and health checks
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive test coverage
- [ ] Implement security best practices

## License

MIT License - LA Hacks 2026 Team