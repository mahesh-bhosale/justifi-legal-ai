'use client';

import { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { profileApi } from '@/lib/profile';

export default function SettingsForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await profileApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (!res.success) {
        setError(res.message || 'Failed to change password');
        return;
      }

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden max-w-2xl bg-white dark:bg-gray-900/50 backdrop-blur-md">
      <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-900"></div>
      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div className="border-l-4 border-amber-600 dark:border-amber-500 pl-6 py-2 transition-all">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">Account Security</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">
            Manage your credentials and institutional access security.
          </p>
        </div>

        {error && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-900/30 text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-3 animate-shake shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-900/30 text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-3 shadow-sm transition-all duration-500">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 whitespace-nowrap">Security Parameters</h2>
             <div className="h-px bg-gray-100 dark:bg-gray-800 w-full rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <div className="group transition-all">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-amber-600 transition-colors">
                Verification of Current Identity
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                required
                autoComplete="current-password"
                placeholder="CURRENT PASSWORD"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group transition-all">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-amber-600 transition-colors">
                  New Credential
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                  required
                  autoComplete="new-password"
                  placeholder="NEW PASSWORD"
                />
              </div>

              <div className="group transition-all">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-amber-600 transition-colors">
                  Confirmation
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                  required
                  placeholder="RE-ENTER PASSWORD"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
           <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">
             Credentials must meet institutional complexity standards.
           </p>
           <Button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl text-md font-bold shadow-xl shadow-amber-600/10 active:scale-95 transition-all"
           >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </span>
            ) : 'Commit Updates'}
          </Button>
        </div>
      </form>
    </Card>

  );
}

