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
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loadError || !c) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{loadError || 'Case not found'}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/admin/cases')}>
          Back to cases
        </Button>
      </div>
    );
  }

  const resolutionDisplay = formatResolutionDisplay(c.resolution, c.status);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <Button variant="outline" className="mb-2" onClick={() => router.push('/dashboard/admin/cases')}>
            ← All cases
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{c.title}</h1>
          <p className="text-gray-600">
            Case #{c.id} · {caseStatusLabel(c.status)}
          </p>
        </div>
        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setShowDelete(true)}>
          Delete case
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Case data</h2>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-gray-500">Category</dt>
              <dd className="text-gray-900">{c.category}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Description</dt>
              <dd className="text-gray-900 whitespace-pre-wrap">{c.description}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Citizen ID</dt>
              <dd className="font-mono text-xs break-all">{c.citizenId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Lawyer ID</dt>
              <dd className="font-mono text-xs break-all">{c.lawyerId ?? '—'}</dd>
            </div>
            {c.resolution && (
              <div>
                <dt className="text-gray-500">
                  {c.status === 'closed' && c.resolution.startsWith('WITHDRAWAL_REASON:') ? 'Withdrawal' : 'Resolution'}
                </dt>
                <dd className="text-gray-900 whitespace-pre-wrap">{resolutionDisplay ?? c.resolution}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Status override</h2>
          <p className="text-sm text-gray-600">
            Only valid transitions are allowed (same rules as lawyers and citizens). Changing status is logged.
          </p>
          {allowedTargets.length === 0 ? (
            <p className="text-sm text-gray-500">This case is in a terminal state; no further status changes.</p>
          ) : (
            <>
              {statusError && <p className="text-sm text-red-600">{statusError}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as CaseStatus | '')}
                >
                  <option value="">Select…</option>
                  {allowedTargets.map((s) => (
                    <option key={s} value={s}>
                      {caseStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              {nextStatus === 'resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution (required)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[100px]"
                    value={overrideResolution}
                    onChange={(e) => setOverrideResolution(e.target.value)}
                    placeholder="Outcome summary"
                  />
                </div>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
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
                    setStatusError(ax.response?.data?.message || 'Update failed; transition may not be allowed.');
                  } finally {
                    setStatusSaving(false);
                  }
                }}
              >
                {statusSaving ? 'Saving…' : 'Apply status'}
              </Button>
            </>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h2>
        {proposals.length === 0 ? (
          <p className="text-sm text-gray-500">No proposals.</p>
        ) : (
          <ul className="space-y-3">
            {proposals.map((p) => (
              <li key={p.id} className="border border-gray-200 rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${proposalStatusClass(p.status)}`}>
                    {p.status}
                  </span>
                  <span className="font-mono text-xs text-gray-500">{p.lawyerId}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{p.proposalText}</p>
                {p.proposedFee != null && <p className="mt-2 text-gray-600">Fee: ₹{p.proposedFee}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit log</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">By</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {audit.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.updateType}</td>
                    <td className="py-2 pr-4">{row.updatedByName ?? row.updatedBy.slice(0, 8) + '…'}</td>
                    <td className="py-2 text-gray-800">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md w-full rounded-lg bg-white shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete this case?</h3>
            <p className="text-sm text-gray-600">
              Permanently remove case #{c.id} and related data. An audit row is written first; then the row is deleted.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleteLoading}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
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
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
