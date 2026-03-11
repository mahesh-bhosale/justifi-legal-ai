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
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        No chunk-level predictions available for this document.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Chunk ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Prediction
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-sm">
          {chunks.map((chunk) => (
            <tr key={chunk.chunk_id}>
              <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                {chunk.chunk_id}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap font-medium ${
                  chunk.prediction === 'ACCEPT'
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {chunk.prediction}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-900">
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

