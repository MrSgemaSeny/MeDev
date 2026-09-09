import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/axios';

export function ResetPasswordPage() {
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
      setForgotError(err.response?.data?.error || 'Не удалось отправить запрос на сброс пароля');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 8) {
      setResetError('Пароль должен содержать минимум 8 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Пароли не совпадают');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Недействительная или истекшая ссылка для сброса');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'var(--color-bg-canvas)' }}
    >
      <div
        className="w-full max-w-sm rounded-md p-5 sm:p-8"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        {token ? (
          // Flow 2: Set new password
          resetSuccess ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Пароль обновлен
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Ваш пароль был успешно изменен. Все предыдущие активные сессии завершены.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full mt-4">
                  Войти с новым паролем
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Новый пароль
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Введите новый надежный пароль для вашей учетной записи.
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-new-password" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Новый пароль (мин. 8 символов)
                  </label>
                  <Input
                    id="reset-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    aria-invalid={resetError ? 'true' : 'false'}
                  />
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Подтверждение пароля
                  </label>
                  <Input
                    id="reset-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    aria-invalid={resetError ? 'true' : 'false'}
                  />
                </div>

                {resetError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-md px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-danger)',
                      color: 'var(--color-danger)',
                    }}
                  >
                    {resetError}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full" disabled={resetLoading}>
                  {resetLoading ? 'Сохранение...' : 'Сохранить пароль'}
                </Button>
              </form>
            </>
          )
        ) : (
          // Flow 1: Request reset link
          forgotSubmitted ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Проверьте почту
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Если учетная запись с указанным email существует, инструкции по сбросу пароля были отправлены.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full mt-4">
                  Вернуться ко входу
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Сброс пароля
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Укажите ваш email, и мы отправим инструкции для восстановления доступа.
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
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
                    className="rounded-md px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-danger)',
                      color: 'var(--color-danger)',
                    }}
                  >
                    {forgotError}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full" disabled={forgotLoading}>
                  {forgotLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
                </Button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
                Вспомнили пароль?{' '}
                <Link to="/login" style={{ color: 'var(--color-link)' }}>
                  Войти
                </Link>
              </p>
            </>
          )
        )}
      </div>
    </div>
  );
}
