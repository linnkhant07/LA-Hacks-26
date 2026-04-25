# educ-ATE 🐕📚

**AI-powered interactive educational storybook web app for kids with ADHD**

Built for LA Hacks 2026 (April 24–26, UCLA Pauley Pavilion)

## 🎯 What We Built

educ-ATE is an innovative educational platform that combines AI-powered storytelling with voice interaction to create engaging learning experiences for children with ADHD.

### Key Features

- **🐕 Benny the Corgi**: Friendly onboarding guide who helps kids choose their learning adventure
- **🎙️ Voice Cloning**: Parents can record their voice (30 seconds) to narrate stories to their children
- **🦊🦉🐻 Character Narrators**: Choose from Finn the Fox, Ollie the Owl, or Bruno the Bear
- **💬 Interactive Conversations**: Real-time voice chat with story characters
- **🎨 Circle & Draw**: Kids can circle objects in illustrations for explanations and draw to influence the story
- **🌪️ Educational Topics**: Currently supports Tornadoes and Pyramids with branching storylines
- **🧠 ADHD-Optimized**: Proactive re-engagement every 30 seconds to maintain attention

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router, TypeScript, Tailwind CSS, Framer Motion
- **Voice UI**: Real-time WebSocket connections for voice conversation
- **Interactive Elements**: Canvas drawing, hotspot detection, branching choices
- **Responsive Design**: Optimized for tablets and desktop

### Backend (Express.js + WebSocket)
- **Voice Agents**:
  - Benny (Onboarding Agent) - Guides setup and topic selection
  - Narrator Agents - Character-specific conversation during stories
- **Story Generation**: AI pipeline with Gemini for content, Imagen 3 for illustrations
- **Voice Services**: ElevenLabs integration for TTS, STT, and voice cloning
- **Database**: MongoDB for story storage and user sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional - works without database in dev mode)
- API Keys: Gemini, ElevenLabs, Cloudinary (for full functionality)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd LA-Hacks-26
```

### 2. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Copy environment template (optional)
cp .env.local.example .env.local

# Start frontend development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Backend Setup
```bash
# Navigate to backend directory (from root)
cd backend

# Install backend dependencies
npm install

# Copy environment template
cp .env.example .env

# Start backend development server
npm run dev
# Backend runs on http://localhost:3001
# WebSocket server runs on ws://localhost:3002
```

### 4. Open in Browser
Visit `http://localhost:3000` and start your adventure with Benny the Corgi!

## 📁 Project Structure
```
LA-Hacks-26/
├── client/          # Frontend (Next.js 14 + TypeScript)
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components
│   ├── lib/         # Utilities and hooks
│   └── ...         # Configuration files
├── backend/         # Backend API (Express.js + WebSocket)
│   ├── src/         # TypeScript source code
│   └── ...         # Backend configuration
└── README.md        # This file
```

## 🎮 How to Use

1. **Meet Benny**: The friendly Corgi greets you and asks if you want to use a parent's voice or animal narrator
2. **Voice Setup** (optional): Record parent voice with 3 short sentences
3. **Choose Topic**: Select "Tornadoes" or "Pyramids" to learn about
4. **Pick Narrator**: Choose from Fox, Owl, Bear, or use the recorded parent voice
5. **Experience Story**:
   - Listen to narration with character voices
   - Circle objects in illustrations for explanations
   - Talk to the narrator about the story
   - Make choices that branch the story
   - Draw to influence upcoming scenes

## 🛠️ Development

### Frontend Structure (`client/`)
```
client/
├── app/
│   ├── page.tsx              # Onboarding with Benny the Corgi
│   └── story/[id]/page.tsx   # Story viewer with voice interaction
├── components/
│   ├── VoiceCloning.tsx      # Parent voice recording interface
│   ├── StoryViewer.tsx       # Story layout wrapper
│   ├── NarratorPanel.tsx     # Voice controls and narration display
│   ├── VoiceConversationModal.tsx  # Real-time voice chat
│   ├── IllustrationPanel.tsx # Story images with drawing overlay
│   ├── DrawCanvas.tsx        # Canvas for circling and drawing
│   ├── ChoiceModal.tsx       # Branching story choices
│   └── CirclePopup.tsx       # Explanations for circled objects
├── lib/
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── websocket.ts          # WebSocket client utilities
│   ├── useVoiceConversation.ts  # Voice chat React hook
│   └── fakeStory.ts          # Demo story data
└── package.json              # Frontend dependencies
```

### Backend Structure
```
backend/src/
├── server.ts             # Main Express application
├── websocket-server.ts   # WebSocket server for voice agents
├── config/database.ts    # MongoDB connection
├── types/index.ts        # Shared TypeScript interfaces
├── services/voice-agents/
│   ├── base-agent.ts     # Base voice agent class
│   ├── onboarding-agent.ts  # Benny the Corgi implementation
│   └── narrator-agent.ts    # Story narrator implementation
└── routes/
    ├── voice-clone.ts    # Voice cloning API
    ├── generate.ts       # Story generation API
    └── story.ts          # Story CRUD operations
```

### Environment Variables

**Frontend (`client/.env.local`)**:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_NARRATOR_WS_URL=ws://localhost:3002/voice?agent=narrator
NEXT_PUBLIC_ONBOARDING_WS_URL=ws://localhost:3002/voice?agent=onboarding
```

**Backend (.env)**:
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/educare_db
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:3000
```

## 🎯 Technical Highlights

### Voice Agent System
- **Benny the Corgi**: Fixed personality for consistent onboarding experience
- **Character Narrators**: Fox (curious), Owl (wise), Bear (gentle), Parent (warm)
- **Real-time Conversation**: Full-duplex voice chat via WebSocket
- **Context Awareness**: Agents remember story progress and adapt responses

### ADHD-Specific Features
- **Proactive Engagement**: Automatic check-ins every 30 seconds of inactivity
- **Multi-modal Interaction**: Voice, visual, and tactile engagement options
- **Short Attention Spans**: Bite-sized content with frequent interaction opportunities
- **Immediate Feedback**: Instant responses to all user actions

### AI Pipeline
1. **Story Generation**: Gemini creates educational content with branching paths
2. **Image Generation**: Imagen 3 creates illustrations for all story pages
3. **Voice Synthesis**: ElevenLabs generates character voices and parent clones
4. **Real-time Processing**: WebSocket connections for live voice interaction

## 🏆 Competition Strategy

### Target Prizes
- **Primary**: Light the Way (Aramco) - Education equity + accessibility
- **ElevenLabs MLH**: Voice cloning + conversational AI
- **MongoDB Atlas MLH**: Story storage and user sessions
- **Cloudinary MLH**: Image storage + delivery

### Demo Approach
- **Pre-generated Stories**: Cached tornado and pyramid stories for zero-latency demo
- **Live Generation**: Show real-time story creation as bonus feature
- **Voice Interaction**: Demonstrate real conversation with Benny and story narrators
- **ADHD Focus**: Emphasize accessibility features and engagement strategies

## 👥 Team

- **Dev 1**: Story generation pipeline, Gemini/Imagen integration, MongoDB
- **Dev 2**: Voice agents, ElevenLabs integration, conversational AI
- **Dev 3**: Frontend development, UI/UX, component architecture
- **Designer**: Figma prototypes, visual assets, demo presentation

## 🔮 Future Features

- **More Topics**: History, Science, Math, Literature
- **Advanced Drawing**: Hand gesture detection, complex drawing analysis
- **Parent Dashboard**: Progress tracking, learning analytics
- **Multilingual Support**: Stories in multiple languages
- **Adaptive Learning**: Difficulty adjustment based on child's responses

## 📝 License

MIT License - LA Hacks 2026 Team

---

**Built with ❤️ by the educ-ATE team for LA Hacks 2026**