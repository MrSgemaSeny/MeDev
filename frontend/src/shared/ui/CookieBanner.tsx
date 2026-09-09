import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('medev_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem('medev_cookie_consent', 'accepted');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border p-4 shadow-2xl backdrop-blur-md sm:bottom-6 sm:p-5"
      style={{
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        borderColor: 'var(--color-border-default)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 shrink-0 text-[#2ea043] mt-0.5" aria-hidden="true" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            Мы используем только строго необходимые файлы cookie и локальное хранилище для авторизации и сохранения темы. Подробнее в{' '}
            <a
              href="/privacy"
              className="text-[#58a6ff] underline hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
            >
              Политике конфиденциальности
            </a>
            .
          </p>
        </div>
        <button
          onClick={acceptCookies}
          type="button"
          className="shrink-0 rounded-lg bg-[#238636] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none w-full sm:w-auto text-center"
        >
          Принять необходимые
        </button>
      </div>
    </div>
  );
};
