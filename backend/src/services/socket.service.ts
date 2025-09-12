import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { cases } from '../models/schema';
import { eq } from 'drizzle-orm';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface JoinRoomData {
  caseId: number;
}

class SocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        console.log(`Socket authenticated: ${socket.userId} (${socket.userRole})`);
        next();
      } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);

      // Join case room
      socket.on('join:case', async (data: JoinRoomData) => {
        try {
          const { caseId } = data;
          
          // Verify user is participant in this case
          const isParticipant = await this.verifyParticipant(caseId, socket.userId!);
          if (!isParticipant) {
            socket.emit('error', { message: 'Not authorized to join this case' });
            return;
          }

          const roomName = `case:${caseId}`;
          socket.join(roomName);
          socket.emit('joined:case', { caseId, room: roomName });
          
          console.log(`User ${socket.userId} joined case room: ${roomName}`);
        } catch (error) {
          console.error('Error joining case room:', error);
          socket.emit('error', { message: 'Failed to join case room' });
        }
      });

      // Leave case room
      socket.on('leave:case', (data: JoinRoomData) => {
        const { caseId } = data;
        const roomName = `case:${caseId}`;
        socket.leave(roomName);
        socket.emit('left:case', { caseId, room: roomName });
        
        console.log(`User ${socket.userId} left case room: ${roomName}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }

  // Verify if user is participant in case
  private async verifyParticipant(caseId: number, userId: string): Promise<boolean> {
    try {
      const [caseData] = await db
        .select()
        .from(cases)
        .where(eq(cases.id, caseId))
        .limit(1);

      if (!caseData) return false;
      
      return caseData.citizenId === userId || caseData.lawyerId === userId;
    } catch (error) {
      console.error('Error verifying participant:', error);
      return false;
    }
  }

  // Emit new message to case participants
  emitNewMessage(caseId: number, messageData: any): void {
    if (!this.io) return;
    
    const roomName = `case:${caseId}`;
    this.io.to(roomName).emit('message:new', messageData);
    
    console.log(`Emitted new message to room ${roomName}:`, messageData.id);
  }

  // Emit message read status update
  emitMessageRead(caseId: number, messageData: any): void {
    if (!this.io) return;
    
    const roomName = `case:${caseId}`;
    this.io.to(roomName).emit('message:read', messageData);
    
    console.log(`Emitted message read to room ${roomName}:`, messageData.id);
  }

  // Get Socket.IO instance
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default new SocketService();
