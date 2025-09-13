'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatWindow } from '@/components/chat';
import axios from 'axios';
import Cookies from 'js-cookie';

interface CaseData {
  id: number;
  citizenId: string;
  lawyerId: string | null;
  title: string;
  status: string;
}

interface UserData {
  id: string;
  name: string;
  role: string;
}

export default function CaseChatPage() {
  const params = useParams();
  const caseId = parseInt(params.id as string);
  
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        // Load case data and current user in parallel
        const [caseResponse, userResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/protected/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        if (caseResponse.data.success && userResponse.data.success) {
          setCaseData(caseResponse.data.data);
          setCurrentUser(userResponse.data.data);
        } else {
          setError('Failed to load case or user data');
        }
      } catch (err: unknown) {
        console.error('Error loading data:', err);
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as { message?: string } | undefined;
          setError(data?.message || err.message || 'Failed to load data');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      loadData();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Case or user data not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine recipient based on current user role
  const isCurrentUserCitizen = currentUser.id === caseData.citizenId;
  const recipientId = isCurrentUserCitizen 
    ? (caseData.lawyerId && caseData.lawyerId.trim() !== '' ? caseData.lawyerId : '') 
    : caseData.citizenId;
  const recipientName = isCurrentUserCitizen ? 'Lawyer' : 'Client';
  
  console.log('Chat page debug:', {
    currentUserId: currentUser.id,
    citizenId: caseData.citizenId,
    lawyerId: caseData.lawyerId,
    isCurrentUserCitizen,
  });

  if (!recipientId || recipientId.trim() === '') {
    console.warn('Page recipientId is empty, ChatWindow will derive it from case data');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">
              Chat - Case #{caseData.id}
            </h1>
            <p className="text-gray-600 mt-2">{caseData.title}</p>
          </div>

          {/* Debug Info Panel */}
          <div className="p-4 bg-gray-100 border-b">
            <h3 className="font-semibold text-gray-700 mb-2">Debug Info:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Current User:</strong> {currentUser.name} (ID: {currentUser.id})</p>
              <p><strong>Case Citizen:</strong> ID {caseData.citizenId}</p>
              <p><strong>Case Lawyer:</strong> {caseData.lawyerId ? `ID ${caseData.lawyerId}` : 'Not assigned'}</p>
              <p><strong>Is Current User Citizen:</strong> {isCurrentUserCitizen ? 'Yes' : 'No'}</p>
              <p><strong>Recipient ID:</strong> {recipientId || 'EMPTY/NULL'}</p>
              <p><strong>Recipient Name:</strong> {recipientName}</p>
            </div>
          </div>

          <ChatWindow
            caseId={caseData.id}
            recipientId={recipientId}
            recipientName={recipientName}
          />
        </div>
      </div>
    </div>
  );
}
