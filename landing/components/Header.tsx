import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <span className="text-2xl font-black tracking-tight text-[#f0f6fc]">MeDev</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Возможности
            </a>
            <a
              href="#templates"
              className="text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Шаблоны
            </a>
            <a
              href="#pricing"
              className="text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Тарифы
            </a>
            <a
              href="#faq"
              className="text-base font-semibold text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              FAQ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`${APP_URL}/login`}
            className="rounded-xl px-4 py-2.5 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white"
          >
            Войти
          </a>
          <a
            href={`${APP_URL}/login`}
            className="flex items-center gap-2 rounded-xl bg-[#238636] px-5 py-2.5 text-base font-bold text-white shadow-md transition-colors hover:bg-[#2ea043]"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
