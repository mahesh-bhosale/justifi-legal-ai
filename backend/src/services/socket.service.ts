import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { cases } from '../models/schema';
import { eq } from 'drizzle-orm';

let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket not initialized');
  }
  return ioInstance;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

function socketCorsOrigins(): string[] {
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://justifi-legal-ai.vercel.app',
    'https://justifi-legal-fj8ql797y-mahesh-bhosales-projects-4e94489c.vercel.app',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean);
}

class SocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: socketCorsOrigins(),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io/',
      serveClient: false,
      connectTimeout: 10000,
      pingTimeout: 5000,
      pingInterval: 10000,
      cookie: false,
      transports: ['websocket', 'polling'],
      allowEIO3: false,
      maxHttpBufferSize: 1e6,
    });

    ioInstance = this.io;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
          role: string;
        };
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        next();
      } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      socket.on('join-user', (userId: string) => {
        if (!userId || !socket.userId || userId !== socket.userId) {
          return;
        }
        void socket.join(`user:${userId}`);
      });

      socket.on('join:case', async (data: unknown, callback: (response: unknown) => void) => {
        try {
          const raw =
            data && typeof data === 'object' && data !== null ? (data as { caseId?: unknown }).caseId : undefined;
          let caseId: number;
          if (typeof raw === 'number' && Number.isFinite(raw)) {
            caseId = raw;
          } else if (typeof raw === 'string') {
            caseId = parseInt(raw, 10);
          } else {
            if (typeof callback === 'function') {
              callback({ error: 'Invalid data format' });
            }
            return;
          }
          if (!Number.isFinite(caseId) || caseId <= 0) {
            if (typeof callback === 'function') {
              callback({ error: 'Invalid data format' });
            }
            return;
          }

          const isParticipant = await this.verifyParticipant(caseId, socket.userId!);
          if (!isParticipant) {
            if (typeof callback === 'function') {
              callback({ error: 'Not authorized to join this case' });
            }
            return;
          }

          const roomName = `case:${caseId}`;
          const previousRooms = Array.from(socket.rooms).filter(
            (room) => room !== socket.id && room.startsWith('case:')
          );

          if (previousRooms.length > 0) {
            previousRooms.forEach((room) => {
              socket.leave(room);
            });
          }

          await socket.join(roomName);

          const room = this.io?.sockets.adapter.rooms.get(roomName);
          const roomSize = room?.size || 0;

          if (typeof callback === 'function') {
            callback({
              success: true,
              room: roomName,
              caseId,
              roomSize,
            });
          }

          socket.to(roomName).emit('user:joined', {
            userId: socket.userId,
            caseId,
            room: roomName,
            timestamp: new Date().toISOString(),
            roomSize: roomSize,
          });
        } catch (error) {
          console.error('Error joining case room:', error);
          if (typeof callback === 'function') {
            callback({
              success: false,
              error: 'Failed to join case room',
              details: error instanceof Error ? error.message : String(error),
            });
          }
        }
      });

      socket.on('leave:case', (data: unknown) => {
        const raw =
          data && typeof data === 'object' && data !== null ? (data as { caseId?: unknown }).caseId : undefined;
        let caseId: number;
        if (typeof raw === 'number' && Number.isFinite(raw)) {
          caseId = raw;
        } else if (typeof raw === 'string') {
          caseId = parseInt(raw, 10);
        } else {
          return;
        }
        if (!Number.isFinite(caseId) || caseId <= 0) {
          return;
        }
        const roomName = `case:${caseId}`;
        socket.leave(roomName);
        socket.emit('left:case', { caseId, room: roomName });
      });

      socket.on('disconnect', () => {
        /* no-op */
      });
    });
  }

  private async verifyParticipant(caseId: number, userId: string): Promise<boolean> {
    try {
      const [caseData] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);

      if (!caseData) return false;

      return caseData.citizenId === userId || caseData.lawyerId === userId;
    } catch (error) {
      console.error('Error verifying participant:', error);
      return false;
    }
  }

  emitNewMessage(caseId: number, message: { id?: number; [key: string]: unknown }): void {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return;
    }

    const roomName = `case:${caseId}`;
    this.io.to(roomName).emit('message:new', message);
  }

  emitMessageRead(caseId: number, messageData: { id?: number; [key: string]: unknown }): void {
    if (!this.io) return;

    const roomName = `case:${caseId}`;
    this.io.to(roomName).emit('message:read', messageData);
  }

  getIOInstance(): SocketIOServer | null {
    return this.io;
  }
}

export default new SocketService();
