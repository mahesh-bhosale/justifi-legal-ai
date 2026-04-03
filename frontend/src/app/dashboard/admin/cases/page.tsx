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
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
    case 'pending_lawyer_acceptance':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
    case 'in_progress':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    case 'resolved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case 'closed':
      return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header section with distinct lead line */}
      <div className="border-l-4 border-amber-500 pl-6 py-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Institutional Case Registry</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">
          Comprehensive administrative oversight of all legal matters within the Justifi ecosystem.
          Audit, filter, and manage case lifecycles with institutional precision.
        </p>
      </div>

      {/* Filter and Search Section */}
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Case Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>
                    {o.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Registry Search</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
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
                    placeholder="Search by title, category, or case details..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-sm"
                  />
                </div>
                <Button
                  type="button"
                  className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-black px-6 rounded-xl shadow-lg shadow-amber-600/20 uppercase tracking-widest text-xs"
                  onClick={() => {
                    setPage(0);
                    setSearch(searchInput);
                  }}
                >
                  Query
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest animate-pulse">Syncing Registry...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">No matching dossiers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-y border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Title & Classification</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Involved Parties</th>
                    <th className="px-6 py-4">Temporal Mark</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/5 dark:hover:bg-amber-900/5 transition-colors group">
                      <td className="px-6 py-5 font-mono text-xs text-gray-400 dark:text-gray-500 font-bold">#{c.id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-5">
                        <p className="text-gray-900 dark:text-white font-bold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors truncate max-w-[240px]" title={c.title}>
                          {c.title}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 block">{c.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5 dark:border-white/5 ${statusBadgeClass(c.status)}`}>
                          {caseStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-[8px]">C</span>
                            {c.citizenName ?? <span className="font-mono opacity-50">{c.citizenId.slice(0, 8)}</span>}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-[8px]">L</span>
                            {c.lawyerId ? (c.lawyerName ?? <span className="font-mono opacity-50">{c.lawyerId.slice(0, 8)}</span>) : 'UNASSIGNED'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-4">
                          <Link
                            href={`/dashboard/admin/cases/${c.id}`}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 dark:hover:bg-amber-600 text-gray-700 dark:text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            Investigate
                          </Link>
                          <button
                            type="button"
                            className="bg-red-50 dark:bg-red-900/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                            onClick={() => setDeleteTarget(c)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Improved Pagination */}
        <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setPage((p) => Math.max(0, p - 1));
              }}
              className="bg-white dark:bg-gray-900 rounded-xl font-bold uppercase tracking-widest text-[10px] border-gray-200 dark:border-gray-800"
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || cases.length < PAGE_SIZE}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setPage((p) => p + 1);
              }}
              className="bg-white dark:bg-gray-900 rounded-xl font-bold uppercase tracking-widest text-[10px] border-gray-200 dark:border-gray-800"
            >
              Next →
            </Button>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Registry Section {page + 1}
          </p>
        </div>
      </Card>

      {/* Institutional Deletion Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative max-w-lg w-full rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl p-10 space-y-8 border-2 border-red-500/10 dark:border-red-900/20 transition-all animate-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="bg-red-100 dark:bg-red-900/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-red-200/50 dark:border-red-950/50">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Permanent Removal</h3>
                <p className="text-red-500 dark:text-red-400 text-[10px] font-black tracking-[0.4em] uppercase">Irreversible Action</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                Confirm purging of <span className="text-gray-950 dark:text-white font-black underline decoration-amber-500 underline-offset-4">Case Dossier #{deleteTarget.id}</span>. This command deletes all associated document indices and legal records.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
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
                {deleteLoading ? 'Executing Wipe...' : 'Confirm Permanent Deletion'}
              </Button>
              <Button
                variant="outline"
                className="w-full py-5 rounded-3xl font-bold border-gray-200 dark:border-gray-800 uppercase tracking-widest text-[10px]"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Abort Deletion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
