import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api, BASE_URL } from '../../shared/api/api';
import { useAuthStore } from '../../entities/user/model/store';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';

export function RegisterPage() {
  const { t } = useTranslation();
  const baseUrl = BASE_URL.replace(/\/api\/v1\/?$/, '');
  const githubUrl = `${baseUrl}/api/oauth2/authorization/github`;
  const googleUrl = `${baseUrl}/api/oauth2/authorization/google`;

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, username, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan, data.role);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerError', 'Не удалось создать аккаунт.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-3 sm:p-6 relative"
      style={{ backgroundColor: 'var(--color-bg-canvas)' }}
    >
      {/* Top Bar with Logo and LanguageSwitcher */}
      <header className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between max-w-4xl mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-mono text-sm font-bold text-primary group-hover:text-link transition-colors">
            &gt;_ MeDev
          </span>
        </Link>
        <LanguageSwitcher variant="pill" />
      </header>

      <div
        className="w-full max-w-sm rounded-xl p-6 sm:p-8 shadow-sm"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <h1 className="text-2xl font-bold tracking-tight mb-1.5 text-primary">
          {t('auth.registerTitle', 'Создать аккаунт')}
        </h1>
        <p className="text-sm mb-6 text-muted">
          {t('auth.registerSubtitle', 'Создайте свой профиль разработчика в одном месте.')}
        </p>

        {/* Primary OAuth: GitHub (Accent) */}
        <a
          href={githubUrl}
          aria-label={t('auth.registerWithGithub', 'Зарегистрироваться через GitHub')}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] bg-[#24292f] hover:bg-[#1b1f23] text-white border border-[#30363d] dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:border-[#38434f] shadow-sm hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {t('auth.registerWithGithub', 'Зарегистрироваться через GitHub')}
        </a>

        {/* Secondary OAuth: Google */}
        <a
          href={googleUrl}
          aria-label={t('auth.registerWithGoogle', 'Зарегистрироваться через Google')}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors mt-2.5 min-h-[44px] surface-secondary border border-default text-primary hover:surface-tertiary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('auth.registerWithGoogle', 'Зарегистрироваться через Google')}
        </a>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px border-t border-default" />
          <span className="text-xs text-muted font-medium">{t('auth.or', 'или')}</span>
          <div className="flex-1 h-px border-t border-default" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold mb-1.5 text-secondary">
              {t('auth.email', 'Email')}
            </label>
            <Input
              id="reg-email"
              type="email"
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'reg-error-msg' : undefined}
            />
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-xs font-semibold mb-1.5 text-secondary">
              {t('auth.username', 'Имя пользователя')}
            </label>
            <Input
              id="reg-username"
              placeholder={t('auth.usernamePlaceholder', 'username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'reg-error-msg' : undefined}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold mb-1.5 text-secondary">
              {t('auth.password', 'Пароль')}
            </label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder', '••••••••')}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'reg-error-msg' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword', 'Скрыть пароль') : t('auth.showPassword', 'Показать пароль')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ea043] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="reg-error-msg"
              role="alert"
              aria-live="polite"
              className="rounded-lg px-3.5 py-2.5 text-xs font-medium surface-secondary border border-red-500/30 text-red-400"
            >
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full min-h-[44px] font-semibold" disabled={loading}>
            {loading ? t('auth.creatingAccount', 'Создание...') : t('auth.createAccountBtn', 'Создать аккаунт')}
          </Button>

          <p className="text-xs text-center leading-relaxed mt-3 text-muted">
            {t('auth.agreeTerms', 'Регистрируясь, вы соглашаетесь с')}{' '}
            <Link to="/terms" className="underline hover:text-primary transition-colors">
              {t('auth.terms', 'Условиями использования')}
            </Link>{' '}
            {t('auth.and', 'и')}{' '}
            <Link to="/privacy" className="underline hover:text-primary transition-colors">
              {t('auth.privacy', 'Политикой конфиденциальности')}
            </Link>
            .
          </p>
        </form>

        <p className="text-center text-xs sm:text-sm mt-6 text-muted border-t border-default pt-4">
          {t('auth.hasAccount', 'Уже есть аккаунт?')}{' '}
          <Link to="/login" className="text-[var(--color-link)] font-semibold hover:underline">
            {t('auth.signInLink', 'Войти')}
          </Link>
        </p>
      </div>
    </div>
  );
}
