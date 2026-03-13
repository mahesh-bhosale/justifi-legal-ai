'use client';

import { useEffect, useState } from 'react';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import lawyerProfileApi, { type LawyerProfile } from '../../../../lib/lawyer-profiles';

export default function AdminLawyersPage() {
  const [profiles, setProfiles] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await lawyerProfileApi.getProfiles();
        setProfiles(response.data);
      } catch (err) {
        console.error('Failed to load lawyer profiles', err);
        setError('Failed to load lawyer profiles');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      setVerifyingId(id);
      const response = await lawyerProfileApi.verifyProfile(id);
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? response.data : p)),
      );
    } catch (err) {
      console.error('Failed to verify profile', err);
      alert('Failed to verify profile');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Lawyers</h1>
        <p className="text-gray-600">
          Review and verify lawyer profiles on the platform.
        </p>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-gray-600">No lawyer profiles found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Specializations</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Experience</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Rating</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Verified</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      {p.user?.name || 'Unnamed Lawyer'}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {p.specializations.join(', ')}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {p.yearsExperience} yrs
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {p.rating?.toFixed ? p.rating.toFixed(1) : p.rating}
                    </td>
                    <td className="px-4 py-2">
                      {p.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!p.verified && (
                        <Button
                          onClick={() => handleVerify(p.id)}
                          disabled={verifyingId === p.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                        >
                          {verifyingId === p.id ? 'Verifying...' : 'Verify'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

