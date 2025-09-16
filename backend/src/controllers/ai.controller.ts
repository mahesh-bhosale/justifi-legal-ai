import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { getUsageCount, logAIUsage } from '../services/aiUsage.service';
import { isUserUnlimited, getUserDailyLimits } from '../services/subscription.service';
import { AISummaryRequest, AIAskRequest, RateLimitCheck } from '../utils/types/ai.types';

const aiService = new AIService();

// Default limits for public/unauthenticated users
const PUBLIC_LIMITS = {
  summarize: 5,
  ask: 10
};

export class AIController {
  private static readonly RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  private static async checkRateLimit(
    userId: string | undefined, 
    ipAddress: string, 
    endpoint: 'summarize' | 'ask'
  ): Promise<RateLimitCheck> {
    if (!ipAddress) {
      throw new Error('IP address is required for rate limiting');
    }
    try {
      // Check if user has unlimited access
      if (userId) {
        const unlimited = await isUserUnlimited(userId);
        if (unlimited) {
          return { allowed: true, limit: Infinity, used: 0 };
        }
      }
      
      // Get appropriate limits based on user status
      let maxLimit: number;
      
      if (userId) {
        const limits = await getUserDailyLimits(userId);
        maxLimit = endpoint === 'summarize' ? limits.summarizeLimit : limits.askLimit;
      } else {
        // For unauthenticated users, use public limits
        maxLimit = endpoint === 'summarize' ? PUBLIC_LIMITS.summarize : PUBLIC_LIMITS.ask;
      }
      
      // Ensure we have a valid limit
      if (maxLimit === undefined || maxLimit === null) {
        console.warn(`No valid limit found for ${endpoint}, using default`);
        maxLimit = endpoint === 'summarize' ? 5 : 30; // Fallback defaults
      }
      
      // Check current usage
      const used = await getUsageCount({
        userId,
        ipAddress: userId ? undefined : ipAddress,
        endpoint,
      });
      
      return { 
        allowed: used < maxLimit, 
        limit: maxLimit, 
        used,
        remaining: Math.max(0, maxLimit - used)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in checkRateLimit:', errorMessage);
      // Fail open in production, closed in development
      const shouldAllow = process.env.NODE_ENV === 'production';
      return { 
        allowed: shouldAllow, 
        limit: 0, 
        used: 0,
        remaining: 0,
        error: `Error checking rate limit: ${errorMessage}`
      };
    }
  }

  public static async summarizeText(req: Request, res: Response): Promise<Response | void> {
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }
    try {
      const { text, level } = req.body as AISummaryRequest;
      const userId = (req as any).user?.userId;
      // User role is handled in the subscription service
      const ipAddress = req.ip || 'unknown';

      // Validate request
      if (!text || !level) {
        return res.status(400).json({ error: 'Missing required fields: text and level are required' });
      }

      // Check rate limit
      const rateLimit = await AIController.checkRateLimit(
        userId,
        ipAddress,
        'summarize'
      );
      
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          used: rateLimit.used,
          remaining: rateLimit.remaining,
          reset: new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString() // Reset at midnight
        });
      }

      // Call AI service
      const result = await aiService.summarizeText({ text, level });
      
      // Log usage asynchronously without awaiting
      logAIUsage({
        userId,
        ipAddress: userId ? undefined : ipAddress,
        endpoint: 'summarize'
      }).catch(error => {
        console.error('Failed to log AI usage:', error);
        // Don't fail the request if logging fails
      });

      // Add rate limit headers to response
      res.set({
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString()
      });

      res.json({
        ...result,
        rateLimit: {
          limit: rateLimit.limit,
          used: rateLimit.used + 1,
          remaining: Math.max(0, rateLimit.limit - (rateLimit.used + 1))
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as any)?.statusCode || 500;
      console.error('Summarize error:', errorMessage);
      
      res.status(statusCode).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined
        })
      });
    }
  }

  public static async askQuestion(req: Request, res: Response): Promise<Response | void> {
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }
    try {
      const { question, context } = req.body as AIAskRequest;
      const userId = (req as any).user?.userId;
      // User role is handled in the subscription service
      const ipAddress = req.ip || 'unknown';
      
      // Validate request
      if (!question || !context) {
        return res.status(400).json({ error: 'Missing required fields: question and context are required' });
      }

      // Public users can't use ask feature
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check rate limit
      const rateLimit = await AIController.checkRateLimit(
        userId, 
        ipAddress, 
        'ask'
      );
      
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          used: rateLimit.used,
          remaining: rateLimit.remaining,
          reset: new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString()
        });
      }

      // Call AI service
      const result = await aiService.askQuestion({ question, context });
      
      // Log usage asynchronously without awaiting
      logAIUsage({
        userId,
        endpoint: 'ask'
      }).catch(error => {
        console.error('Failed to log AI usage:', error);
        // Don't fail the request if logging fails
      });

      // Add rate limit headers to response
      res.set({
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString()
      });

      res.json({
        ...result,
        rateLimit: {
          limit: rateLimit.limit,
          used: rateLimit.used + 1,
          remaining: Math.max(0, rateLimit.limit - (rateLimit.used + 1))
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get answer';
      const statusCode = (error as any)?.statusCode || 500;
      console.error('Ask question error:', errorMessage);
      
      res.status(statusCode).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined
        })
      });
    }
  }

  public static async summarizePdf(req: Request, res: Response): Promise<Response | void> {
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }
    try {
      const { level } = req.body;
      const file = req.file;
      const userId = (req as any).user?.userId;
      const ipAddress = req.ip || 'unknown';
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check rate limit
      const rateLimit = await AIController.checkRateLimit(
        userId,
        ipAddress,
        'summarize'
      );
      
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          used: rateLimit.used,
          remaining: rateLimit.remaining,
          reset: new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString()
        });
      }

      // Call AI service
      const result = await aiService.summarizePdf(file.buffer, file.originalname, level);
      
      // Log usage asynchronously without awaiting
      logAIUsage({
        userId,
        ipAddress: userId ? undefined : ipAddress,
        endpoint: 'summarize'
      }).catch(error => {
        console.error('Failed to log AI usage:', error);
        // Don't fail the request if logging fails
      });

      // Add rate limit headers to response
      res.set({
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + AIController.RATE_LIMIT_WINDOW_MS).toISOString()
      });

      res.json({
        ...result,
        rateLimit: {
          limit: rateLimit.limit,
          used: rateLimit.used + 1,
          remaining: Math.max(0, rateLimit.limit - (rateLimit.used + 1))
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      console.error('Summarize PDF error:', errorMessage);
      const statusCode = (error as any)?.statusCode || 500;
      
      res.status(statusCode).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined
        })
      });
    }
  }

  public static async askPdfQuestion(req: Request, res: Response): Promise<Response | void> {
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }
    try {
      const { question } = req.body;
      const file = req.file;
      const userId = (req as any).user?.userId;
      const ipAddress = req.ip || 'unknown';

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Public users can't use ask feature
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check rate limit
      const rateLimit = await this.checkRateLimit(
        userId, 
        ipAddress, 
        'ask'
      );
      
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          used: rateLimit.used,
          remaining: rateLimit.remaining,
          reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Call AI service
      const result = await aiService.askPdfQuestion(file.buffer, file.originalname, question);
      
      // Log usage asynchronously without awaiting
      logAIUsage({
        userId,
        endpoint: 'ask'
      }).catch(error => {
        console.error('Failed to log AI usage:', error);
        // Don't fail the request if logging fails
      });

      // Add rate limit headers to response
      res.set({
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      res.json({
        ...result,
        rateLimit: {
          limit: rateLimit.limit,
          used: rateLimit.used + 1,
          remaining: Math.max(0, rateLimit.limit - (rateLimit.used + 1))
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get answer';
      console.error('Ask PDF question error:', errorMessage);
      const statusCode = (error as any)?.statusCode || 500;
      
      res.status(statusCode).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined
        })
      });
    }
  }
}