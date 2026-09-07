import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <span className="text-xl font-extrabold tracking-tight text-[#f0f6fc]">MeDev</span>
            <span className="rounded border border-[#30363d] bg-[#161b22] px-1.5 py-0.5 text-[11px] font-mono font-medium text-[#8b949e]">
              v1.0
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Возможности
            </a>
            <a
              href="#templates"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Шаблоны
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Тарифы
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              FAQ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/MrSgemaSeny/MeDev"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] sm:flex"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href={`${APP_URL}/login`}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white"
            >
              Войти
            </a>
            <a
              href={`${APP_URL}/register`}
              className="flex items-center gap-1 rounded-md bg-[#238636] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2ea043]"
            >
              <span>Начать бесплатно</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
