import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './config/database';
import { VoiceWebSocketServer } from './websocket-server';

// Import routes
import voiceCloneRoutes from './routes/voice-clone';
import generateRoutes from './routes/generate';
import storyRoutes from './routes/story';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for audio data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: database.isConnected(),
      websocket: true // TODO: Check WebSocket server status
    }
  });
});

// API Routes
app.use('/api/voice-clone', voiceCloneRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/story', storyRoutes);

// Additional endpoints that will be implemented
app.post('/api/circle', (req, res) => {
  // TODO: Implement circle/click explanation endpoint
  console.log('Circle API called - not yet implemented');
  res.json({
    explanation: "This feature will identify what you circled and explain it! (Coming in Phase 2)",
    audio_url: ""
  });
});

app.post('/api/talk', (req, res) => {
  // TODO: Implement talk endpoint (might be replaced by WebSocket)
  console.log('Talk API called - not yet implemented');
  res.json({
    response: "Voice conversation is handled via WebSocket connection!",
    audio_url: ""
  });
});

app.post('/api/draw', (req, res) => {
  // TODO: Implement draw endpoint
  console.log('Draw API called - not yet implemented');
  res.json({
    new_page: {
      page_id: "draw_result",
      narration: "Amazing drawing! This feature will create a new story page based on your artwork! (Coming in Phase 2)",
      image_prompt: "User drawing integrated into story",
      image_url: "https://placehold.co/800x500/4a5568/white?text=Your+Drawing+Here!",
      audio_url: "",
      hotspots: [],
      choice: null
    }
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    console.log('✅ Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 educ-ATE Backend Server is running!`);
      console.log(`📍 HTTP Server: http://localhost:${PORT}`);
      console.log(`🎯 Health Check: http://localhost:${PORT}/health`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📋 Available API Endpoints:');
      console.log('  POST /api/voice-clone       - Clone parent voice');
      console.log('  POST /api/generate          - Generate complete story');
      console.log('  GET  /api/story/:id         - Get story by ID');
      console.log('  POST /api/circle            - Explain circled objects');
      console.log('  POST /api/talk              - Text conversation (WebSocket preferred)');
      console.log('  POST /api/draw              - Process drawings');
      console.log('\n🔌 WebSocket Endpoints:');
      console.log(`  ws://localhost:${PORT}/voice?agent=onboarding  - Benny the Corgi`);
      console.log(`  ws://localhost:${PORT}/voice?agent=narrator    - Story narrator`);
    });

    // Start WebSocket server
    const wsServer = new VoiceWebSocketServer(parseInt(PORT.toString()) + 1);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        wsServer.close();
        database.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      server.close(() => {
        wsServer.close();
        database.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();