import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../entities/user/model/store';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  plan: string;
}

interface PageResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const AdminUsersPage = () => {
  const [data, setData] = useState<PageResponse | null>(null);
  const [page, setPage] = useState(0);
  const currentUsername = useAuthStore((s) => s.username);

  const fetchUsers = () => {
    api.get(`/admin/users?page=${page}&size=20`).then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Удалить пользователя ${email}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Пользователь удален');
      fetchUsers();
    } catch {
      toast.error('Не удалось удалить пользователя');
    }
  };

  const users = data?.content || [];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Manage Users</h1>
      </div>
      <div className="relative surface-secondary rounded-lg border border-default overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-secondary min-w-[500px]">
            <thead className="bg-white/5 border-b border-default text-primary">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-default last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{user.username}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.plan}</td>
                  <td className="px-4 py-3 text-right">
                    {user.username !== currentUsername && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-[#8b949e] hover:text-[#f85149] p-1 rounded transition-colors cursor-pointer"
                        title="Удалить пользователя"
                        aria-label={`Удалить ${user.username}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Right scroll fade indicator for mobile */}
        <div 
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#161b22] to-transparent sm:hidden opacity-80" 
          aria-hidden="true" 
        />
      </div>
      
      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
          <span className="text-sm text-[#8b949e] text-center sm:text-left">
            Showing page <span className="font-semibold text-white">{data.number + 1}</span> of <span className="font-semibold text-white">{data.totalPages}</span>
            {' '} ({data.totalElements} total users)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-md border border-[#30363d] bg-[#161b22] text-[#c9d1d9] text-xs font-semibold hover:bg-[#21262d] disabled:opacity-40 disabled:hover:bg-[#161b22] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="px-3 py-1.5 rounded-md border border-[#30363d] bg-[#161b22] text-[#c9d1d9] text-xs font-semibold hover:bg-[#21262d] disabled:opacity-40 disabled:hover:bg-[#161b22] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
