'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CaseProposalsContainer } from '../../../../../components/CaseProposalsContainer';
import { CaseMessagesContainer } from '../../../../../components/CaseMessagesContainer';
import {
  getCaseById,
  updateCase,
  withdrawCase,
  WITHDRAW_REASON_PRESETS,
  formatResolutionDisplay,
  caseStatusLabel,
  type Case,
} from '../../../../../lib/cases';
import { getCaseProposals, type CaseProposal } from '../../../../../lib/proposals';
import Button from '../../../../../components/Button';
import {
  uploadDocument,
  fetchCaseDocuments,
  generateSignedUrl,
  type CaseDocument,
} from '../../../../../lib/caseDocuments';
import { useAuth } from '../../../../../contexts/AuthContext';
import ReviewForm from '../../../../../components/ReviewForm';
import { getCaseReviewEligibility, type CaseReviewEligibility } from '../../../../../lib/reviews';

function CitizenCaseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = parseInt(params.id as string);

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [proposals, setProposals] = useState<CaseProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages' | 'documents'>('overview');
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUrgency, setEditUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [editPreferredLanguage, setEditPreferredLanguage] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState<string>(WITHDRAW_REASON_PRESETS[0]);
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [reviewEligibility, setReviewEligibility] = useState<CaseReviewEligibility | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadProposals = useCallback(async () => {
    try {
      const data = await getCaseProposals(caseId);
      setProposals(data);
    } catch {
      setProposals([]);
    }
  }, [caseId]);

  const fetchCase = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
      setEditCategory(data.category);
      setEditUrgency(data.urgency);
      setEditPreferredLanguage(data.preferredLanguage ?? '');
      setEditLocation(data.location ?? '');
      setEditBudget(data.budget != null ? String(data.budget) : '');
      await loadProposals();
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  }, [caseId, loadProposals]);

  useEffect(() => {
    if (caseId) {
      void fetchCase();
    }
  }, [caseId, fetchCase]);

  useEffect(() => {
    const loadReviewEligibility = async () => {
      // Only citizens who own the case can rate.
      if (!caseData || !user) return;
      const role = user.role?.toLowerCase().trim();
      if (role !== 'citizen') return;
      if (user.id !== caseData.citizenId) return;
      if (!(caseData.status === 'resolved' || caseData.status === 'closed')) return;
      if (!caseData.lawyerId) return;

      setReviewLoading(true);
      setReviewError(null);
      try {
        const data = await getCaseReviewEligibility(caseId);
        setReviewEligibility(data);
      } catch (error: unknown) {
        console.error('Error loading review eligibility:', error);
        const ax = error as { response?: { data?: { message?: string } } };
        setReviewError(ax.response?.data?.message || 'Failed to load review status.');
        setReviewEligibility(null);
      } finally {
        setReviewLoading(false);
      }
    };

    void loadReviewEligibility();
  }, [caseData, caseId, user]);

  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setEditing(true);
    }
    if (searchParams.get('withdraw') === '1') {
      setShowWithdrawModal(true);
    }
  }, [searchParams]);

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const data = await fetchCaseDocuments(caseId);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocumentsError('Failed to load documents. Please try again.');
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      void loadDocuments();
    }
  }, [activeTab]);

  const handleBackToCases = () => {
    router.push('/dashboard/citizen/cases');
  };

  const getStatusColor = (status: string) => {
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
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
        <p className="text-gray-500">The case you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={handleBackToCases} className="mt-4">
          Back to Cases
        </Button>
      </div>
    );
  }

  const hasAcceptedProposal = proposals.some((p) => p.status === 'accepted');
  const canEdit =
    caseData.status === 'pending' || caseData.status === 'pending_lawyer_acceptance';
  const canWithdraw =
    canEdit && !caseData.lawyerId && !hasAcceptedProposal;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'proposals', label: 'Proposals', icon: '💼' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ];

  const terminalStatuses = ['resolved', 'closed', 'rejected'];
  const isTerminal = terminalStatuses.includes(caseData.status);

  const resolutionDisplay = formatResolutionDisplay(caseData.resolution, caseData.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button onClick={handleBackToCases} variant="outline" className="mb-4">
            ← Back to Cases
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <p className="text-gray-600">Case ID: #{caseData.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
            {caseStatusLabel(caseData.status).toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(caseData.urgency)}`}>
            {caseData.urgency.toUpperCase()} PRIORITY
          </span>
        </div>
      </div>

      {isTerminal && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            caseData.status === 'resolved'
              ? 'bg-green-50 border-green-200 text-green-900'
              : caseData.status === 'rejected'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}
        >
          {caseData.status === 'resolved' && 'This case is resolved.'}
          {caseData.status === 'closed' && 'This case is closed.'}
          {caseData.status === 'rejected' && 'This request was rejected.'}
        </div>
      )}

      {caseData.status === 'pending_lawyer_acceptance' && caseData.lawyerId && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This case cannot be withdrawn because a lawyer has already been assigned.
        </div>
      )}

      {!canWithdraw && canEdit && hasAcceptedProposal && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          A proposal has been accepted; withdrawing is no longer available.
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <Card className="p-6">
            {canEdit && (
              <div className="mb-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(!editing);
                    setSaveError(null);
                    if (!editing) {
                      setEditTitle(caseData.title);
                      setEditDescription(caseData.description);
                      setEditCategory(caseData.category);
                      setEditUrgency(caseData.urgency);
                      setEditPreferredLanguage(caseData.preferredLanguage ?? '');
                      setEditLocation(caseData.location ?? '');
                      setEditBudget(caseData.budget != null ? String(caseData.budget) : '');
                    }
                  }}
                >
                  {editing ? 'Cancel edit' : 'Edit case'}
                </Button>
                {canWithdraw && (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setWithdrawError(null);
                      setShowWithdrawModal(true);
                    }}
                  >
                    Withdraw case
                  </Button>
                )}
              </div>
            )}

            {editing && canEdit && (
              <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-4">
                <h3 className="text-md font-semibold text-gray-900">Edit case details</h3>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editUrgency}
                      onChange={(e) => setEditUrgency(e.target.value as typeof editUrgency)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (INR)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred language</label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editPreferredLanguage}
                      onChange={(e) => setEditPreferredLanguage(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setSaveError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving || editTitle.trim().length < 3 || editDescription.trim().length < 10}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        setSaveError(null);
                        const budgetNum = editBudget.trim() === '' ? undefined : parseFloat(editBudget);
                        if (budgetNum !== undefined && (Number.isNaN(budgetNum) || budgetNum <= 0)) {
                          setSaveError('Enter a valid positive budget or leave empty.');
                          return;
                        }
                        const updated = await updateCase(caseId, {
                          title: editTitle.trim(),
                          description: editDescription.trim(),
                          category: editCategory.trim(),
                          urgency: editUrgency,
                          preferredLanguage: editPreferredLanguage.trim() || undefined,
                          location: editLocation.trim() || undefined,
                          budget: budgetNum,
                        });
                        setCaseData(updated);
                        setEditing(false);
                      } catch (err: unknown) {
                        console.error(err);
                        setSaveError('Could not save changes. You may only edit while the case is pending.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900 capitalize">{caseData.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{caseData.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{caseData.location || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.budget ? `₹${caseData.budget}` : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred language</dt>
                    <dd className="text-sm text-gray-900">{caseData.preferredLanguage || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{new Date(caseData.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                    <dd className="text-sm text-gray-900">{new Date(caseData.updatedAt).toLocaleDateString()}</dd>
                  </div>
                  {caseData.nextHearingDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Next hearing</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(caseData.nextHearingDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {caseData.status === 'resolved' && caseData.resolution && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Resolution</dt>
                      <dd className="text-sm text-gray-900 whitespace-pre-wrap">{caseData.resolution}</dd>
                    </div>
                  )}
                  {caseData.status === 'closed' && resolutionDisplay && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        {caseData.resolution?.startsWith('WITHDRAWAL_REASON:') ? 'Withdrawal reason' : 'Note'}
                      </dt>
                      <dd className="text-sm text-gray-900 whitespace-pre-wrap">{resolutionDisplay}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {user?.role?.toLowerCase().trim() === 'citizen' &&
              user.id === caseData.citizenId &&
              (caseData.status === 'resolved' || caseData.status === 'closed') &&
              caseData.lawyerId && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">Rate Lawyer</h3>
                      <p className="text-sm text-gray-600">
                        Help other citizens by sharing your experience.
                      </p>
                    </div>
                    {reviewLoading || reviewEligibility === null ? (
                      <span className="text-sm text-gray-500">Checking eligibility…</span>
                    ) : reviewEligibility.hasReviewForCase || reviewEligibility.hasUserReviewedLawyer ? (
                      <span className="text-sm font-medium text-gray-700">
                        You have already reviewed this lawyer
                      </span>
                    ) : (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowReviewForm(true)}
                      >
                        Rate Lawyer
                      </Button>
                    )}
                  </div>
                  {reviewError && <p className="mt-2 text-sm text-red-600">{reviewError}</p>}
                </div>
              )}
          </Card>
        )}

        {activeTab === 'proposals' && (
          <CaseProposalsContainer caseId={caseId} userRole="citizen" onProposalUpdate={fetchCase} />
        )}

        {activeTab === 'messages' && <CaseMessagesContainer caseId={caseId} userRole="citizen" />}

        {activeTab === 'documents' && (
          <Card className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload document</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload documents related to this case. Supported file types depend on your browser.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">File</label>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add a short description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  {documentsError && <p className="text-sm text-red-600">{documentsError}</p>}
                  <div className="flex justify-end">
                    <Button
                      onClick={async () => {
                        if (!selectedFile) {
                          setDocumentsError('Please select a file to upload.');
                          return;
                        }
                        if (!user) {
                          setDocumentsError('You must be logged in to upload documents.');
                          return;
                        }
                        try {
                          setUploading(true);
                          setDocumentsError(null);
                          await uploadDocument(caseId, {
                            file: selectedFile,
                            description: description.trim() || undefined,
                          });
                          setSelectedFile(null);
                          setDescription('');
                          await loadDocuments();
                        } catch (error) {
                          console.error('Error uploading document:', error);
                          setDocumentsError('Failed to upload document. Please try again.');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading…' : 'Upload document'}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">No documents uploaded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">File name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Uploaded by</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-4 py-2 text-gray-900">
                              {doc.fileName}
                              {doc.fileSize ? (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({(doc.fileSize / 1024).toFixed(1)} KB)
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-2 text-gray-700">{doc.uploadedByName || 'Unknown'}</td>
                            <td className="px-4 py-2 text-gray-700">{new Date(doc.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-2 text-gray-700 max-w-xs">{doc.description || '—'}</td>
                            <td className="px-4 py-2 text-gray-700">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const url = await generateSignedUrl(caseId, doc.id);
                                      window.open(url, '_blank');
                                    } catch (error) {
                                      console.error('Error opening document:', error);
                                      setDocumentsError('Failed to open document. Please try again.');
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const url = await generateSignedUrl(caseId, doc.id);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = doc.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } catch (error) {
                                      console.error('Error downloading document:', error);
                                      setDocumentsError('Failed to download document. Please try again.');
                                    }
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {showReviewForm && caseData && caseData.lawyerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-lg w-full rounded-lg bg-white shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Rate Lawyer</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewError(null);
                }}
              >
                Close
              </Button>
            </div>

            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}

            <ReviewForm
              caseId={caseId}
              lawyerId={caseData.lawyerId}
              onSubmitSuccess={() => {
                setShowReviewForm(false);
                setReviewError(null);
                setReviewLoading(true);

                void getCaseReviewEligibility(caseId)
                  .then((data) => setReviewEligibility(data))
                  .catch((error: unknown) => {
                    console.error('Error refreshing review eligibility:', error);
                    const ax = error as { response?: { data?: { message?: string } } };
                    setReviewError(ax.response?.data?.message || 'Failed to refresh review status.');
                  })
                  .finally(() => setReviewLoading(false));
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setReviewError(null);
              }}
            />
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-lg w-full rounded-lg bg-white shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Withdraw this case?</h3>
            <p className="text-sm text-gray-600">Why are you withdrawing this case?</p>
            {withdrawError && <p className="text-sm text-red-600">{withdrawError}</p>}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {WITHDRAW_REASON_PRESETS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="withdraw-reason"
                    checked={withdrawReason === r}
                    onChange={() => setWithdrawReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Optional note</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={2}
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                placeholder="Add any extra context"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={withdrawSubmitting || !withdrawReason}
                onClick={async () => {
                  try {
                    setWithdrawSubmitting(true);
                    setWithdrawError(null);
                    await withdrawCase(
                      caseId,
                      withdrawReason,
                      withdrawNote.trim() || undefined
                    );
                    setShowWithdrawModal(false);
                    router.push('/dashboard/citizen/cases');
                  } catch (err: unknown) {
                    const ax = err as { response?: { data?: { message?: string } } };
                    setWithdrawError(ax.response?.data?.message || 'Withdrawal failed.');
                  } finally {
                    setWithdrawSubmitting(false);
                  }
                }}
              >
                {withdrawSubmitting ? 'Withdrawing…' : 'Confirm withdrawal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CitizenCaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CitizenCaseDetailContent />
    </Suspense>
  );
}
