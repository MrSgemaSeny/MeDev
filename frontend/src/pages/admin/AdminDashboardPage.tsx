import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeProUsers: number;
  totalAuditLogs: number;
  totalAiTokensUsedToday: number;
}

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const fetchStats = () => {
    api.get<DashboardStats>('/admin/dashboard').then((res) => setStats(res.data));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCleanupTestData = async () => {
    if (!window.confirm('Удалить всех тестовых пользователей и логи, созданные через Artillery и E2E тесты? Основной аккаунт mrsgemaseny будет сохранен.')) {
      return;
    }

    setCleaning(true);
    try {
      const res = await api.post<{ deletedUsers: number; deletedLogs: number }>('/admin/cleanup-test-data');
      toast.success(`Успешно удалено: ${res.data.deletedUsers} тестовых пользователей, ${res.data.deletedLogs} записей аудита`);
      fetchStats();
    } catch (e: any) {
      console.error(e);
      toast.error('Не удалось очистить тестовые данные');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            aria-label="Обновить статистику"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Обновить</span>
          </button>
          <button
            onClick={handleCleanupTestData}
            disabled={cleaning}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#da3633] hover:bg-[#b62324] border border-[#f85149]/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{cleaning ? 'Очистка...' : 'Очистить тестовые данные'}</span>
          </button>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
