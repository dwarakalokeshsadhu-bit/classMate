import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import generateRouter from './routes/generate.js';
import { authRouter } from './routes/auth.js';
import { historyRouter } from './routes/history.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas (if MONGODB_URI is provided)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable configurable CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV === 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parsing and cookie middlewares
app.use(cookieParser());
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
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/generate', generateRouter);
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

// Serve static frontend assets if client dist exists (full-stack production deployment)
const distPath = path.resolve(__dirname, '../client/dist');
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  app.use(express.static(distPath));

  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
} else {
  // Root fallback when running backend-only without client/dist
  app.get('/', (req, res) => {
    res.send(`
      <!doctype html>
      <html>
        <head><title>Class Mate API</title></head>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
          <h1>🎓 Class Mate Server</h1>
          <p>Status: Active | Team 07</p>
          <p>API Endpoint: <code>POST /api/generate</code></p>
          <p>Healthcheck: <a href="/api/health">/api/health</a></p>
        </body>
      </html>
    `);
  });
}

// Start server if run directly from CLI / Cloud runtime
let serverInstance;
const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.js') ||
  process.argv[1].endsWith('index') ||
  process.argv[1].endsWith('server')
);

if (isMain && process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Class Mate Server running on port ${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`🔑 LLM Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Smart Demo Mode (Mock)'}`);
    console.log(`📂 Client Dist Served: ${hasDist ? 'Yes (' + distPath + ')' : 'No (run build to enable)'}`);
    console.log(`=============================================`);
  });
}

export { app, serverInstance };
export default app;

