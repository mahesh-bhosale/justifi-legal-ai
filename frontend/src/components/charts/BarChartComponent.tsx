'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BarChartComponentProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  color?: string;
  height?: number;
  loading?: boolean;
}

export default function BarChartComponent<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  color = '#10b981', // emerald-500
  height = 260,
  loading = false,
}: BarChartComponentProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey={xKey as string} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.9)',
              border: 'none',
              borderRadius: 8,
              color: '#e5e7eb',
              fontSize: 12,
            }}
          />
          <Bar dataKey={yKey as string} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

