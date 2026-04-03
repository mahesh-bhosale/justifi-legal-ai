'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { profileApi, type UserProfile } from '@/lib/profile';
import { useAuth } from '@/contexts/AuthContext';

interface CitizenProfileFormState {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export default function CitizenProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<CitizenProfileFormState>({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const res = await profileApi.getProfile();
        if (res.success) {
          setProfile(res.data);
          setForm((prev) => ({
            ...prev,
            name: res.data.name,
            email: res.data.email,
          }));
        } else {
          setError(res.message || 'Failed to load profile');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof CitizenProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await profileApi.updateProfile({
        name: form.name.trim() || profile?.name,
      });

      if (!res.success) {
        setError(res.message || 'Failed to save profile');
        return;
      }

      setProfile(res.data);
      setSuccess('Profile updated successfully');

      setUser({
        ...(user || {
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        }),
        name: res.data.name,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error loading profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your basic account information.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-md text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
                Email changes are handled by support for security reasons.
              </p>
            </div>

        

            

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

