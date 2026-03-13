import { Request, Response } from 'express';
import usersService from '../services/users.service';

class UsersController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const data = await usersService.listAll();
      res.json({ success: true, data });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ success: false, message: 'Failed to list users' });
    }
  }
}

export default new UsersController();

