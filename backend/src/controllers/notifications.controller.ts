import type { Request, Response } from 'express';
import notificationService from '../services/notification.service';

class NotificationsController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Auth required' });
        return;
      }

      const rows = await notificationService.getUserNotifications(req.user.userId);
      const unreadCount = rows.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0);

      res.json({ success: true, unreadCount, count: rows.length, data: rows });
    } catch (err) {
      console.error('List notifications error:', err);
      res.status(500).json({ success: false, message: 'Failed to load notifications' });
    }
  }

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Auth required' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }

      const updated = await notificationService.markNotificationRead(id, req.user.userId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Not found or not allowed' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Mark notification read error:', err);
      res.status(500).json({ success: false, message: 'Failed to mark notification read' });
    }
  }
}

export default new NotificationsController();

