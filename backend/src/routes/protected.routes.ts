import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Simple protected route for testing
router.get('/test', verifyToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    data: {
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

export default router;
