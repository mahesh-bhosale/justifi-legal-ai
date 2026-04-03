'use client';

interface ChunkPrediction {
  chunk_id: number;
  prediction: string;
  confidence: number;
}

interface ChunkPredictionTableProps {
  chunks: ChunkPrediction[];
}

export function ChunkPredictionTable({ chunks }: ChunkPredictionTableProps) {
  if (!chunks || chunks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
        No chunk-level predictions available for this document.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Chunk ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Prediction
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 text-sm">
          {chunks.map((chunk) => (
            <tr key={chunk.chunk_id}>
              <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                {chunk.chunk_id}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap font-medium ${
                  chunk.prediction === 'ACCEPT'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {chunk.prediction}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                {(chunk.confidence * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChunkPredictionTable;

