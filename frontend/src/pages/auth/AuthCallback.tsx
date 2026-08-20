import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';
import { api } from '../../shared/api/axios';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const exchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !exchanged.current) {
      exchanged.current = true;
      api.post('/auth/oauth2/exchange', { code })
        .then((res) => {
          const { accessToken, refreshToken, username, plan, role } = res.data;
          setAuth(accessToken, refreshToken, username, plan, role);
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error('OAuth exchange failed:', err);
          toast.error('OAuth login failed');
          navigate('/login', { replace: true });
        });
    } else if (!code) {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="text-center">
        <span
          className="inline-block animate-spin rounded-full mb-4"
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--color-border-default)',
            borderTopColor: 'var(--color-text-muted)',
          }}
        />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Authenticating...
        </h2>
      </div>
    </div>
  );
};
