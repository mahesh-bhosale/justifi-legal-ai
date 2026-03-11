import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import redis from '../lib/redis';

export interface PredictionChunk {
  chunk_id: number;
  prediction: string;
  confidence: number;
}

export interface PredictionResult {
  prediction: string;
  confidence: number;
  confidence_level: string;
  num_chunks: number;
  avg_chunk_confidence: number;
  min_chunk_confidence: number;
  max_chunk_confidence: number;
  chunk_predictions: PredictionChunk[];
  explanation: string;
}

// Allow PREDICTION_SERVICE_URL to be either a full endpoint or a base URL.
// Examples:
// - http://localhost:8001              -> will call http://localhost:8001/predict-pdf
// - http://localhost:8001/predict-pdf  -> used as-is
const rawPredictionUrl =
  process.env.PREDICTION_SERVICE_URL || 'http://localhost:8001';

const FASTAPI_PREDICTION_URL = rawPredictionUrl.includes('/predict-pdf')
  ? rawPredictionUrl
  : `${rawPredictionUrl.replace(/\/+$/, '')}/predict-pdf`;

const PREDICTION_CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds

function createFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function getCacheKey(fileHash: string): string {
  return `prediction:${fileHash}`;
}

export class PredictionService {
  private async callFastApiOnce(
    fileBuffer: Buffer,
  ): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'case.pdf',
      contentType: 'application/pdf',
    });

    try {
      const response = await axios.post<PredictionResult>(
        FASTAPI_PREDICTION_URL,
        formData,
        {
          timeout: REQUEST_TIMEOUT_MS,
          headers: formData.getHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        const timeoutError = new Error(
          'AI prediction service timed out. Please try again later.',
        );
        (timeoutError as any).statusCode = 504;
        throw timeoutError;
      }

      const status = axiosError.response?.status;
      const message =
        (axiosError.response?.data as any)?.detail ||
        axiosError.message ||
        'Failed to contact AI prediction service';

      const serviceError = new Error(message);
      (serviceError as any).statusCode = status || 502;
      throw serviceError;
    }
  }

  public async predictCaseOutcome(
    fileBuffer: Buffer,
  ): Promise<PredictionResult> {
    const fileHash = createFileHash(fileBuffer);
    const cacheKey = getCacheKey(fileHash);

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`✅ Redis cache hit for prediction - key: ${cacheKey}`);
        return JSON.parse(cached) as PredictionResult;
      }
    } catch (error) {
      console.error('Failed to read prediction from Redis cache:', error);
      // Continue without failing the request
    }

    console.log(`ℹ️ Redis cache miss for prediction - key: ${cacheKey}`);

    // Call FastAPI service with a single retry on failure
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result = await this.callFastApiOnce(fileBuffer);

        // Store in cache (best-effort)
        try {
          await redis.set(
            cacheKey,
            JSON.stringify(result),
            'EX',
            PREDICTION_CACHE_TTL_SECONDS,
          );
          console.log(
            `✅ Stored prediction result in Redis - key: ${cacheKey}, ttl: ${PREDICTION_CACHE_TTL_SECONDS}s`,
          );
        } catch (cacheError) {
          console.error(
            'Failed to write prediction result to Redis cache:',
            cacheError,
          );
        }

        return result;
      } catch (error) {
        lastError = error;
        console.error(
          `Prediction service attempt ${attempt} failed:`,
          (error as Error).message,
        );

        if (attempt === 2) {
          throw error;
        }
      }
    }

    // Fallback (should not reach here)
    throw lastError instanceof Error
      ? lastError
      : new Error('Prediction service failed unexpectedly');
  }
}

const predictionService = new PredictionService();
export default predictionService;

