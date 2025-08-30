import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/schema';

/**
 * Middleware to require specific user roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role as UserRole)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Middleware to require lawyer role specifically
 */
export const requireLawyer = requireRole(['lawyer']);

/**
 * Middleware to require citizen role specifically
 */
export const requireCitizen = requireRole(['citizen']);

/**
 * Middleware to allow both citizen and lawyer roles
 */
export const requireAnyRole = requireRole(['citizen', 'lawyer']);
