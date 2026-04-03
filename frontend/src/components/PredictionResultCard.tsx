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
    <Card className="w-full shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Case Outcome Prediction
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          AI-powered prediction based on your uploaded legal document.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Prediction
            </p>
            <p
              className={`mt-1 text-xl font-bold ${
                prediction === 'ACCEPT' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'
              }`}
            >
              {prediction}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Confidence
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {confidencePercent}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Level: <span className="font-medium">{confidenceLevel}</span>
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Analyzed Segments
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {numChunks}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Number of text chunks processed
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Explanation
          </p>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PredictionResultCard;

