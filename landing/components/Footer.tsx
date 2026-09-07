import React from 'react';
import Link from 'next/link';
import { GithubIcon } from './GithubIcon';

export const Footer = () => {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117] py-16 text-[#8b949e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#30363d]">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-2xl font-black text-[#f0f6fc]">MeDev</span>
            <p className="max-w-md text-base leading-relaxed text-[#8b949e]">
              Инструмент для разработчиков, которые хотят найти работу быстрее. Резюме, портфолио и трекер откликов в одном месте.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <div className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">
              Навигация
            </div>
            <ul className="space-y-2.5 text-base">
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
          <div className="space-y-4">
            <div className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">
              Юридическая информация
            </div>
            <ul className="space-y-2.5 text-base">
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
                  className="hover:text-[#f0f6fc] transition-colors flex items-center gap-2"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between text-sm text-[#8b949e] gap-4">
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
