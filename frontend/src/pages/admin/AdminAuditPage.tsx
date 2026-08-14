import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

interface PageResponse {
  content: AuditLog[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const AdminAuditPage = () => {
  const [data, setData] = useState<PageResponse | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    api.get(`/admin/audit?page=${page}&size=50`).then((res) => setData(res.data));
  }, [page]);

  const logs = data?.content || [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">System Audit Logs</h1>
      <div className="surface-secondary rounded-lg border border-default overflow-x-auto">
        <table className="w-full text-left text-sm text-secondary">
          <thead className="bg-white/5 border-b border-default text-primary">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-default last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.targetId || '-'}</td>
                <td className="px-4 py-3">{log.details || '-'}</td>
                <td className="px-4 py-3">{log.ipAddress || '-'}</td>
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
            {' '} ({data.totalElements} total logs)
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
