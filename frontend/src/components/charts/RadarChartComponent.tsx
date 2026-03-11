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
  color = '#f97316', // orange-500
  height = 260,
  loading = false,
}: RadarChartComponentProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
          <PolarAngleAxis dataKey={labelKey as string} />
          <PolarRadiusAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.9)',
              border: 'none',
              borderRadius: 8,
              color: '#e5e7eb',
              fontSize: 12,
            }}
          />
          <Radar
            name="value"
            dataKey={valueKey as string}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

