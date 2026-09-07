import React from 'react';
import Link from 'next/link';
import { GithubIcon } from './GithubIcon';

export const Footer = () => {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117] py-12 text-[#8b949e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#30363d]">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-[#f0f6fc]">MeDev</span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[#8b949e]">
              Инструмент для разработчиков которые хотят найти работу быстрее. Резюме, портфолио и трекер откликов в одном месте.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8b949e] pt-1">
              <span className="h-2 w-2 rounded-full bg-[#2ea043]" aria-hidden="true" />
              <span>Все системы платформы стабильны</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
              Навигация
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#features" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Возможности
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Шаблоны резюме
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Тарифы
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Частые вопросы
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
              Юридическая информация
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#f0f6fc] transition-colors focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded">
                  Политика возврата средств
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/MrSgemaSeny/MeDev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#f0f6fc] transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8b949e] gap-4">
          <div>
            © {new Date().getFullYear()} MeDev · ИП Орынбасар М. (г. Алматы, РК)
          </div>
          <div>
            Поддержка: <a href="mailto:support@medev.mrsgemaseny.com" className="hover:text-[#f0f6fc] text-[#58a6ff]">support@medev.mrsgemaseny.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
