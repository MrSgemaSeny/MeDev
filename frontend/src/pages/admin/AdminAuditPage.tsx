import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';

interface AuditLog {
  id: number;
  action: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export const AdminAuditPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.get('/admin/audit').then((res) => setLogs(res.data.content));
  }, []);

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
    </div>
  );
};
