import React from 'react';
import {
  ArrowRight,
  FileCheck,
  Briefcase,
  Download,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] pt-20 pb-20 sm:pt-28 sm:pb-28">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #238636 0%, #1f6feb 60%, transparent 90%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Main Heading */}
          <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-6xl lg:text-7xl">
            У тебя есть <span className="text-[#2ea043]">GitHub</span>. <br className="hidden sm:inline" />
            Пора чтобы он работал на тебя.
          </h1>

          {/* Subtitle */}
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#c9d1d9] sm:text-2xl">
            Подключи GitHub — MeDev сам разберёт твои проекты и составит резюме под конкретную вакансию. Плюс личная страница-портфолио по ссылке.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <a
              href={`${APP_URL}/login`}
              className="flex items-center gap-3 rounded-xl bg-[#238636] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              <GithubIcon className="h-5 w-5" />
              <span>Войти через GitHub</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] px-8 py-4 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              <span>Возможности</span>
            </a>
          </div>
        </div>

        {/* Product UI Demonstration */}
        <div className="mt-20 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-6 py-4">
            <div className="flex items-center space-x-2.5" aria-hidden="true">
              <div className="h-3 w-3 rounded-full bg-[#30363d]" />
              <div className="h-3 w-3 rounded-full bg-[#30363d]" />
              <div className="h-3 w-3 rounded-full bg-[#30363d]" />
            </div>
            <div className="rounded border border-[#30363d] bg-[#161b22] px-4 py-1.5 font-mono text-xs text-[#8b949e]">
              <span>medev.mrsgemaseny.com/username</span>
            </div>
            <div className="text-sm font-semibold text-[#2ea043]">
              Личный кабинет
            </div>
          </div>

          {/* Product Interface Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0d1117]/60">
            {/* Left Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
                <h3 className="text-lg font-bold text-[#f0f6fc]">
                  GitHub подключен
                </h3>
                <p className="mt-2 text-sm text-[#8b949e]">
                  Публичные репозитории, коммиты и стек синхронизированы автоматически.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#30363d]">
                    <span className="text-sm text-[#8b949e]">Репозитории</span>
                    <span className="font-semibold text-[#f0f6fc]">Импортированы</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#30363d]">
                    <span className="text-sm text-[#8b949e]">История разработки</span>
                    <span className="font-semibold text-[#f0f6fc]">Подтверждена</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[#8b949e]">Основной стек</span>
                    <span className="font-semibold text-[#58a6ff]">Определен</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-6 w-6 text-[#2ea043]" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-[#f0f6fc]">
                    Резюме готово под вакансию
                  </h3>
                </div>

                <p className="mt-4 text-base leading-relaxed text-[#c9d1d9]">
                  Текст составлен на основе твоего реального опыта разработки и отформатирован для прохождения фильтров работодателей.
                </p>

                <div className="mt-6 flex items-center justify-between rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
                  <span className="text-sm font-semibold text-[#f0f6fc]">
                    6 готовых шаблонов резюме
                  </span>
                  <a
                    href={`${APP_URL}/login`}
                    className="flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-sm font-bold text-white hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Скачать PDF</span>
                  </a>
                </div>
              </div>

              {/* Mini Tracker */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-[#58a6ff]" aria-hidden="true" />
                  <h4 className="text-base font-bold text-[#f0f6fc]">Трекер откликов</h4>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <div className="text-xs text-[#8b949e]">Отклики</div>
                    <div className="mt-1 font-bold text-base text-[#f0f6fc]">Отправлено</div>
                  </div>
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <div className="text-xs text-[#8b949e]">Интервью</div>
                    <div className="mt-1 font-bold text-base text-[#58a6ff]">В процессе</div>
                  </div>
                  <div className="rounded-lg border border-[#238636]/30 bg-[#238636]/10 p-3">
                    <div className="text-xs text-[#2ea043]">Офферы</div>
                    <div className="mt-1 font-bold text-base text-[#2ea043]">Получено</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
