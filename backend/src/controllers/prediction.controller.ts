import { Request, Response } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import predictionService from '../services/prediction.service';
import { db } from '../lib/db';
import { casePredictions, NewCasePrediction } from '../models/schema';
import {
  predictionUploadSchema,
  validatePdfFile,
} from '../validators/prediction.validator';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'case-predictions';

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function uploadToSupabaseStorage(
  file: Express.Multer.File,
  userId: string,
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase storage is not configured');
  }

  const filePath = `${userId}/${Date.now()}_${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload file to storage');
  }

  const { data: publicData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(data.path);

  if (!publicData?.publicUrl) {
    throw new Error('Failed to generate public URL for uploaded file');
  }

  return publicData.publicUrl;
}

class PredictionController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      // 1) Validate user
      if (!req.user) {
        res
          .status(401)
          .json({ success: false, message: 'Authentication required' });
        return;
      }

      // 2) Validate file and basic payload
      try {
        predictionUploadSchema.parse(req.body);
        validatePdfFile(req.file);
      } catch (err) {
        if (err instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors,
          });
          return;
        }
        throw err;
      }

      const file = req.file as Express.Multer.File;

      // 3) Call AI prediction service
      const prediction = await predictionService.predictCaseOutcome(
        file.buffer,
      );

      // 4) Upload original PDF to Supabase Storage
      const fileUrl = await uploadToSupabaseStorage(file, req.user.userId);

      // 5) Save prediction to database
      const newRecord: NewCasePrediction = {
        userId: req.user.userId,
        fileUrl,
        prediction: prediction.prediction,
        confidence: prediction.confidence != null ? String(prediction.confidence) : null,
        confidenceLevel: prediction.confidence_level,
        numChunks: prediction.num_chunks,
        avgChunkConfidence: prediction.avg_chunk_confidence != null ? String(prediction.avg_chunk_confidence) : null,
        minChunkConfidence: prediction.min_chunk_confidence != null ? String(prediction.min_chunk_confidence) : null,
        maxChunkConfidence: prediction.max_chunk_confidence != null ? String(prediction.max_chunk_confidence) : null,
        explanation: prediction.explanation,
      };

      const [saved] = await db
        .insert(casePredictions)
        .values(newRecord)
        .returning();

      // 6) Return formatted response
      res.status(201).json({
        success: true,
        data: {
          id: saved.id,
          userId: saved.userId,
          fileUrl: saved.fileUrl,
          prediction: saved.prediction,
          confidence: Number(saved.confidence ?? 0),
          confidence_level: saved.confidenceLevel,
          num_chunks: saved.numChunks,
          avg_chunk_confidence: Number(saved.avgChunkConfidence ?? 0),
          min_chunk_confidence: Number(saved.minChunkConfidence ?? 0),
          max_chunk_confidence: Number(saved.maxChunkConfidence ?? 0),
          explanation: saved.explanation,
          created_at: saved.createdAt,
          chunk_predictions: prediction.chunk_predictions,
        },
      });
    } catch (error: any) {
      const statusCode = error?.statusCode || 500;
      const message =
        error?.message || 'Failed to process prediction request';

      console.error('Prediction upload error:', error);

      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          details: error?.stack,
        }),
      });
    }
  }
}

export default new PredictionController();

