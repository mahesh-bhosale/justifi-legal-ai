import { Request, Response } from 'express';
import { z } from 'zod';
import profileService from '../services/profile.service';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

class ProfileController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const profile = await profileService.getCurrentUser(req.user.userId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const data = updateProfileSchema.parse(req.body);
      const updated = await profileService.updateCurrentUser(req.user.userId, data);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }

      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const body = changePasswordSchema.parse(req.body);
      await profileService.changePassword(
        req.user.userId,
        body.currentPassword,
        body.newPassword,
      );

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }

      if (error?.message === 'Invalid current password') {
        res
          .status(400)
          .json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }
}

export default new ProfileController();

