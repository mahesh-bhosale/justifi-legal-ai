'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CaseProposalsContainer } from '../../../../../components/CaseProposalsContainer';
import { CaseMessagesContainer } from '../../../../../components/CaseMessagesContainer';
import { getCaseById, type Case } from '../../../../../lib/cases';
import Button from '../../../../../components/Button';
import {
  uploadDocument,
  fetchCaseDocuments,
  generateSignedUrl,
  type CaseDocument,
} from '../../../../../lib/caseDocuments';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function CitizenCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = parseInt(params.id as string);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages' | 'documents'>('overview');
  const { user } = useAuth();

  // Documents state
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

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
      loadDocuments();
    }
  }, [activeTab]);

  const handleBackToCases = () => {
    router.push('/dashboard/citizen/cases');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'proposals', label: 'Proposals', icon: '💼' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button 
            onClick={handleBackToCases}
            variant="outline"
            className="mb-4"
          >
            ← Back to Cases
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <p className="text-gray-600">Case ID: #{caseData.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
            {caseData.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(caseData.urgency)}`}>
            {caseData.urgency.toUpperCase()} PRIORITY
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
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
                    <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
                    <dd className="text-sm text-gray-900">{caseData.preferredLanguage || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(caseData.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(caseData.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  {caseData.nextHearingDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Next Hearing</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(caseData.nextHearingDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {caseData.resolution && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Resolution</dt>
                      <dd className="text-sm text-gray-900">{caseData.resolution}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'proposals' && (
          <CaseProposalsContainer 
            caseId={caseId}
            userRole="citizen"
            onProposalUpdate={fetchCase}
          />
        )}

        {activeTab === 'messages' && (
          <CaseMessagesContainer 
            caseId={caseId}
            userRole="citizen"
          />
        )}

        {activeTab === 'documents' && (
          <Card className="p-6">
            <div className="space-y-8">
              {/* Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload documents related to this case. Supported file types depend on your browser.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      File
                    </label>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setSelectedFile(file);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add a short description (e.g. FIR copy, agreement, evidence, etc.)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {documentsError && (
                    <p className="text-sm text-red-600">{documentsError}</p>
                  )}

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
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                <p className="text-sm text-gray-600 mb-4">
                  All documents uploaded for this case.
                </p>

                {documentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">File Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Uploaded By</th>
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
                            <td className="px-4 py-2 text-gray-700">
                              {doc.uploadedByName || 'Unknown'}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {new Date(doc.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-gray-700 max-w-xs">
                              {doc.description || '—'}
                            </td>
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
    </div>
  );
}
