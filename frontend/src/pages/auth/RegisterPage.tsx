import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, username, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan);
    } catch (error) {
      console.error('Registration failed', error);
      alert(t('auth.registerError', 'Registration failed.'));
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm relative z-10 p-8 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}>
          <div className="mb-12 flex justify-center">
            <svg className="w-12 h-12" style={{ color: 'var(--color-text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {t('auth.registerTitle', 'Join MeDev today')}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input 
                type="email" 
                placeholder={t('auth.email', 'Email')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <Input 
                type="text" 
                placeholder={t('auth.username', 'Username')} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div>
              <Input 
                type="password" 
                autoComplete="new-password"
                placeholder={t('auth.password', 'Password')} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-12 text-white" style={{ backgroundColor: 'var(--color-accent)' }}>{t('auth.register', 'Sign Up')}</Button>
            </div>
          </form>

          <p className="text-center text-sm mt-8 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.hasAccount', 'Already have an account?')} {' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--color-link)' }}>
              {t('auth.login', 'Sign In')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Static Graphic Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden justify-center items-center" style={{ backgroundColor: 'var(--color-bg-inset)', borderLeft: '1px solid var(--color-border-default)' }}>
        {/* Subtle large watermark */}
        <div className="absolute flex justify-center items-center inset-0 opacity-10">
          <svg className="w-3/4 h-3/4" style={{ color: 'var(--color-text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
