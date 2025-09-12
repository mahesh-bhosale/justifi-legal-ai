import { Request, Response } from 'express';
import { z } from 'zod';
import messagesService from '../services/messages.service';
import socketService from '../services/socket.service';

const createSchema = z.object({
  recipientId: z.string(),
  message: z.string().min(1),
});

class MessagesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { 
        res.status(401).json({ success: false, message: 'Auth required' }); 
        return; 
      }
      
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) { 
        res.status(400).json({ success: false, message: 'Invalid caseId' }); 
        return; 
      }
      
      const body = createSchema.parse(req.body);
      
      console.log('Message creation request:', {
        caseId,
        senderId: req.user.userId,
        recipientId: body.recipientId,
        message: body.message.slice(0, 50)
      });
      
      const created = await messagesService.createMessage(caseId, req.user.userId, body.recipientId, body.message);
      if (!created) { 
        res.status(403).json({ success: false, message: 'Not allowed - you are not a participant in this case' }); 
        return; 
      }
      
      // Emit WebSocket event for real-time message
      socketService.emitNewMessage(caseId, created);
      
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      if (err instanceof z.ZodError) { 
        res.status(400).json({ success: false, message: 'Validation error', errors: err.errors }); 
        return; 
      }
      console.error('Create message error:', err);
      res.status(500).json({ success: false, message: 'Failed to create message' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Auth required' }); return; }
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) { res.status(400).json({ success: false, message: 'Invalid caseId' }); return; }
      const rows = await messagesService.listMessages(caseId, req.user.userId);
      if (!rows) { res.status(403).json({ success: false, message: 'Not allowed' }); return; }
      res.json({ success: true, count: rows.length, data: rows });
    } catch (err: any) {
      console.error('List messages error:', err);
      res.status(500).json({ success: false, message: 'Failed to list messages' });
    }
  }

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Auth required' }); return; }
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
      const updated = await messagesService.markRead(id, req.user.userId);
      if (!updated) { res.status(404).json({ success: false, message: 'Not found or not allowed' }); return; }
      
      // Emit WebSocket event for read receipt
      socketService.emitMessageRead(updated.caseId as number, updated);
      
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Mark read error:', err);
      res.status(500).json({ success: false, message: 'Failed to mark read' });
    }
  }
}

export default new MessagesController();


