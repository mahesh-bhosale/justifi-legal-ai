'use client';

import SettingsForm from '@/components/SettingsForm';

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 lg:py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        <SettingsForm />
      </div>
    </div>
  );
}

