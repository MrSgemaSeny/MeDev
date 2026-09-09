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
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] pt-14 pb-14 sm:pt-28 sm:pb-28">
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
          <h1 className="max-w-5xl text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl lg:text-7xl break-words">
            У тебя есть <span className="text-[#2ea043]">GitHub</span>. <br className="hidden sm:inline" />
            Пора чтобы он работал на тебя.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 max-w-3xl text-base leading-relaxed text-[#c9d1d9] sm:text-2xl">
            Подключи GitHub — MeDev сам разберёт твои проекты и составит резюме под конкретную вакансию. Плюс личная страница-портфолио по ссылке.
          </p>

          {/* Actions */}
          <div className="mt-8 sm:mt-10 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <a
              href={`${APP_URL}/login`}
              className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#238636] px-6 sm:px-8 py-3.5 sm:py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none min-h-[44px]"
            >
              <GithubIcon className="h-5 w-5 shrink-0" />
              <span>Войти через GitHub</span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </a>
            <a
              href="#features"
              aria-label="Перейти к разделу возможностей платформы"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] px-6 sm:px-8 py-3.5 sm:py-4 text-base font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none min-h-[44px]"
            >
              <span>Возможности</span>
            </a>
          </div>
        </div>

        {/* Product UI Demonstration */}
        <div className="mt-12 sm:mt-20 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-3.5 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-2.5" aria-hidden="true">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#30363d]" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#30363d]" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#30363d]" />
            </div>
            <div className="max-w-[180px] sm:max-w-none truncate rounded border border-[#30363d] bg-[#161b22] px-2.5 sm:px-4 py-1 sm:py-1.5 font-mono text-[11px] sm:text-xs text-[#8b949e]">
              <span className="truncate">medev.mrsgemaseny.com/username</span>
            </div>
            <div className="hidden sm:block text-sm font-semibold text-[#2ea043]">
              Личный кабинет
            </div>
          </div>

          {/* Product Interface Body */}
          <div className="p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 bg-[#0d1117]/60">
            {/* Left Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc]">
                  GitHub подключен
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#8b949e]">
                  Публичные репозитории, коммиты и стек синхронизированы автоматически.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#30363d]">
                    <span className="text-xs sm:text-sm text-[#8b949e]">Репозитории</span>
                    <span className="font-semibold text-xs sm:text-sm text-[#f0f6fc]">Импортированы</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#30363d]">
                    <span className="text-xs sm:text-sm text-[#8b949e]">История разработки</span>
                    <span className="font-semibold text-xs sm:text-sm text-[#f0f6fc]">Подтверждена</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs sm:text-sm text-[#8b949e]">Основной стек</span>
                    <span className="font-semibold text-xs sm:text-sm text-[#58a6ff]">Определен</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#2ea043] shrink-0" aria-hidden="true" />
                  <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc]">
                    Резюме готово под вакансию
                  </h3>
                </div>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-[#c9d1d9]">
                  Текст составлен на основе твоего реального опыта разработки и отформатирован для прохождения фильтров работодателей.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-3.5 sm:p-4">
                  <span className="text-xs sm:text-sm font-semibold text-[#f0f6fc]">
                    6 готовых шаблонов резюме
                  </span>
                  <a
                    href={`${APP_URL}/login`}
                    aria-label="Скачать пример готового PDF-резюме"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#238636] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none min-h-[44px]"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Скачать образец PDF</span>
                  </a>
                </div>
              </div>

              {/* Mini Tracker */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-[#58a6ff] shrink-0" aria-hidden="true" />
                  <h4 className="text-sm sm:text-base font-bold text-[#f0f6fc]">Трекер откликов</h4>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-2 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-[#8b949e]">Отклики</div>
                    <div className="mt-1 font-bold text-xs sm:text-base text-[#f0f6fc]">Отправлено</div>
                  </div>
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-2 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-[#8b949e]">Интервью</div>
                    <div className="mt-1 font-bold text-xs sm:text-base text-[#58a6ff]">В процессе</div>
                  </div>
                  <div className="rounded-lg border border-[#238636]/30 bg-[#238636]/10 p-2 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-[#2ea043]">Офферы</div>
                    <div className="mt-1 font-bold text-xs sm:text-base text-[#2ea043]">Получено</div>
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
