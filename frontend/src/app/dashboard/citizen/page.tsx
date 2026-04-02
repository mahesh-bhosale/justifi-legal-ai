'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/Card';
import LawyerSearch from '../../../components/LawyerSearch';
import { type LawyerProfile } from '../../../lib/lawyer-profiles';
import {
  fetchCitizenCaseHistory,
  fetchCitizenDashboard,
  fetchCitizenPredictionUsage,
} from '../../../lib/analytics';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import PieChartComponent from '../../../components/charts/PieChartComponent';
import BarChartComponent from '../../../components/charts/BarChartComponent';

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [showLawyerSearch, setShowLawyerSearch] = useState(false);
  const [summary, setSummary] = useState<{
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    predictionCount: number;
  } | null>(null);
  const [history, setHistory] = useState<{ id: number; status: string; createdAt: string }[]>([]);
  const [predictionUsage, setPredictionUsage] = useState<{ date: string; count: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [dashboard, historyData, predictionData] = await Promise.all([
        fetchCitizenDashboard(),
        fetchCitizenCaseHistory(),
        fetchCitizenPredictionUsage(),
      ]);
      setSummary(dashboard);
      setHistory(historyData);
      setPredictionUsage(predictionData);
    } catch (error) {
      console.error('Error fetching citizen analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };


  const handleViewLawyerProfile = (profile: LawyerProfile) => {
    // Navigate to the detailed lawyer profile page
    router.push(`/lawyers/${profile.id}`);
  };

  const handleContactLawyer = (profile: LawyerProfile) => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    if (!profile?.userId) return;

    // Check if user is logged in
    if (!user) {
      // Redirect to login with lawyer info preserved in query params
      const lawyerId = profile.userId;
      const lawyerName = profile.user?.name || 'Lawyer';
      router.push(`/auth/login?lawyerId=${lawyerId}&lawyerName=${encodeURIComponent(lawyerName)}`);
      return;
    }

    // Check role (case-insensitive, trimmed)
    const userRole = user.role?.toLowerCase().trim();
    if (userRole !== 'citizen') {
      router.push('/dashboard');
      return;
    }

    // Redirect to case creation with lawyer pre-selection
    router.push(`/cases/create?lawyerId=${profile.userId}&lawyerName=${encodeURIComponent(profile.user?.name || 'Lawyer')}`);
  };

  const navigateToLawyersPage = () => {
    router.push('/lawyers');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Legal Dashboard
        </h1>
        <p className="text-gray-600">
          Access your legal documents, track case progress, get AI-powered legal assistance, and find qualified lawyers.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.activeCases ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.resolvedCases ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.totalCases ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.predictionCount ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Case History Timeline
          </h3>
          <LineChartComponent
            data={Object.values(
              history.reduce((acc, h) => {
                const date = new Date(h.createdAt).toLocaleDateString();
                if (!acc[date]) {
                  acc[date] = { label: date, count: 0 };
                }
                acc[date].count += 1;
                return acc;
              }, {} as Record<string, { label: string; count: number }>)
            ).sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())}
            xKey="label"
            yKey="count"
            loading={analyticsLoading}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Case Status Distribution
          </h3>
          <PieChartComponent
            data={Object.values(
              history.reduce((acc, h) => {
                const key = h.status;
                acc[key] = acc[key] || { label: key, count: 0 };
                acc[key].count += 1;
                return acc;
              }, {} as Record<string, { label: string; count: number }>)
            )}
            nameKey="label"
            valueKey="count"
            loading={analyticsLoading}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Prediction Usage Over Time
          </h3>
          <BarChartComponent
            data={predictionUsage.map((p) => ({
              label: p.date,
              count: p.count,
            }))}
            xKey="label"
            yKey="count"
            loading={analyticsLoading}
          />
        </Card>

        {/* existing Quick Actions / Lawyer Search cards remain below */}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/dashboard/citizen/cases/new')}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Start New Case</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/ai-assistance')}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">AI Legal Assistant</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/citizen/prediction')}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l3-3 3 3 5-6" />
              </svg>
              <span className="font-medium">Get Prediction</span>
            </div>
          </button>

          <button 
            onClick={() => setShowLawyerSearch(!showLawyerSearch)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">
                {showLawyerSearch ? 'Hide Lawyer Search' : 'Quick Lawyer Search'}
              </span>
            </div>
          </button>

          <button 
            onClick={navigateToLawyersPage}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Browse All Lawyers</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Lawyer Search Section */}
      {showLawyerSearch && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Lawyer Search</h2>
            <p className="text-gray-600">
              Search for qualified lawyers by specialization, location, experience, and more. 
              Connect with legal experts who can help with your case.
            </p>
          </div>
          
          <LawyerSearch
            onViewProfile={handleViewLawyerProfile}
            onContact={handleContactLawyer}
            showContactButton={true}
          />
        </Card>
      )}
    </div>
  );
}
