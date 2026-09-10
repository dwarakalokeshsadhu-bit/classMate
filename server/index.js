import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({
    status: 'ok',
    service: 'Class Mate API',
    team: 'Team 07',
    llmConfigured: hasKey,
    mode: hasKey ? 'live-ai' : 'demo-mock',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/generate', generateRouter);

// Root fallback
app.get('/', (req, res) => {
  res.send(`
    <h1>Class Mate Server</h1>
    <p>Status: Active | Team 07</p>
    <p>API Endpoint: <code>POST /api/generate</code></p>
    <p>Healthcheck: <a href="/api/health">/api/health</a></p>
  `);
});

// Only listen if run directly from terminal
let serverInstance;
const isMain = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index'));
if (isMain && process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Pocket Mentor Backend running on http://localhost:${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`🔑 LLM Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Smart Demo Mode (Mock)'}`);
    console.log(`=============================================`);
  });
}

export { app, serverInstance };
export default app;
