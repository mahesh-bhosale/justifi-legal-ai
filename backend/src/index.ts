import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';
import blogRoutes from './routes/blog.routes';
import lawyerProfileRoutes from './routes/lawyer-profile.routes';
import lawyersRoutes from './routes/lawyers.routes';
import casesRoutes from './routes/cases.routes';
import proposalsRoutes from './routes/proposals.routes';
import messagesRoutes from './routes/messages.routes';
import documentsRoutes from './routes/documents.routes';
import socketService from './services/socket.service';
import aiRoutes from './routes/ai.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://justifi-legal-fj8ql797y-mahesh-bhosales-projects-4e94489c.vercel.app',
    'https://justifi-legal-ai.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true,
}));
// Increase body size limits for file uploads (50MB for JSON, 50MB for URL-encoded)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/lawyer-profiles', lawyerProfileRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', proposalsRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api', messagesRoutes);
app.use('/api', documentsRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Justifi Legal AI Backend API',
    version: '1.0.0'
  });
});

// 404 handler
app.use('/*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Create HTTP server and initialize Socket.IO
const server = createServer(app);
socketService.initialize(server);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server initialized`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🛡️ Protected endpoints: http://localhost:${PORT}/api/protected`);
  console.log(`📝 Blog endpoints: http://localhost:${PORT}/api/blogs`);
  console.log(`⚖️ Lawyer Profile endpoints: http://localhost:${PORT}/api/lawyer-profiles`);
  console.log(`🧭 Lawyer search endpoints: http://localhost:${PORT}/api/lawyers/search`);
  console.log(`📂 Case endpoints: http://localhost:${PORT}/api/cases`);
  console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai`); 
  console.log(`📮 Proposals endpoints: http://localhost:${PORT}/api/proposals`);
  console.log(`✉️ Messages endpoints: http://localhost:${PORT}/api/cases/:caseId/messages`);
  console.log(`📎 Documents endpoints: http://localhost:${PORT}/api/cases/:caseId/documents`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log('✅ Server is listening on port', PORT);
});

export default app;
