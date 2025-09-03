'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CaseForm } from '../../../../../components/CaseForm';
import { createCase, type CreateCaseInput } from '../../../../../lib/cases';

export default function CreateCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateCaseInput) => {
    try {
      setLoading(true);
      const newCase = await createCase(data);
      router.push(`/dashboard/citizen/cases/${newCase.id}`);
    } catch (error) {
      console.error('Error creating case:', error);
      // You can add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/citizen/cases');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
        <p className="text-gray-600">
          Describe your legal issue to help lawyers understand how they can assist you
        </p>
      </div>

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
  );
}
