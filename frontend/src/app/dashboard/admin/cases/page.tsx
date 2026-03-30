'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import { deleteCase, getCases, caseStatusLabel, type CaseWithNames } from '../../../../lib/cases';

const PAGE_SIZE = 25;

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_lawyer_acceptance', label: 'Awaiting lawyer' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_lawyer_acceptance':
      return 'bg-orange-100 text-orange-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-200 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<CaseWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<CaseWithNames | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCases({
        status: status || undefined,
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases', err);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All cases</h1>
        <p className="text-gray-600">Search, filter, open details, or permanently delete a case.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search title or category</label>
              <div className="flex gap-2">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(0);
                      setSearch(searchInput);
                    }
                  }}
                  placeholder="e.g. custody, property…"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setPage(0);
                    setSearch(searchInput);
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : cases.length === 0 ? (
          <p className="text-sm text-gray-600">No cases match your filters.</p>
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
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{c.id}</td>
                    <td className="px-4 py-2 text-gray-900 max-w-[200px] truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{c.category}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(
                          c.status
                        )}`}
                      >
                        {caseStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {c.citizenName ?? <span className="font-mono text-xs text-gray-500">{c.citizenId.slice(0, 8)}…</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {c.lawyerId ? (
                        c.lawyerName ?? <span className="font-mono text-xs text-gray-500">{c.lawyerId.slice(0, 8)}…</span>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/dashboard/admin/cases/${c.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View details
                        </Link>
                        <button
                          type="button"
                          className="text-left text-red-600 hover:text-red-800 font-medium"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Delete case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page + 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || cases.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md w-full rounded-lg bg-white shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete case permanently?</h3>
            <p className="text-sm text-gray-600">
              Case #{deleteTarget.id}: <strong>{deleteTarget.title}</strong>. This removes the case and related proposals,
              messages, and documents (database cascade). This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteLoading}
                onClick={async () => {
                  try {
                    setDeleteLoading(true);
                    await deleteCase(deleteTarget.id);
                    setDeleteTarget(null);
                    await load();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? 'Deleting…' : 'Delete case'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
