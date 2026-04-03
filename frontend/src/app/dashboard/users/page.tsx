'use client';

import { useEffect, useState } from 'react';
import Card from '../../../components/Card';
import { fetchAdminUsers, type AdminUsersResponse } from '../../../lib/admin';

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAdminUsers();
        setData(result);
      } catch (err) {
        console.error('Failed to load users', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const renderUserList = (
    title: string,
    users: AdminUsersResponse['citizens'] | undefined,
  ) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {users && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Verified</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {u.name || '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300 capitalize">{u.role}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {u.verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">No users found.</p>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all platform users grouped by role.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 dark:border-yellow-500" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderUserList('Citizens', data?.citizens)}
          {renderUserList('Lawyers', data?.lawyers)}
          {renderUserList('Admins', data?.admins)}
        </div>
      )}
    </div>
  );
}

