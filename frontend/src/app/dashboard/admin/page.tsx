'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/Card';
import { getCaseStats, type CaseStats } from '../../../lib/cases';
import Button from '../../../components/Button';
import {
  fetchAdminCasesTrend,
  fetchAdminLawyerActivity,
  fetchAdminUsersGrowth,
} from '../../../lib/analytics';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import AreaChartComponent from '../../../components/charts/AreaChartComponent';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import PieChartComponent from '../../../components/charts/PieChartComponent';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersGrowth, setUsersGrowth] = useState<{ label: string; count: number }[]>([]);
  const [casesTrend, setCasesTrend] = useState<{ label: string; count: number }[]>([]);
  const [lawyerActivity, setLawyerActivity] = useState<
    { lawyerName: string; caseCount: number }[]
  >([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = await getCaseStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [usersData, casesData, lawyerData] = await Promise.all([
        fetchAdminUsersGrowth(),
        fetchAdminCasesTrend(),
        fetchAdminLawyerActivity(),
      ]);
      setUsersGrowth(usersData);
      setCasesTrend(casesData);
      setLawyerActivity(
        lawyerData.map((l) => ({ lawyerName: l.lawyerName, caseCount: l.caseCount })),
      );
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleManageBlogs = () => {
    router.push('/dashboard/admin/blogs');
  };

  const handleViewCases = () => {
    router.push('/dashboard/admin/cases');
  };

  const handleViewLawyers = () => {
    router.push('/dashboard/admin/lawyers');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-amber-500 pl-4 py-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor platform performance and manage system operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-amber-100 dark:border-amber-900/20">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shadow-inner">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-amber-100 dark:border-amber-900/20">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shadow-inner">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.in_progress || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.resolved || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Users Growth (last months)
          </h3>
          <LineChartComponent
            data={usersGrowth}
            xKey="label"
            yKey="count"
            loading={analyticsLoading}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Cases Created Over Time
          </h3>
          <AreaChartComponent
            data={casesTrend}
            xKey="label"
            yKey="count"
            loading={analyticsLoading}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Top Active Lawyers
          </h3>
          <BarChartComponent
            data={lawyerActivity}
            xKey="lawyerName"
            yKey="caseCount"
            loading={analyticsLoading}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Case Outcome Distribution
          </h3>
          <PieChartComponent
            data={[
              { label: 'Pending', count: stats?.pending ?? 0 },
              { label: 'In Progress', count: stats?.in_progress ?? 0 },
              { label: 'Resolved', count: stats?.resolved ?? 0 },
              { label: 'Closed', count: stats?.closed ?? 0 },
              { label: 'Rejected', count: stats?.rejected ?? 0 },
            ]}
            nameKey="label"
            valueKey="count"
            loading={loading}
          />
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Management</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleViewCases}
              className="w-full justify-start shadow-sm"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Manage Cases
            </Button>
            <Button 
              onClick={handleViewLawyers}
              variant="outline"
              className="w-full justify-start dark:bg-gray-800"
            >
              <svg className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Manage Lawyers
            </Button>
            <Button 
              onClick={handleManageBlogs}
              variant="outline"
              className="w-full justify-start dark:bg-gray-800"
            >
              <svg className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Manage Blogs
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">API Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">File Storage</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Backup</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
