'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import {
  getCaseById,
  updateCase,
  deleteCase,
  getCaseAuditLog,
  caseStatusLabel,
  formatResolutionDisplay,
  type Case,
  type CaseAuditEntry,
  type CaseStatus,
} from '../../../../../lib/cases';
import { getCaseProposals, type CaseProposal } from '../../../../../lib/proposals';

const ALLOWED: Record<CaseStatus, CaseStatus[]> = {
  pending: ['in_progress', 'closed'],
  pending_lawyer_acceptance: ['in_progress', 'rejected', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: [],
  closed: [],
  rejected: [],
};

function proposalStatusClass(s: string) {
  switch (s) {
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
    case 'accepted':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
  }
}

export default function AdminCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = parseInt(params.id as string);

  const [c, setC] = useState<Case | null>(null);
  const [audit, setAudit] = useState<CaseAuditEntry[]>([]);
  const [proposals, setProposals] = useState<CaseProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState<CaseStatus | ''>('');
  const [overrideResolution, setOverrideResolution] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [caseRow, log, props] = await Promise.all([
        getCaseById(caseId),
        getCaseAuditLog(caseId),
        getCaseProposals(caseId),
      ]);
      setC(caseRow);
      setAudit(log);
      setProposals(props);
      setNextStatus('');
      setOverrideResolution('');
      setStatusError(null);
    } catch (e) {
      console.error(e);
      setLoadError('Could not load case');
      setC(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseId) void load();
  }, [caseId, load]);

  const allowedTargets = c ? ALLOWED[c.status as CaseStatus] ?? [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (loadError || !c) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{loadError || 'Case not found'}</p>
        <Button className="mt-6" variant="outline" onClick={() => router.push('/dashboard/admin/cases')}>
          Back to cases
        </Button>
      </div>
    );
  }

  const resolutionDisplay = formatResolutionDisplay(c.resolution, c.status);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between gap-6 items-end border-l-4 border-amber-500 pl-6 py-2">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="mb-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
            onClick={() => router.push('/dashboard/admin/cases')}
          >
            ← Back to All Cases
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {c.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${proposalStatusClass(c.status === 'in_progress' ? 'accepted' : c.status === 'pending' ? 'pending' : 'rejected')}`}>
              {caseStatusLabel(c.status)}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 text-sm md:text-base">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-700">CASE ID: {c.id}</span>
            <span className="text-amber-500">•</span>
            <span>Created on {new Date(c.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 dark:bg-gray-900/50 transition-all font-bold group shadow-sm" 
          onClick={() => setShowDelete(true)}
        >
          <svg className="w-4 h-4 mr-2 group-hover:shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Destroy Case
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Case Details Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-6 hover:shadow-lg transition-shadow border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 pb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Case Files & Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-gray-400 dark:text-gray-500 uppercase text-[10px] font-bold tracking-widest">Category</span>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{c.category}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 dark:text-gray-500 uppercase text-[10px] font-bold tracking-widest">Involved Parties</span>
                <p className="text-gray-900 dark:text-white font-medium break-all">C: {c.citizenId.slice(0, 12)}... | L: {c.lawyerId?.slice(0, 12) ?? 'Unassigned'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-gray-400 dark:text-gray-500 uppercase text-[10px] font-bold tracking-widest">Case Description</span>
              <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-inner">
                {c.description}
              </div>
            </div>

            {c.resolution && (
              <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <h3 className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest text-[11px] mb-3">
                  {c.status === 'closed' && c.resolution.startsWith('WITHDRAWAL_REASON:') ? 'Final Withdrawal Statement' : 'Final Resolution Summary'}
                </h3>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed font-semibold italic">
                  &ldquo;{resolutionDisplay ?? c.resolution}&rdquo;
                </p>
              </div>
            )}
          </Card>

          {/* Proposals Card */}
          <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Proposal Stream
            </h2>
            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="opacity-40 mb-4 flex justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No legal proposals found for this case.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((p) => (
                  <div key={p.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-sm bg-gray-50 dark:bg-gray-800/30 transition-all hover:bg-white dark:hover:bg-gray-800 group relative">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${proposalStatusClass(p.status)}`}>
                        {p.status}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 uppercase font-bold">L-ID: {p.lawyerId.slice(0, 8)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                      {p.proposalText}
                    </p>
                    {p.proposedFee != null && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center px-2">
                        <span className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-widest italic">Legal Service Fee</span>
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-500 drop-shadow-sm">₹{p.proposedFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Action Column */}
        <div className="space-y-8">
          <Card className="p-8 space-y-6 bg-amber-50/20 dark:bg-amber-900/5 border-amber-100/50 dark:border-amber-900/20 shadow-amber-900/5 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              Status Control
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Administrative override for case lifecycle. Use with extreme caution as this affects legal records.
            </p>
            
            {allowedTargets.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-3xl border border-amber-100/50 dark:border-amber-900/30 text-center shadow-inner">
                <p className="text-xs text-amber-800 dark:text-amber-500 font-black uppercase tracking-widest">Lifecycle Complete</p>
                <p className="text-sm text-gray-500 mt-1">Terminal state reached.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {statusError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/30 transition-all animate-bounce">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {statusError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-[0.2em]">Target State</label>
                    <select
                      className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none appearance-none shadow-sm cursor-pointer"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value as CaseStatus | '')}
                    >
                      <option value="">Choose status...</option>
                      {allowedTargets.map((s) => (
                        <option key={s} value={s}>
                          {caseStatusLabel(s).toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {nextStatus === 'resolved' && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-[0.2em]">Official Resolution</label>
                      <textarea
                        className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-2xl px-4 py-4 text-sm font-medium min-h-[160px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none shadow-sm resize-none"
                        value={overrideResolution}
                        onChange={(e) => setOverrideResolution(e.target.value)}
                        placeholder="Provide formal case resolution summary for legal records..."
                      />
                    </div>
                  )}

                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-600/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 uppercase tracking-widest text-xs"
                    disabled={
                      statusSaving ||
                      !nextStatus ||
                      (nextStatus === 'resolved' && !overrideResolution.trim())
                    }
                    onClick={async () => {
                      if (!nextStatus) return;
                      try {
                        setStatusSaving(true);
                        setStatusError(null);
                        const payload: Parameters<typeof updateCase>[1] = { status: nextStatus };
                        if (nextStatus === 'resolved') {
                          payload.resolution = overrideResolution.trim();
                        }
                        const updated = await updateCase(caseId, payload);
                        setC(updated);
                        const log = await getCaseAuditLog(caseId);
                        setAudit(log);
                        setNextStatus('');
                        setOverrideResolution('');
                      } catch (err: unknown) {
                        const ax = err as { response?: { data?: { message?: string } } };
                        setStatusError(ax.response?.data?.message || 'Unauthorized or invalid state transition.');
                      } finally {
                        setStatusSaving(false);
                      }
                    }}
                  >
                    {statusSaving ? 'Synchronizing State...' : 'Commit Status Change'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Audit Log Card */}
      <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Institutional Audit Trail
          </h2>
          <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">{audit.length} Entries</span>
        </div>

        {audit.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">No recorded lifecycle events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-8">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] border-y border-gray-100 dark:border-gray-700/50">
                  <th className="py-4 px-8">Temporal Reference</th>
                  <th className="py-4 px-8">Activity Type</th>
                  <th className="py-4 px-8">Executor</th>
                  <th className="py-4 px-8">Executive Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {audit.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/10 dark:hover:bg-amber-900/5 transition-colors group">
                    <td className="py-5 px-8 whitespace-nowrap">
                      <p className="text-gray-600 dark:text-gray-400 font-bold text-xs">{new Date(row.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-[10px]">{new Date(row.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="py-5 px-8">
                      <span className="font-mono text-[10px] text-amber-600 dark:text-amber-500 font-black border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded uppercase">
                        {row.updateType}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {row.updatedByName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{row.updatedByName ?? 'System Executor'}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed max-w-xs xl:max-w-md italic">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Institutional Deletion Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative max-w-lg w-full rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-10 space-y-8 border-2 border-red-500/10 dark:border-red-900/20 transition-all animate-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="bg-red-100 dark:bg-red-900/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-red-200/50 dark:border-red-950/50">
                <svg className="w-12 h-12 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Permanent Erasure</h3>
                <p className="text-red-500 dark:text-red-400 text-[10px] font-black tracking-[0.4em] uppercase">Irreversible Command</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                You are executing a terminal command to purge <span className="text-gray-950 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-4">Case Archive #{c.id}</span>. This will destroy all linked proposals, messages, and document references.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                disabled={deleteLoading}
                onClick={async () => {
                  try {
                    setDeleteLoading(true);
                    await deleteCase(caseId);
                    router.push('/dashboard/admin/cases');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? 'Destroying Evidence...' : 'Execute Permanent Deletion'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-5 rounded-3xl font-bold border-gray-200 dark:border-gray-800 uppercase tracking-widest text-[10px]" 
                onClick={() => setShowDelete(false)} 
                disabled={deleteLoading}
              >
                Abort Command
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
