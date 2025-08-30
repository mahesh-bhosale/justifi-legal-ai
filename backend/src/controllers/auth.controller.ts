import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { signupSchema, loginSchema } from '../utils/validation';

export class AuthController {
  /**
   * Handle user signup
   * POST /auth/signup
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      // Validate input data
      const validatedData = signupSchema.parse(req.body);

      // Call auth service
      const result = await authService.signup(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // Validation error
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      } else if (error.message === 'User with this email already exists') {
        // Duplicate email error
        res.status(409).json({
          success: false,
          message: error.message,
        });
      } else {
        // Generic error
        console.error('Signup error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  /**
   * Handle user login
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input data
      const validatedData = loginSchema.parse(req.body);

      // Call auth service
      const result = await authService.login(validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // Validation error
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      } else if (error.message === 'Invalid email or password') {
        // Authentication error
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        // Generic error
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }
}

export default new AuthController();
