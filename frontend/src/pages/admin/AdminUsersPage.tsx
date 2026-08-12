import { useEffect, useState } from 'react';
import { api } from '../../shared/api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  plan: string;
}

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data.content));
  }, []);

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
    </div>
  );
};
