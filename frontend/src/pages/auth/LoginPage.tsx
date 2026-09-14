import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api, BASE_URL } from '../../shared/api/api';
import { useAuthStore } from '../../entities/user/model/store';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const baseUrl = BASE_URL.replace(/\/api\/v1\/?$/, '');
  const originParam = typeof window !== 'undefined' ? `?redirect_uri=${encodeURIComponent(window.location.origin)}` : '';
  const githubUrl = `${baseUrl}/api/oauth2/authorization/github${originParam}`;
  const googleUrl = `${baseUrl}/api/oauth2/authorization/google${originParam}`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const oauthErr = searchParams.get('oauth_error') || searchParams.get('error');
  const [error, setError] = useState<string | null>(oauthErr ? t('auth.oauthError', 'OAuth авторизация была отменена или завершилась с ошибкой.') : null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan, data.role);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginError', 'Не удалось войти. Проверьте введенные данные.'));
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
          {t('auth.loginTitle', 'Вход в MeDev')}
        </h1>
        <p className="text-sm mb-6 text-muted">
          {t('auth.loginSubtitle', 'С возвращением. Введите свои данные для входа.')}
        </p>

        {/* Primary OAuth: GitHub (Accent) */}
        <a
          href={githubUrl}
          aria-label={t('auth.continueWithGithub', 'Войти через GitHub')}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] bg-[#24292f] hover:bg-[#1b1f23] text-white border border-[#30363d] dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:border-[#38434f] shadow-sm hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {t('auth.continueWithGithub', 'Войти через GitHub')}
        </a>

        {/* Secondary OAuth: Google */}
        <a
          href={googleUrl}
          aria-label={t('auth.continueWithGoogle', 'Войти через Google')}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors mt-2.5 min-h-[44px] surface-secondary border border-default text-primary hover:surface-tertiary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('auth.continueWithGoogle', 'Войти через Google')}
        </a>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px border-t border-default" />
          <span className="text-xs text-muted font-medium">{t('auth.or', 'или')}</span>
          <div className="flex-1 h-px border-t border-default" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5 text-secondary">
              {t('auth.email', 'Email')}
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error-msg' : undefined}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold mb-1.5 text-secondary">
              {t('auth.password', 'Пароль')}
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder', '••••••••')}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error-msg' : undefined}
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
              id="login-error-msg"
              role="alert"
              aria-live="polite"
              className="rounded-lg px-3.5 py-2.5 text-xs font-medium surface-secondary border border-red-500/30 text-red-400"
            >
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full min-h-[44px] font-semibold" disabled={loading}>
            {loading ? t('auth.signingIn', 'Вход...') : t('auth.signInBtn', 'Войти')}
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm mt-6 text-center sm:text-left text-muted">
          <Link to="/reset-password" className="text-[var(--color-link)] hover:underline">
            {t('auth.forgotPassword', 'Забыли пароль?')}
          </Link>
          <span>
            {t('auth.noAccount', 'Нет аккаунта?')}{' '}
            <Link to="/register" className="text-[var(--color-link)] font-semibold hover:underline">
              {t('auth.signUp', 'Зарегистрироваться')}
            </Link>
          </span>
        </div>

        <p className="text-xs text-center leading-relaxed mt-5 text-muted border-t border-default pt-4">
          <Link to="/terms" className="hover:text-primary transition-colors underline">
            {t('auth.terms', 'Условия использования')}
          </Link>{' '}
          ·{' '}
          <Link to="/privacy" className="hover:text-primary transition-colors underline">
            {t('auth.privacy', 'Конфиденциальность')}
          </Link>
        </p>
      </div>
    </div>
  );
}
