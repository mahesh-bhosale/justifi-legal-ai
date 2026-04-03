'use client';

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { CHART_COLORS, CHART_TEXT_COLOR } from '../../lib/chartColors';

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
      <div className="flex items-center justify-center h-[260px] bg-gray-50/50 dark:bg-gray-950/50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 dark:border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
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
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />
          <Pie
            data={data}
            dataKey={valueKey as string}
            nameKey={nameKey as string}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                // eslint-disable-next-line react/no-array-index-key
                key={`pie-cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span style={{ color: CHART_TEXT_COLOR, fontSize: '11px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

