import { Request, Response, NextFunction } from 'express';
import { verifyToken as verifyJWT, JWTPayload } from '../utils/jwt';
import authService from '../services/auth.service';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches user information to req.user
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyJWT(token);

    // Get user from database to ensure user still exists
    const user = await authService.getUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.message === 'Invalid or expired token') {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    } else {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};
