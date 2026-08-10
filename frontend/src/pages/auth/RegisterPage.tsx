import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';
import { useState } from 'react';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, username, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-bg-canvas)' }}
    >
      <div
        className="w-full max-w-sm rounded-md p-8"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Create your account
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Build your developer profile in one place.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Password
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div
              className="rounded-md px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
              }}
            >
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-link)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
