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
      <div className="h-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition-colors">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white transition-colors">
          Chunk Confidence Scores
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Confidence per analyzed text chunk (higher is more confident).
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: 'currentColor' }} 
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Confidence']}
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                borderColor: '#374151',
                color: '#fff',
                borderRadius: '8px'
              }}
            />
            <Bar
              dataKey="confidence"
              fill="#EAB308"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition-colors">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white transition-colors">
          Confidence Distribution
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Number of chunks predicted as ACCEPT vs REJECT.
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                borderColor: '#374151',
                color: '#fff',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              name="Chunks"
              fill="#CA8A04"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ConfidenceChart;

