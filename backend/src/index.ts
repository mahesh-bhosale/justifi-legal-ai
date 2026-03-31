import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
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
import reviewsRoutes from './routes/reviews.routes';
import socketService from './services/socket.service';
import aiRoutes from './routes/ai.routes';
import predictionRoutes from './routes/prediction.routes';
import analyticsRoutes from './analytics/analytics.routes';
import usersRoutes from './routes/users.routes';
import profileRoutes from './routes/profile.routes';
import notificationsRoutes from './routes/notifications.routes';
import { connectKafka, startConsumers } from './services/kafka.service';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    ...(process.env.NODE_ENV === 'production'
      ? {
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        }
      : {}),
  })
);

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://justifi-legal-fj8ql797y-mahesh-bhosales-projects-4e94489c.vercel.app',
      'https://justifi-legal-ai.vercel.app',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/lawyer-profiles', lawyerProfileRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', profileRoutes);
app.use('/api', proposalsRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api', messagesRoutes);
app.use('/api', documentsRoutes);
app.use('/api', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Justifi Legal AI Backend API',
    version: '1.0.0',
  });
});

app.use('/*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  const anyErr = err as { status?: number; message?: string; stack?: string };
  const message =
    typeof anyErr?.message === 'string' && anyErr.message.includes('File type not allowed')
      ? anyErr.message
      : typeof anyErr?.message === 'string' && anyErr.message.includes('Only PDF')
        ? anyErr.message
        : undefined;
  if (message) {
    res.status(400).json({ success: false, message });
    return;
  }
  console.error('Error:', err);
  res.status(anyErr.status || 500).json({
    error: anyErr.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: anyErr.stack }),
  });
});

const server = createServer(app);
socketService.initialize(server);

async function start(): Promise<void> {
  try {
    await connectKafka();
    await startConsumers();
  } catch (err) {
    console.error('Kafka startup failed (continuing without Kafka):', err);
  }

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
}

void start();

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log('✅ Server is listening on port', PORT);
});

export default app;
