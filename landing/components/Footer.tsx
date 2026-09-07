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
              <span className="h-2 w-2 rounded-full bg-[#2ea043]" />
              <span>Все сервисы работают в штатном режиме</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
              Навигация
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#features" className="hover:text-[#f0f6fc] transition-colors">
                  Возможности
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-[#f0f6fc] transition-colors">
                  Шаблоны резюме
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#f0f6fc] transition-colors">
                  Тарифы
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#f0f6fc] transition-colors">
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
                <Link href="/privacy" className="hover:text-[#f0f6fc] transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#f0f6fc] transition-colors">
                  Условия использования
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/MrSgemaSeny/MeDev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#f0f6fc] transition-colors flex items-center gap-1.5"
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
            © {new Date().getFullYear()} MeDev. Платформа для разработчиков.
          </div>
          <div>
            Сделано для разработчиков
          </div>
        </div>
      </div>
    </footer>
  );
};
