'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
          >
            <span className="text-2xl font-black tracking-tight text-[#f0f6fc]">MeDev</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="rounded px-1 text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              Возможности
            </a>
            <a
              href="#templates"
              className="rounded px-1 text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              Шаблоны
            </a>
            <a
              href="#pricing"
              className="rounded px-1 text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              Тарифы
            </a>
            <a
              href="#faq"
              className="rounded px-1 text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              FAQ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 md:flex">
            <a
              href={`${APP_URL}/login`}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              Войти в аккаунт
            </a>
            <a
              href={`${APP_URL}/login`}
              className="flex items-center gap-2 rounded-xl bg-[#238636] px-5 py-2.5 text-base font-bold text-white shadow-md transition-colors hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              <span>Начать бесплатно</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] text-[#c9d1d9] transition-colors hover:border-[#8b949e] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none md:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" id="mobile-menu" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col justify-between border-l border-[#30363d] bg-[#161b22] p-6 shadow-2xl h-[100dvh] pt-[calc(1.25rem+var(--sat,0px))] pb-[calc(1.5rem+var(--sab,0px))]">
            <div>
              <div className="flex items-center justify-between border-b border-[#30363d] pb-6">
                <span className="text-xl font-black text-[#f0f6fc]">MeDev</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                  aria-label="Закрыть меню"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-2">
                <a
                  href="#features"
                  onClick={closeMenu}
                  className="flex min-h-[44px] items-center rounded-lg px-4 py-3 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  Возможности
                </a>
                <a
                  href="#templates"
                  onClick={closeMenu}
                  className="flex min-h-[44px] items-center rounded-lg px-4 py-3 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  Шаблоны
                </a>
                <a
                  href="#pricing"
                  onClick={closeMenu}
                  className="flex min-h-[44px] items-center rounded-lg px-4 py-3 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  Тарифы
                </a>
                <a
                  href="#faq"
                  onClick={closeMenu}
                  className="flex min-h-[44px] items-center rounded-lg px-4 py-3 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  FAQ
                </a>
              </nav>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#30363d] pt-6">
              <a
                href={`${APP_URL}/login`}
                onClick={closeMenu}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3.5 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
              >
                Войти в аккаунт
              </a>
              <a
                href={`${APP_URL}/login`}
                onClick={closeMenu}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#238636] px-5 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
              >
                <span>Начать бесплатно</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
