'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PredictionResultCardProps {
  prediction: string;
  confidence: number;
  confidenceLevel: string;
  numChunks: number;
  explanation: string;
}

export function PredictionResultCard({
  prediction,
  confidence,
  confidenceLevel,
  numChunks,
  explanation,
}: PredictionResultCardProps) {
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <Card className="w-full shadow-md border border-gray-200 bg-white">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Case Outcome Prediction
        </CardTitle>
        <p className="text-sm text-gray-500">
          AI-powered prediction based on your uploaded legal document.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Prediction
            </p>
            <p
              className={`mt-1 text-xl font-bold ${
                prediction === 'ACCEPT' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {prediction}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Confidence
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {confidencePercent}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Level: <span className="font-medium">{confidenceLevel}</span>
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Analyzed Segments
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {numChunks}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Number of text chunks processed
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Explanation
          </p>
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
            {explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PredictionResultCard;

