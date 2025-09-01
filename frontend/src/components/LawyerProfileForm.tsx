'use client';

import { useState, useEffect } from 'react';
import { lawyerProfileApi, type CreateLawyerProfileData, type Education, type BarAdmission, type LawyerProfile } from '@/lib/lawyer-profiles';
import Button from './Button';
import Card from './Card';

interface LawyerProfileFormProps {
  initialData?: Partial<CreateLawyerProfileData>;
  profileId?: number;
  onSuccess?: (profile: LawyerProfile) => void;
  onCancel?: () => void;
}

export default function LawyerProfileForm({ 
  initialData, 
  profileId, 
  onSuccess, 
  onCancel 
}: LawyerProfileFormProps) {
  const [formData, setFormData] = useState<CreateLawyerProfileData>({
    specializations: [],
    yearsExperience: 0,
    bio: '',
    officeAddress: '',
    serviceAreas: [],
    languages: [],
    education: [{ degree: '', university: '', year: new Date().getFullYear(), field: '' }],
    barAdmissions: [{ state: '', year: new Date().getFullYear(), barNumber: '' }],
    hourlyRate: undefined,
    consultationFee: undefined,
    availabilityStatus: 'available',
    ...initialData
  });

  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [availableServiceAreas, setAvailableServiceAreas] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [specializationsRes, serviceAreasRes, languagesRes] = await Promise.all([
        lawyerProfileApi.getSpecializations(),
        lawyerProfileApi.getServiceAreas(),
        lawyerProfileApi.getLanguages()
      ]);

      setAvailableSpecializations(specializationsRes.data);
      setAvailableServiceAreas(serviceAreasRes.data);
      setAvailableLanguages(languagesRes.data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleInputChange = (field: keyof CreateLawyerProfileData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field: 'specializations' | 'serviceAreas' | 'languages', value: string[]) => {
    handleInputChange(field, value);
  };

  const handleEducationChange = (index: number, field: keyof Education, value: unknown) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    handleInputChange('education', newEducation);
  };

  const addEducation = () => {
    handleInputChange('education', [
      ...formData.education,
      { degree: '', university: '', year: new Date().getFullYear(), field: '' }
    ]);
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      handleInputChange('education', newEducation);
    }
  };

  const handleBarAdmissionChange = (index: number, field: keyof BarAdmission, value: unknown) => {
    const newBarAdmissions = [...formData.barAdmissions];
    newBarAdmissions[index] = { ...newBarAdmissions[index], [field]: value };
    handleInputChange('barAdmissions', newBarAdmissions);
  };

  const addBarAdmission = () => {
    handleInputChange('barAdmissions', [
      ...formData.barAdmissions,
      { state: '', year: new Date().getFullYear(), barNumber: '' }
    ]);
  };

  const removeBarAdmission = (index: number) => {
    if (formData.barAdmissions.length > 1) {
      const newBarAdmissions = formData.barAdmissions.filter((_, i) => i !== index);
      handleInputChange('barAdmissions', newBarAdmissions);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.specializations.length === 0) {
      newErrors.specializations = 'At least one specialization is required';
    }

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = 'Years of experience must be non-negative';
    }

    if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (formData.officeAddress.length < 10) {
      newErrors.officeAddress = 'Office address must be at least 10 characters';
    }

    if (formData.serviceAreas.length === 0) {
      newErrors.serviceAreas = 'At least one service area is required';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    }

    if (formData.education.some(edu => !edu.degree || !edu.university || !edu.year)) {
      newErrors.education = 'All education entries must be complete';
    }

    if (formData.barAdmissions.some(bar => !bar.state || !bar.year)) {
      newErrors.barAdmissions = 'All bar admissions must be complete';
    }

    if (formData.hourlyRate && formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be positive';
    }

    if (formData.consultationFee && formData.consultationFee <= 0) {
      newErrors.consultationFee = 'Consultation fee must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;
      if (profileId) {
        response = await lawyerProfileApi.updateProfile(profileId, formData);
      } else {
        response = await lawyerProfileApi.createProfile(formData);
      }

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setErrors({ submit: response.message || 'Failed to save profile' });
      }
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorObj = error as { response?: { data?: { message?: string } } };
      setErrors({ submit: errorObj.response?.data?.message || 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {profileId ? 'Update Lawyer Profile' : 'Create Lawyer Profile'}
          </h2>
          <p className="mt-2 text-gray-600">
            {profileId ? 'Update your professional information' : 'Complete your professional profile to start connecting with clients'}
          </p>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specializations *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
            {availableSpecializations.map((spec) => (
              <label key={spec} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.specializations.includes(spec)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleArrayChange('specializations', [...formData.specializations, spec]);
                    } else {
                      handleArrayChange('specializations', formData.specializations.filter(s => s !== spec));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{spec}</span>
              </label>
            ))}
          </div>
          {errors.specializations && (
            <p className="mt-1 text-sm text-red-600">{errors.specializations}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter years of experience"
          />
          {errors.yearsExperience && (
            <p className="mt-1 text-sm text-red-600">{errors.yearsExperience}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your professional background, expertise, and approach to law..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.bio.length}/50 characters minimum
          </p>
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
          )}
        </div>

        {/* Office Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Office Address *
          </label>
          <textarea
            value={formData.officeAddress}
            onChange={(e) => handleInputChange('officeAddress', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your office address"
          />
          {errors.officeAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.officeAddress}</p>
          )}
        </div>

        {/* Service Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Areas *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
            {availableServiceAreas.map((area) => (
              <label key={area} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.serviceAreas.includes(area)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleArrayChange('serviceAreas', [...formData.serviceAreas, area]);
                    } else {
                      handleArrayChange('serviceAreas', formData.serviceAreas.filter(a => a !== area));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
          {errors.serviceAreas && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceAreas}</p>
          )}
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages Spoken *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
            {availableLanguages.map((lang) => (
              <label key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleArrayChange('languages', [...formData.languages, lang]);
                    } else {
                      handleArrayChange('languages', formData.languages.filter(l => l !== lang));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
          {errors.languages && (
            <p className="mt-1 text-sm text-red-600">{errors.languages}</p>
          )}
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education *
          </label>
          {formData.education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., J.D., LL.M."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  type="text"
                  value={edu.university}
                  onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={edu.year}
                  onChange={(e) => handleEducationChange(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  disabled={formData.education.length === 1}
                  className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
          >
            Add Education
          </button>
          {errors.education && (
            <p className="mt-1 text-sm text-red-600">{errors.education}</p>
          )}
        </div>

        {/* Bar Admissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bar Admissions *
          </label>
          {formData.barAdmissions.map((bar, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={bar.state}
                  onChange={(e) => handleBarAdmissionChange(index, 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., California, New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={bar.year}
                  onChange={(e) => handleBarAdmissionChange(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bar Number (Optional)</label>
                <input
                  type="text"
                  value={bar.barNumber || ''}
                  onChange={(e) => handleBarAdmissionChange(index, 'barNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bar number"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeBarAdmission(index)}
                  disabled={formData.barAdmissions.length === 1}
                  className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addBarAdmission}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
          >
            Add Bar Admission
          </button>
          {errors.barAdmissions && (
            <p className="mt-1 text-sm text-red-600">{errors.barAdmissions}</p>
          )}
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (Optional)
          </label>
          <input
            type="number"
            min="0"
            value={formData.hourlyRate || ''}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter hourly rate in USD"
          />
          {errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>
          )}
        </div>

        {/* Consultation Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultation Fee (Optional)
          </label>
          <input
            type="number"
            min="0"
            value={formData.consultationFee || ''}
            onChange={(e) => handleInputChange('consultationFee', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter consultation fee in USD"
          />
          {errors.consultationFee && (
            <p className="mt-1 text-sm text-red-600">{errors.consultationFee}</p>
          )}
        </div>

        {/* Availability Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability Status
          </label>
          <select
            value={formData.availabilityStatus}
            onChange={(e) => handleInputChange('availabilityStatus', e.target.value as 'available' | 'limited' | 'unavailable')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (profileId ? 'Update Profile' : 'Create Profile')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
