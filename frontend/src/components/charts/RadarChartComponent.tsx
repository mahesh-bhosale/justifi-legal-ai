'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CHART_COLORS, CHART_TEXT_COLOR } from '../../lib/chartColors';

interface RadarChartComponentProps<T> {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  color?: string;
  height?: number;
  loading?: boolean;
}

export default function RadarChartComponent<T extends Record<string, any>>({
  data,
  labelKey,
  valueKey,
  color,
  height = 260,
  loading = false,
}: RadarChartComponentProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[260px] bg-gray-50/50 dark:bg-gray-950/50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const chartColor = color || CHART_COLORS[5]; // Default to Orange if none provided

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
          <PolarAngleAxis 
            dataKey={labelKey as string} 
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-gray-500 dark:text-gray-400"
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 'auto']} 
            tick={{ fill: 'currentColor', fontSize: 10 }}
            className="text-gray-500 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,1.0)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 10,
              color: '#f8fafc',
              fontSize: 12,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            }}
          />
          <Radar
            name={valueKey as string}
            dataKey={valueKey as string}
            stroke={chartColor}
            fill={chartColor}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

