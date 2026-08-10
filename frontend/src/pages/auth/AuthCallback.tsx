import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      // Если у нас в JWT не сохраняется план/username напрямую для стора, 
      // то здесь нужно сделать запрос /profile, чтобы получить данные, 
      // но в рамках этой системы стор AuthStore сохраняет токены и этого достаточно для PrivateRoute.
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setTokens]);

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
          Authenticating with GitHub...
        </h2>
      </div>
    </div>
  );
};
