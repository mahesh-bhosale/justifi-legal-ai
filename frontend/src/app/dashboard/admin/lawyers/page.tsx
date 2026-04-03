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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Institutional Header */}
      <div className="border-l-4 border-amber-500 pl-6 py-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">Credentialing Department</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">
          Review, analyze, and verify legal practitioners within the Justifi Institutional Network. 
          Ensure all professionals meet our rigorous standards for digital legal services.
        </p>
      </div>

      <Card className="p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xl rounded-[2.5rem]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] animate-pulse">Syncing Practitioner Database...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-24 group">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">No practitioner records discovered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-y border-gray-100 dark:border-gray-800">
                  <th className="px-8 py-5">Practitioner Entity</th>
                  <th className="px-8 py-5">Core Specializations</th>
                  <th className="px-8 py-5">Tenure</th>
                  <th className="px-8 py-5">Trust Quotient</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/5 dark:hover:bg-amber-900/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center font-black text-amber-700 dark:text-amber-500 text-lg shadow-inner group-hover:rotate-6 transition-transform overflow-hidden">
                          {p.avatarUrl ? (
                            <img 
                              src={p.avatarUrl} 
                              alt={p.user?.name || 'Practitioner'} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            p.user?.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tight">
                            {p.user?.name || 'Unidentified Practitioner'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {p.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {p.specializations.map((s, idx) => (
                          <span key={idx} className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{p.yearsExperience}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cycles</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          {p.rating?.toFixed ? p.rating.toFixed(1) : p.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {p.verified ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse"></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-400">Validated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">Unprocessed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {!p.verified ? (
                        <Button
                          onClick={() => handleVerify(p.id)}
                          disabled={verifyingId === p.id}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2 rounded-xl shadow-lg shadow-amber-600/20 transition-all active:scale-95 disabled:grayscale"
                        >
                          {verifyingId === p.id ? 'Processing...' : 'Authorize'}
                        </Button>
                      ) : (
                        <div className="text-green-600 dark:text-green-400">
                          <svg className="w-6 h-6 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
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

