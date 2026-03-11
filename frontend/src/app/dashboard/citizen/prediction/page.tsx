'use client';

import { useState } from 'react';
import PredictionUploader from '@/components/PredictionUploader';
import PredictionResultCard from '@/components/PredictionResultCard';
import ConfidenceChart from '@/components/ConfidenceChart';
import ChunkPredictionTable from '@/components/ChunkPredictionTable';

interface ChunkPrediction {
  chunk_id: number;
  prediction: string;
  confidence: number;
}

interface PredictionData {
  id?: string;
  fileUrl?: string;
  prediction: string;
  confidence: number;
  confidence_level: string;
  num_chunks: number;
  avg_chunk_confidence: number;
  min_chunk_confidence: number;
  max_chunk_confidence: number;
  explanation: string;
  chunk_predictions: ChunkPrediction[];
  created_at?: string;
}

export default function CitizenPredictionPage() {
  const [result, setResult] = useState<PredictionData | null>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Case Outcome Prediction
        </h1>
        <p className="text-sm text-gray-600">
          Upload a legal case PDF and let the AI estimate the likelihood of
          ACCEPT vs REJECT. Results are stored securely for your account.
        </p>
      </header>

      <PredictionUploader onResult={setResult} />

      {result && (
        <section className="space-y-6">
          <PredictionResultCard
            prediction={result.prediction}
            confidence={result.confidence}
            confidenceLevel={result.confidence_level}
            numChunks={result.num_chunks}
            explanation={result.explanation}
          />

          <ConfidenceChart chunks={result.chunk_predictions} />

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Chunk-level Predictions
            </h2>
            <ChunkPredictionTable chunks={result.chunk_predictions} />
          </div>
        </section>
      )}
    </div>
  );
}

