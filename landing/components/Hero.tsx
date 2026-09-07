import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Briefcase,
  Download,
  Zap,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] pt-14 pb-16 sm:pt-20 sm:pb-24">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #238636 0%, #1f6feb 60%, transparent 90%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Release badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3.5 py-1 text-xs font-medium text-[#c9d1d9] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#2ea043]" />
            <span className="text-[#8b949e]">Production Platform:</span>
            <span className="font-semibold text-[#f0f6fc]">Groq AI (GPT-20B) + L1/L2 Cache</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl lg:text-6xl">
            Превратите ваш <span className="text-[#2ea043]">GitHub</span> в сильное резюме и портфолио
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#8b949e] sm:text-base">
            Автоматический импорт репозиториев, генерация ATS-оптимизированных PDF-резюме на базе нейросети Groq AI без галлюцинаций и персональный трекер откликов.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href={`${APP_URL}/login`}
              className="flex items-center gap-2 rounded-md bg-[#238636] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-[#238636]"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Войти через GitHub</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-5 py-2.5 text-sm font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white"
            >
              <span>Возможности</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
              <span>Синхронизация в 1 клик</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
              <span>6 готовых PDF-шаблонов</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
              <span>Zero-Trust Security & RLS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
              <span>Персональный URL портфолио</span>
            </div>
          </div>
        </div>

        {/* Real Product UI Mockup */}
        <div className="mt-12 rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 py-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#30363d]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#30363d]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#30363d]" />
            </div>
            <div className="flex items-center gap-2 rounded border border-[#30363d] bg-[#161b22] px-3 py-1 font-mono text-[11px] text-[#8b949e]">
              <span>https://app.medev.mrsgemaseny.com/dashboard</span>
            </div>
            <div className="text-[11px] font-medium text-[#2ea043] flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>100% Live</span>
            </div>
          </div>

          {/* Product Interface Body */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0d1117]/50">
            {/* Left: GitHub Profile & Sync (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    Синхронизация GitHub
                  </div>
                  <span className="rounded bg-[#238636]/15 border border-[#238636]/30 px-2 py-0.5 text-[10px] font-semibold text-[#2ea043]">
                    Синхронизировано
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-[#c9d1d9]">
                  <div className="flex justify-between items-center py-1 border-b border-[#30363d]/50">
                    <span className="text-[#8b949e]">Публичные репозитории</span>
                    <span className="font-semibold text-[#f0f6fc]">18 проектов</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#30363d]/50">
                    <span className="text-[#8b949e]">Подтвержденные коммиты</span>
                    <span className="font-semibold text-[#f0f6fc]">1 420+</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8b949e]">Основной стек</span>
                    <span className="font-semibold text-[#58a6ff]">Java, React, PostgreSQL</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-[#8b949e] mb-1">
                    <span>Языки в кодовой базе</span>
                    <span>100% точность</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded bg-[#21262d]">
                    <div className="bg-[#b07219] w-[45%]" title="Java 45%" />
                    <div className="bg-[#3178c6] w-[35%]" title="TypeScript 35%" />
                    <div className="bg-[#e34c26] w-[20%]" title="HTML/CSS 20%" />
                  </div>
                </div>
              </div>

              {/* Verified Repos Box */}
              <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4">
                <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
                  Топ проекты
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded border border-[#30363d]/60 bg-[#21262d]/40 px-3 py-2 text-xs">
                    <span className="font-mono font-medium text-[#f0f6fc]">MeDev Core</span>
                    <span className="text-[11px] text-[#8b949e]">Java 17 · Spring Boot</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-[#30363d]/60 bg-[#21262d]/40 px-3 py-2 text-xs">
                    <span className="font-mono font-medium text-[#f0f6fc]">Job Tracker ATS</span>
                    <span className="text-[11px] text-[#8b949e]">React 19 · dnd-kit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Resume & ATS Pipeline (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4">
                <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-[#2ea043]" />
                    <span className="text-xs font-semibold text-[#f0f6fc]">
                      Генератор резюме (Groq AI GPT-20B)
                    </span>
                  </div>
                  <span className="rounded border border-[#58a6ff]/30 bg-[#58a6ff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#58a6ff]">
                    ATS Score: 98/100
                  </span>
                </div>

                <div className="mt-3.5 space-y-2.5">
                  <div className="rounded border border-[#30363d]/60 bg-[#0d1117] p-3 text-xs">
                    <div className="text-[11px] font-semibold text-[#2ea043] mb-1">
                      Smart Merge без галлюцинаций
                    </div>
                    <p className="text-[#8b949e] leading-relaxed">
                      Факты из коммитов сопоставляются с требованиями вакансии. Формулировки ориентированы на результаты и метрики.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded border border-[#30363d]/60 bg-[#21262d]/40 p-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#f0f6fc]">6 инженерных шаблонов</div>
                      <div className="text-[11px] text-[#8b949e]">Векторный экспорт Flying Saucer</div>
                    </div>
                    <span className="rounded bg-[#238636] px-3 py-1 text-[11px] font-semibold text-white flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>PDF Готов</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ATS Kanban Mini */}
              <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-[#58a6ff]" />
                    <span>Job Tracker ATS</span>
                  </div>
                  <span className="text-[11px] text-[#8b949e]">Воронка откликов</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded border border-[#30363d]/50 bg-[#0d1117] p-2">
                    <div className="text-[10px] text-[#8b949e]">Отклики</div>
                    <div className="mt-1 font-bold text-[#f0f6fc]">12</div>
                  </div>
                  <div className="rounded border border-[#30363d]/50 bg-[#0d1117] p-2">
                    <div className="text-[10px] text-[#8b949e]">Интервью</div>
                    <div className="mt-1 font-bold text-[#58a6ff]">5</div>
                  </div>
                  <div className="rounded border border-[#238636]/30 bg-[#238636]/10 p-2">
                    <div className="text-[10px] text-[#2ea043]">Офферы</div>
                    <div className="mt-1 font-bold text-[#2ea043]">2</div>
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
