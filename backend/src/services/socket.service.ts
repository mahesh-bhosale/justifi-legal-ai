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
    console.log('Initializing WebSocket server...');
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          process.env.FRONTEND_URL || 'http://localhost:3000'
        ],
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
      allowEIO3: true
    });
    
    console.log('WebSocket server initialized with CORS for origins:', [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ]);

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
      socket.on('join:case', async (data: JoinRoomData, callback: (response: any) => void) => {
        try {
          const { caseId } = data;
          console.log(`User ${socket.userId} attempting to join case room for case ${caseId}`);
          
          // Verify user is participant in this case
          const isParticipant = await this.verifyParticipant(caseId, socket.userId!);
          if (!isParticipant) {
            const errorMsg = `User ${socket.userId} not authorized to join case ${caseId}`;
            console.warn(errorMsg);
            if (typeof callback === 'function') {
              callback({ error: 'Not authorized to join this case' });
            }
            return;
          }

          const roomName = `case:${caseId}`;
          const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id && room.startsWith('case:'));
          
          // Leave any previous case rooms
          if (previousRooms.length > 0) {
            console.log(`User ${socket.userId} leaving previous case rooms:`, previousRooms);
            previousRooms.forEach(room => {
              socket.leave(room);
              console.log(`User ${socket.userId} left room: ${room}`);
            });
          }
          
          // Join the new room
          await socket.join(roomName);
          
          // Get current room info
          const room = this.io?.sockets.adapter.rooms.get(roomName);
          const roomSize = room?.size || 0;
          
          console.log(`User ${socket.userId} joined room ${roomName}`, {
            roomSize,
            socketRooms: Array.from(socket.rooms)
          });
          
          // Send success response with room info
          if (typeof callback === 'function') {
            callback({ 
              success: true, 
              room: roomName, 
              caseId,
              roomSize
            });
          }
          
          // Notify others in the room (except the current socket)
          socket.to(roomName).emit('user:joined', { 
            userId: socket.userId,
            caseId,
            room: roomName,
            timestamp: new Date().toISOString(),
            roomSize: roomSize
          });
          
        } catch (error) {
          console.error('Error joining case room:', error);
          if (typeof callback === 'function') {
            callback({ 
              success: false, 
              error: 'Failed to join case room',
              details: error instanceof Error ? error.message : String(error)
            });
          }
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
  emitNewMessage(caseId: number, message: any): void {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return;
    }
    
    const roomName = `case:${caseId}`;
    const room = this.io.sockets.adapter.rooms.get(roomName);
    const roomSize = room?.size || 0;
    
    console.log(`Emitting new message to room ${roomName}:`, {
      messageId: message.id,
      roomSize,
      clients: room ? Array.from(room) : [],
      messagePreview: message.message?.substring(0, 50) + (message.message?.length > 50 ? '...' : '')
    });
    
    if (!room || roomSize === 0) {
      console.warn(`Room ${roomName} does not exist or has no clients`);
      // Log all active rooms for debugging
      const rooms = this.io.sockets.adapter.rooms;
      console.log('Active rooms:', Array.from(rooms.keys()));
    } else {
      console.log(`Sending to ${roomSize} client(s) in room ${roomName}`);
      // Get socket instances for all clients in the room
      const socketsInRoom = Array.from(room).map(socketId => this.io?.sockets.sockets.get(socketId));
      console.log('Sockets in room:', socketsInRoom.map(s => ({
        id: s?.id,
        connected: s?.connected,
        userId: (s as any)?.userId
      })));
    }
    
    // Emit to the room
    this.io.to(roomName).emit('message:new', message);
    
    // Also emit to a debug channel for testing
    this.io.emit('debug:message', {
      type: 'new_message',
      room: roomName,
      messageId: message.id,
      timestamp: new Date().toISOString()
    });
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
