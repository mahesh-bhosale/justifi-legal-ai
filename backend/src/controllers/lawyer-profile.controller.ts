import { Request, Response } from 'express';
import lawyerProfileService from '../services/lawyer-profile.service';
import { z } from 'zod';

// Validation schemas
const createProfileSchema = z.object({
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  yearsExperience: z.number().int().min(0, 'Years of experience must be non-negative'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  officeAddress: z.string().min(10, 'Office address must be at least 10 characters'),
  serviceAreas: z.array(z.string()).min(1, 'At least one service area is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  education: z.array(z.object({
    degree: z.string(),
    university: z.string(),
    year: z.number().int(),
    field: z.string().optional()
  })).min(1, 'At least one education entry is required'),
  barAdmissions: z.array(z.object({
    state: z.string(),
    year: z.number().int(),
    barNumber: z.string().optional()
  })).min(1, 'At least one bar admission is required'),
  hourlyRate: z.number().int().positive().optional(),
  consultationFee: z.number().int().positive().optional(),
  availabilityStatus: z.enum(['available', 'limited', 'unavailable']).default('available')
});

const updateProfileSchema = createProfileSchema.partial();

const getProfilesSchema = z.object({
  specializations: z.string().optional().transform(val => val ? val.split(',') : undefined),
  serviceAreas: z.string().optional().transform(val => val ? val.split(',') : undefined),
  languages: z.string().optional().transform(val => val ? val.split(',') : undefined),
  minExperience: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxExperience: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  minHourlyRate: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxHourlyRate: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  availabilityStatus: z.enum(['available', 'limited', 'unavailable']).optional(),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  offset: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

class LawyerProfileController {
  /**
   * Create a new lawyer profile
   */
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user already has a profile
      const existingProfile = await lawyerProfileService.getProfileByUserId(req.user.userId);
      if (existingProfile) {
        res.status(400).json({
          success: false,
          message: 'Profile already exists. Use PATCH to update.'
        });
        return;
      }

      const validatedData = createProfileSchema.parse(req.body);
      
      const profileData = {
        userId: req.user.userId,
        ...validatedData
      };

      const profile = await lawyerProfileService.createProfile(profileData);

      res.status(201).json({
        success: true,
        message: 'Lawyer profile created successfully',
        data: profile
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
        return;
      }

      console.error('Error creating lawyer profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create lawyer profile'
      });
    }
  }

  /**
   * Update an existing lawyer profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid profile ID'
        });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const profile = await lawyerProfileService.updateProfile(profileId, req.user.userId, validatedData);

      res.json({
        success: true,
        message: 'Lawyer profile updated successfully',
        data: profile
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
        return;
      }

      console.error('Error updating lawyer profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update lawyer profile'
      });
    }
  }

  /**
   * Get a specific lawyer profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid profile ID'
        });
        return;
      }

      const profile = await lawyerProfileService.getProfileById(profileId);
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Lawyer profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error getting lawyer profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get lawyer profile'
      });
    }
  }

  /**
   * Get current user's lawyer profile
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const profile = await lawyerProfileService.getProfileByUserId(req.user.userId);
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Lawyer profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error getting my lawyer profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get lawyer profile'
      });
    }
  }

  /**
   * Get all lawyer profiles with filters
   */
  async getProfiles(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = getProfilesSchema.parse(req.query);
      const profiles = await lawyerProfileService.getProfiles(validatedFilters);

      res.json({
        success: true,
        data: profiles,
        count: profiles.length
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
        return;
      }

      console.error('Error getting lawyer profiles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get lawyer profiles'
      });
    }
  }

  /**
   * Verify a lawyer profile (admin only)
   */
  async verifyProfile(req: Request, res: Response): Promise<void> {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid profile ID'
        });
        return;
      }

      const profile = await lawyerProfileService.verifyProfile(profileId);

      res.json({
        success: true,
        message: 'Lawyer profile verified successfully',
        data: profile
      });
    } catch (error: any) {
      console.error('Error verifying lawyer profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify lawyer profile'
      });
    }
  }

  /**
   * Get available specializations
   */
  async getSpecializations(_req: Request, res: Response): Promise<void> {
    try {
      const specializations = lawyerProfileService.getAvailableSpecializations();

      res.json({
        success: true,
        data: specializations
      });
    } catch (error: any) {
      console.error('Error getting specializations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get specializations'
      });
    }
  }

  /**
   * Get available service areas
   */
  async getServiceAreas(_req: Request, res: Response): Promise<void> {
    try {
      const serviceAreas = lawyerProfileService.getAvailableServiceAreas();

      res.json({
        success: true,
        data: serviceAreas
      });
    } catch (error: any) {
      console.error('Error getting service areas:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service areas'
      });
    }
  }

  /**
   * Get available languages
   */
  async getLanguages(_req: Request, res: Response): Promise<void> {
    try {
      const languages = lawyerProfileService.getAvailableLanguages();

      res.json({
        success: true,
        data: languages
      });
    } catch (error: any) {
      console.error('Error getting languages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get languages'
      });
    }
  }
}

export default new LawyerProfileController();
