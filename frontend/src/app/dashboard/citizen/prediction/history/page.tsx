'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface HistoryItem {
  id: string;
  fileUrl: string;
  prediction: string;
  confidence: number | string | null;
  createdAt: string;
}

export default function CitizenPredictionHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/prediction/history');
        const data = res.data?.data || res.data;
        setItems(data || []);
      } catch (err: any) {
        console.error('Prediction history error:', err);
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to load prediction history.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleRowClick = (item: HistoryItem) => {
    if (item.id) {
      window.location.href = `/dashboard/citizen/prediction?predictionId=${item.id}`;
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Prediction History
        </h1>
        <p className="text-sm text-gray-600">
          Review previous AI case outcome predictions you&apos;ve generated.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                File
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Prediction
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Confidence
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {isLoading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Loading history...
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No predictions found yet. Upload a case PDF to get started.
                </td>
              </tr>
            )}
            {!isLoading &&
              items.map((item) => {
                const confidenceNumber =
                  item.confidence !== null
                    ? Number(item.confidence)
                    : null;
                const date = new Date(item.createdAt);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-blue-600 underline">
                      {item.fileUrl.split('/').pop() || 'Document'}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap font-medium ${
                        item.prediction === 'ACCEPT'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {item.prediction}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                      {confidenceNumber !== null
                        ? `${(confidenceNumber * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

