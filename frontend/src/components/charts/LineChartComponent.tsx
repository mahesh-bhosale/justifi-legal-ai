'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CHART_COLORS, CHART_TEXT_COLOR } from '../../lib/chartColors';

interface LineChartComponentProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  color?: string;
  height?: number;
  loading?: boolean;
}

export default function LineChartComponent<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  color,
  height = 260,
  loading = false,
}: LineChartComponentProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[260px] bg-gray-50/50 dark:bg-gray-950/50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 dark:border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis 
            dataKey={xKey as string} 
            tick={{ fontSize: 11, fill: 'currentColor' }} 
            className="text-gray-500 dark:text-gray-400"
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1, opacity: 0.2 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'currentColor' }} 
            className="text-gray-500 dark:text-gray-400"
            axisLine={{ stroke: '#94a3b8', strokeWidth: 1, opacity: 0.2 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b', // Slate 800 - solid background for better readability
              border: '1px solid rgba(226, 179, 74, 0.2)', // Subtle gold border
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            }}
            itemStyle={{
              color: '#f8fafc', // Slate 50 - high contrast
              fontSize: '13px',
              fontWeight: 500,
              padding: '2px 0',
            }}
            labelStyle={{
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey as string}
            stroke={color || CHART_COLORS[0]}
            strokeWidth={3}
            dot={{ fill: color || CHART_COLORS[0], strokeWidth: 2, r: 4, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

