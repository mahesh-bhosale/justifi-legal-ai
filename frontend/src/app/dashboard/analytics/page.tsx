'use client';

import { useEffect, useState } from 'react';
import Card from '../../../components/Card';
import {
  fetchAIModelPerformance,
  fetchAISummarizationStats,
} from '../../../lib/analytics';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import PieChartComponent from '../../../components/charts/PieChartComponent';
import LineChartComponent from '../../../components/charts/LineChartComponent';

export default function PlatformAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [modelPerf, setModelPerf] = useState<{
    totalPredictions: number;
    outcomeDistribution: { prediction: string; count: number }[];
    confidenceBuckets: { bucket: string; count: number }[];
  } | null>(null);
  const [summarization, setSummarization] = useState<
    { endpoint: string; totalUsage: number }[]
  >([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mp, sum] = await Promise.all([
        fetchAIModelPerformance(),
        fetchAISummarizationStats(),
      ]);
      setModelPerf(mp);
      setSummarization(sum);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI & Platform Analytics</h1>
        <p className="text-gray-600">
          Monitor AI model performance and summarization usage across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Predictions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {modelPerf?.totalPredictions ?? 0}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Summarization Endpoints</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summarization.length}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Prediction Confidence</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {modelPerf?.confidenceBuckets.reduce((acc, b) => acc + b.count, 0) ?? 0}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Case Outcome Distribution
          </h3>
          <PieChartComponent
            data={(modelPerf?.outcomeDistribution || []).map((o) => ({
              label: o.prediction,
              count: o.count,
            }))}
            nameKey="label"
            valueKey="count"
            loading={loading}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Confidence Buckets
          </h3>
          <BarChartComponent
            data={(modelPerf?.confidenceBuckets || []).map((b) => ({
              label: b.bucket,
              count: b.count,
            }))}
            xKey="label"
            yKey="count"
            loading={loading}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Summarization Usage by Endpoint
          </h3>
          <BarChartComponent
            data={summarization.map((s) => ({
              label: s.endpoint,
              count: s.totalUsage,
            }))}
            xKey="label"
            yKey="count"
            loading={loading}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Predictions Over Time (proxy)
          </h3>
          <LineChartComponent
            data={(modelPerf?.outcomeDistribution || []).map((o, idx) => ({
              label: `${o.prediction} #${idx + 1}`,
              count: o.count,
            }))}
            xKey="label"
            yKey="count"
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
}

