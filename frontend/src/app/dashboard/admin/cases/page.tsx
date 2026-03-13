'use client';

import { useEffect, useState } from 'react';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import { getCases, type Case } from '../../../../lib/cases';

export default function AdminCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCases();
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases', err);
        setError('Failed to load cases');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Cases</h1>
        <p className="text-gray-600">
          View and monitor all cases created on the platform.
        </p>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : cases.length === 0 ? (
          <p className="text-sm text-gray-600">No cases found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Citizen</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Lawyer</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{c.id}</td>
                    <td className="px-4 py-2 text-gray-900">{c.title}</td>
                    <td className="px-4 py-2 text-gray-700">{c.category}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      <span className="font-mono text-xs">{c.citizenId}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {c.lawyerId ? (
                        <span className="font-mono text-xs">{c.lawyerId}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

