import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    api.get(`/admin/users?page=${page}&size=20`).then((res) => setData(res.data));
  }, [page]);

  const users = data?.content || [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Manage Users</h1>
      <div className="surface-secondary rounded-lg border border-default overflow-x-auto">
        <table className="w-full text-left text-sm text-secondary">
          <thead className="bg-white/5 border-b border-default text-primary">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-default last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
          <span className="text-sm text-[#8b949e]">
            Showing page <span className="font-semibold text-white">{data.number + 1}</span> of <span className="font-semibold text-white">{data.totalPages}</span>
            {' '} ({data.totalElements} total users)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="p-2 bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
