'use client';

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

const DEFAULT_COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#e11d48', '#6366f1', '#14b8a6'];

interface PieChartComponentProps<T> {
  data: T[];
  nameKey: keyof T;
  valueKey: keyof T;
  height?: number;
  loading?: boolean;
}

export default function PieChartComponent<T extends Record<string, any>>({
  data,
  nameKey,
  valueKey,
  height = 260,
  loading = false,
}: PieChartComponentProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.9)',
              border: 'none',
              borderRadius: 8,
              color: '#e5e7eb',
              fontSize: 12,
            }}
          />
          <Pie
            data={data}
            dataKey={valueKey as string}
            nameKey={nameKey as string}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell
                // eslint-disable-next-line react/no-array-index-key
                key={`pie-cell-${index}`}
                fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

