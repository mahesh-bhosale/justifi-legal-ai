'use client';

import { useState } from 'react';
import Button from './Button';
import Card from './Card';

export interface CaseFormData {
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
}

interface CaseFormProps {
  initialData?: Partial<CaseFormData>;
  onSubmit: (data: CaseFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const CATEGORIES = [
  'Criminal Law',
  'Civil Law',
  'Family Law',
  'Corporate Law',
  'Real Estate Law',
  'Personal Injury',
  'Employment Law',
  'Immigration Law',
  'Tax Law',
  'Intellectual Property',
  'Bankruptcy Law',
  'Environmental Law',
  'Healthcare Law',
  'Entertainment Law',
  'Sports Law',
  'International Law',
  'Constitutional Law',
  'Administrative Law',
  'Labor Law',
  'Securities Law',
  'Insurance Law',
  'Estate Planning',
  'Divorce Law',
  'Child Custody',
  'DUI/DWI',
  'Medical Malpractice',
  'Product Liability',
  'Workers Compensation',
  'Social Security',
  'Veterans Benefits'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Urdu',
  'Bengali',
  'Punjabi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Marathi',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Tagalog',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Czech',
  'Hungarian',
  'Romanian',
  'Bulgarian',
  'Greek',
  'Turkish',
  'Hebrew',
  'Persian',
  'Swahili',
  'Amharic',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Zulu',
  'Afrikaans'
];

export function CaseForm({ initialData, onSubmit, onCancel, isLoading = false, mode = 'create' }: CaseFormProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    urgency: initialData?.urgency || 'medium',
    preferredLanguage: initialData?.preferredLanguage || '',
    location: initialData?.location || '',
    budget: initialData?.budget || undefined,
  });

  const [errors, setErrors] = useState<Record<keyof CaseFormData, string | undefined>>({} as Record<keyof CaseFormData, string | undefined>);

  const validateForm = (): boolean => {
    const newErrors: Record<keyof CaseFormData, string | undefined> = {} as Record<keyof CaseFormData, string | undefined>;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.budget !== undefined && formData.budget <= 0) {
      newErrors.budget = 'Budget must be positive';
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

  const handleInputChange = (field: keyof CaseFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'Create New Case' : 'Edit Case'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Case Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of your legal issue"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide detailed information about your legal situation..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Legal Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - No immediate deadline</option>
                <option value="medium">Medium - Some time sensitivity</option>
                <option value="high">High - Urgent matter</option>
              </select>
            </div>
          </div>

          {/* Location and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, State or specific location"
              />
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                id="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any language</option>
                {LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                id="budget"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Leave blank if you'd like to discuss fees with lawyers
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2"
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Case' : 'Update Case'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
