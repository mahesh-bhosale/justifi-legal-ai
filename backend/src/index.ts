import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';
import blogRoutes from './routes/blog.routes';
import lawyerProfileRoutes from './routes/lawyer-profile.routes';
import lawyersRoutes from './routes/lawyers.routes';
import casesRoutes from './routes/cases.routes';
import proposalsRoutes from './routes/proposals.routes';
import messagesRoutes from './routes/messages.routes';
import documentsRoutes from './routes/documents.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/lawyer-profiles', lawyerProfileRoutes);
app.use('/api/lawyers', lawyersRoutes);
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

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🛡️ Protected endpoints: http://localhost:${PORT}/api/protected`);
  console.log(`📝 Blog endpoints: http://localhost:${PORT}/api/blogs`);
  console.log(`⚖️ Lawyer Profile endpoints: http://localhost:${PORT}/api/lawyer-profiles`);
  console.log(`🧭 Lawyer search endpoints: http://localhost:${PORT}/api/lawyers/search`);
  console.log(`📂 Case endpoints: http://localhost:${PORT}/api/cases`);
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
