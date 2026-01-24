'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import { CaseForm } from '@/components/CaseForm';
import { createCase, type CreateCaseInput } from '@/lib/cases';

function CreateCaseWithLawyerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lawyerId = searchParams.get('lawyerId');
  const lawyerName = searchParams.get('lawyerName');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check role (case-insensitive, trimmed)
    const userRole = user.role?.toLowerCase().trim();
    if (userRole !== 'citizen') {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (data: CreateCaseInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const caseData: CreateCaseInput = {
        ...data,
        preferredLawyerId: lawyerId || undefined,
      };
      
      const newCase = await createCase(caseData);
      
      if (lawyerId) {
        // Direct contact case - show success message
        alert('Your case has been submitted to the lawyer. They will review and respond soon.');
        router.push(`/dashboard/citizen/cases/${newCase.id}`);
      } else {
        router.push(`/dashboard/citizen/cases/${newCase.id}`);
      }
    } catch (error: any) {
      console.error('Error creating case:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create case';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (lawyerId) {
      router.back();
    } else {
      router.push('/dashboard/citizen/cases');
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen in useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role (case-insensitive, trimmed)
  const userRole = user.role?.toLowerCase().trim();
  if (userRole !== 'citizen') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
          {lawyerName && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Contacting:</span> {lawyerName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This case will be sent directly to {lawyerName} for review. They will respond to your request.
              </p>
            </div>
          )}
          <p className="text-gray-600 mt-2">
            Describe your legal issue to help {lawyerName ? 'the lawyer' : 'lawyers'} understand how they can assist you
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Case Form */}
        <Card className="p-6">
          <CaseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={loading}
            mode="create"
          />
        </Card>
      </div>
    </div>
  );
}

export default function CreateCaseWithLawyerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CreateCaseWithLawyerContent />
    </Suspense>
  );
}

