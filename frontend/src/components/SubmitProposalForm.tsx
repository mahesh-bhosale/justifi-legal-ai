'use client';

import { useState } from 'react';
import Button from './Button';
import Card from './Card';
import { CreateProposalInput } from '@/lib/proposals';

interface SubmitProposalFormProps {
  caseId: number;
  onSubmit: (data: CreateProposalInput) => void;
  isLoading?: boolean;
}

export function SubmitProposalForm({ caseId, onSubmit, isLoading = false }: SubmitProposalFormProps) {
  const [formData, setFormData] = useState<CreateProposalInput>({
    proposalText: '',
    proposedFee: undefined,
    estimatedDuration: '',
  });

  const [errors, setErrors] = useState<Record<keyof CreateProposalInput, string | undefined>>({} as Record<keyof CreateProposalInput, string | undefined>);

  const validateForm = (): boolean => {
    const newErrors: Record<keyof CreateProposalInput, string | undefined> = {} as Record<keyof CreateProposalInput, string | undefined>;

    if (!formData.proposalText.trim()) {
      newErrors.proposalText = 'Proposal text is required';
    } else if (formData.proposalText.length < 10) {
      newErrors.proposalText = 'Proposal must be at least 10 characters';
    }

    if (formData.proposedFee !== undefined && formData.proposedFee <= 0) {
      newErrors.proposedFee = 'Fee must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateProposalInput, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-6">Submit Proposal</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Present your approach and qualifications for this case. Be specific about your strategy and experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proposal Text */}
          <div>
            <label htmlFor="proposalText" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Your Proposal *
            </label>
            <textarea
              id="proposalText"
              value={formData.proposalText}
              onChange={(e) => handleInputChange('proposalText', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
                errors.proposalText ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="Describe your approach to this case, relevant experience, and why you're the right lawyer for this matter..."
            />
            {errors.proposalText && <p className="mt-1 text-sm text-red-600">{errors.proposalText}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Minimum 10 characters. Be detailed about your strategy and qualifications.
            </p>
          </div>

          {/* Proposed Fee and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proposedFee" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Proposed Fee (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">₹</span>
                <input
                  type="number"
                  id="proposedFee"
                  value={formData.proposedFee || ''}
                  onChange={(e) => handleInputChange('proposedFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
                    errors.proposedFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.proposedFee && <p className="mt-1 text-sm text-red-600">{errors.proposedFee}</p>}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Leave blank if you prefer to discuss fees later
              </p>
            </div>

            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Estimated Duration (Optional)
              </label>
              <input
                type="text"
                id="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., 3-6 months, 1 year"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Provide a realistic timeline estimate
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">💡 Tips for a Strong Proposal</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-500/80 space-y-1">
              <li>• Highlight relevant experience in this area of law</li>
              <li>• Explain your specific approach to this case</li>
              <li>• Mention any special qualifications or certifications</li>
              <li>• Be clear about communication and availability</li>
              <li>• Show understanding of the client&apos;s situation</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2"
            >
              {isLoading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
