'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
      // localStorage may be disabled
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
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[#30363d] bg-[#161b22]/95 p-4 shadow-2xl backdrop-blur-md sm:bottom-6 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 shrink-0 text-[#2ea043] mt-0.5" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-[#c9d1d9]">
            Мы используем только строго необходимые файлы cookie и локальное хранилище для авторизации и настроек темы. Подробнее в{' '}
            <Link
              href="/privacy"
              className="text-[#58a6ff] underline hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
            >
              Политике конфиденциальности
            </Link>
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
