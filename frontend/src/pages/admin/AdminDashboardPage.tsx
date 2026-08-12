import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';

interface DashboardStats {
  totalUsers: number;
  activeProUsers: number;
  totalAuditLogs: number;
  totalAiTokensUsedToday: number;
}

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="surface-secondary p-4 rounded-lg border border-default">
            <h3 className="text-sm text-secondary">Total Users</h3>
            <p className="text-2xl font-semibold text-white">{stats.totalUsers}</p>
          </div>
          <div className="surface-secondary p-4 rounded-lg border border-default">
            <h3 className="text-sm text-secondary">PRO Users</h3>
            <p className="text-2xl font-semibold text-white">{stats.activeProUsers}</p>
          </div>
          <div className="surface-secondary p-4 rounded-lg border border-default">
            <h3 className="text-sm text-secondary">Audit Logs</h3>
            <p className="text-2xl font-semibold text-white">{stats.totalAuditLogs}</p>
          </div>
          <div className="surface-secondary p-4 rounded-lg border border-default">
            <h3 className="text-sm text-secondary">AI Tokens Today</h3>
            <p className="text-2xl font-semibold text-white">{stats.totalAiTokensUsedToday}</p>
          </div>
        </div>
      ) : (
        <p className="text-secondary">Loading stats...</p>
      )}
    </div>
  );
};
