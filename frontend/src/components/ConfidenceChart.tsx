'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChunkPrediction {
  chunk_id: number;
  prediction: string;
  confidence: number;
}

interface ConfidenceChartProps {
  chunks: ChunkPrediction[];
}

export function ConfidenceChart({ chunks }: ConfidenceChartProps) {
  if (!chunks || chunks.length === 0) {
    return null;
  }

  const barData = chunks.map((c) => ({
    name: `Chunk ${c.chunk_id}`,
    confidence: Number((c.confidence * 100).toFixed(1)),
  }));

  const distribution = {
    accept: chunks.filter((c) => c.prediction === 'ACCEPT').length,
    reject: chunks.filter((c) => c.prediction === 'REJECT').length,
  };

  const distributionData = [
    { label: 'ACCEPT', count: distribution.accept },
    { label: 'REJECT', count: distribution.reject },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-64 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          Chunk Confidence Scores
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          Confidence per analyzed text chunk (higher is more confident).
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar
              dataKey="confidence"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          Confidence Distribution
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          Number of chunks predicted as ACCEPT vs REJECT.
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              name="Chunks"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ConfidenceChart;

