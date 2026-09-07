import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Terminal, Shield, Zap, Cpu } from 'lucide-react';
import { GithubIcon } from '../../shared/ui/GithubIcon';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#30363d] bg-[#0d1117] pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #238636 0%, #1f6feb 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Release badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3.5 py-1 text-xs font-medium text-[#c9d1d9] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#2ea043]" />
            <span className="text-[#8b949e]">Production Live:</span>
            <span className="font-semibold text-[#f0f6fc]">Groq AI (GPT-20B) + L1/L2 High-Speed Cache</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl lg:text-6xl">
            Превратите ваш <span className="text-[#2ea043]">GitHub</span> в сильное резюме и портфолио
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#8b949e] sm:text-lg">
            Автоматический парсинг репозиториев и коммитов, генерация ATS-friendly PDF-резюме через Groq AI без галлюцинаций и персональный трекер откликов.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-md bg-[#238636] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-[#238636]"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Войти через GitHub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white"
            >
              <span>Изучить возможности</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2ea043]" />
              <span>Синхронизация за 1 клик</span>
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
              <span>Кастомный поддомен</span>
            </div>
          </div>
        </div>

        {/* Live Terminal & Interactive Preview Grid */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Terminal Mock (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#0d1117]">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-[#f85149]/80" />
                <div className="h-3 w-3 rounded-full bg-[#d29922]/80" />
                <div className="h-3 w-3 rounded-full bg-[#238636]/80" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8b949e] font-mono">
                <Terminal className="h-3.5 w-3.5" />
                <span>medev-pipeline.sh</span>
              </div>
              <div className="text-[11px] text-[#8b949e]">bash 5.2</div>
            </div>

            <div className="p-5 font-mono text-xs sm:text-sm text-[#c9d1d9] space-y-3 overflow-x-auto">
              <div className="flex items-center gap-2 text-[#8b949e]">
                <span className="text-[#2ea043]">$</span>
                <span>medev-cli connect --oauth github --user MrSgemaSeny</span>
              </div>
              <div className="pl-4 text-[#7ee787] flex items-center gap-2">
                <span>[OK]</span>
                <span>GitHub OAuth2 authenticated: 18 public repos, 1.4k commits extracted</span>
              </div>

              <div className="flex items-center gap-2 text-[#8b949e] pt-1">
                <span className="text-[#2ea043]">$</span>
                <span>medev-ai parse-resume --smart-merge --model groq:gpt-20b</span>
              </div>
              <div className="pl-4 text-[#79c0ff] flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-[#79c0ff] animate-pulse" />
                <span>Smart Merge Engine: cross-verifying PDF text with commit metadata...</span>
              </div>
              <div className="pl-4 text-[#7ee787] flex items-center gap-2">
                <span>[OK]</span>
                <span>Extracted 12 verified skills, 4 production roles without hallucinations</span>
              </div>

              <div className="flex items-center gap-2 text-[#8b949e] pt-1">
                <span className="text-[#2ea043]">$</span>
                <span>medev-export pdf --template modern --ats-score</span>
              </div>
              <div className="pl-4 text-[#f0f6fc] flex items-center justify-between border-t border-[#30363d]/60 pt-2 text-xs">
                <span className="text-[#58a6ff]">ATS Compatibility Score: 98/100</span>
                <span className="text-[#8b949e]">Flying Saucer + PDFBox: 184ms</span>
              </div>
            </div>
          </div>

          {/* Dev Card & Metrics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-[#30363d] bg-[#21262d] flex items-center justify-center font-bold text-[#f0f6fc]">
                    MO
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#f0f6fc]">Мурат Орынбасар</div>
                    <div className="text-xs text-[#8b949e]">@MrSgemaSeny · Full-Stack Architect</div>
                  </div>
                </div>
                <span className="rounded-full border border-[#238636]/40 bg-[#238636]/10 px-2 py-0.5 text-[11px] font-medium text-[#2ea043]">
                  PRO Verified
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Публичный URL:</span>
                  <span className="font-mono text-[#58a6ff]">medev.mrsgemaseny.com/MrSgemaSeny</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Основной стек:</span>
                  <span className="text-[#c9d1d9] font-medium">Java, Spring Boot, React, TypeScript</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Отклики в ATS:</span>
                  <span className="text-[#2ea043] font-semibold">14 активных / 3 оффера</span>
                </div>
              </div>

              {/* Languages bar */}
              <div className="mt-5">
                <div className="flex justify-between text-[11px] text-[#8b949e] mb-1.5">
                  <span>Распределение языков</span>
                  <span>100% sync</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#21262d]">
                  <div className="bg-[#b07219] w-[45%]" title="Java 45%" />
                  <div className="bg-[#3178c6] w-[35%]" title="TypeScript 35%" />
                  <div className="bg-[#e34c26] w-[15%]" title="HTML/CSS 15%" />
                  <div className="bg-[#f1e05a] w-[5%]" title="JavaScript 5%" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#d29922]" />
                <span>L1 Caffeine: sub-10ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#2ea043]" />
                <span>Row-Level Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
