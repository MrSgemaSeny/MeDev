import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/api';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Forgot password form state (when no token in URL)
  const [email, setEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Reset password form state (when token is provided)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setForgotSubmitted(true);
    } catch (err: any) {
      setForgotError(err.response?.data?.error || t('auth.loginError', 'Не удалось отправить запрос на сброс пароля'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 8) {
      setResetError(t('auth.passwordMinLength', 'Пароль должен содержать минимум 8 символов'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError(t('auth.passwordsMismatch', 'Пароли не совпадают'));
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.response?.data?.error || t('auth.oauthError', 'Недействительная или истекшая ссылка для сброса'));
    } finally {
      setResetLoading(false);
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
        {token ? (
          // Flow 2: Set new password
          resetSuccess ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                {t('auth.passwordUpdatedTitle', 'Пароль обновлен')}
              </h1>
              <p className="text-sm text-muted">
                {t('auth.passwordUpdatedDesc', 'Ваш пароль был успешно изменен. Все предыдущие активные сессии завершены.')}
              </p>
              <Link to="/login" className="block mt-4">
                <Button variant="primary" className="w-full min-h-[44px]">
                  {t('auth.loginWithNewPassword', 'Войти с новым паролем')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight mb-1.5 text-primary">
                {t('auth.newPasswordTitle', 'Новый пароль')}
              </h1>
              <p className="text-sm mb-6 text-muted">
                {t('auth.newPasswordSubtitle', 'Введите новый надежный пароль для вашей учетной записи.')}
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-new-password" className="block text-xs font-semibold mb-1.5 text-secondary">
                    {t('auth.newPassword', 'Новый пароль (мин. 8 символов)')}
                  </label>
                  <div className="relative">
                    <Input
                      id="reset-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('auth.passwordPlaceholder', '••••••••')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                      aria-invalid={resetError ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? t('auth.hidePassword', 'Скрыть пароль') : t('auth.showPassword', 'Показать пароль')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ea043] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className="block text-xs font-semibold mb-1.5 text-secondary">
                    {t('auth.confirmPassword', 'Подтверждение пароля')}
                  </label>
                  <div className="relative">
                    <Input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('auth.passwordPlaceholder', '••••••••')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                      aria-invalid={resetError ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t('auth.hidePassword', 'Скрыть пароль') : t('auth.showPassword', 'Показать пароль')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ea043] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg px-3.5 py-2.5 text-xs font-medium surface-secondary border border-red-500/30 text-red-400"
                  >
                    {resetError}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full min-h-[44px]" disabled={resetLoading}>
                  {resetLoading ? t('auth.saving', 'Сохранение...') : t('auth.savePassword', 'Сохранить пароль')}
                </Button>
              </form>
            </>
          )
        ) : (
          // Flow 1: Request reset link
          forgotSubmitted ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                {t('auth.checkEmailTitle', 'Проверьте почту')}
              </h1>
              <p className="text-sm leading-relaxed text-muted">
                {t('auth.checkEmailDesc', 'Если учетная запись с указанным email существует, инструкции по сбросу пароля были отправлены.')}
              </p>
              <Link to="/login" className="block mt-4">
                <Button variant="secondary" className="w-full min-h-[44px]">
                  {t('auth.backToLogin', 'Вернуться ко входу')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight mb-1.5 text-primary">
                {t('auth.resetPasswordTitle', 'Сброс пароля')}
              </h1>
              <p className="text-sm mb-6 text-muted">
                {t('auth.resetPasswordSubtitle', 'Укажите ваш email, и мы отправим инструкции для восстановления доступа.')}
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold mb-1.5 text-secondary">
                    {t('auth.email', 'Email')}
                  </label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder', 'you@example.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={forgotError ? 'true' : 'false'}
                  />
                </div>

                {forgotError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg px-3.5 py-2.5 text-xs font-medium surface-secondary border border-red-500/30 text-red-400"
                  >
                    {forgotError}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full min-h-[44px]" disabled={forgotLoading}>
                  {forgotLoading ? t('auth.sending', 'Отправка...') : t('auth.sendResetLink', 'Отправить ссылку для сброса')}
                </Button>
              </form>

              <p className="text-center text-xs sm:text-sm mt-6 text-muted border-t border-default pt-4">
                {t('auth.rememberPassword', 'Вспомнили пароль?')}{' '}
                <Link to="/login" className="text-[var(--color-link)] font-semibold hover:underline">
                  {t('auth.signInLink', 'Войти')}
                </Link>
              </p>
            </>
          )
        )}
      </div>
    </div>
  );
}
