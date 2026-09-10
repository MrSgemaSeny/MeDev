import React from 'react';
import { ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

const templates = [
  {
    id: 'clean',
    name: 'Clean ATS',
    description: '100% считываемость ATS',
    layoutType: 'single-column',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Код, коммиты и стек',
    layoutType: 'technical',
  },
  {
    id: 'milky-soft',
    name: 'Milky Soft',
    description: 'Крафтовый двухколоночный',
    layoutType: 'two-column',
  },
  {
    id: 'apple-modern',
    name: 'Apple',
    description: 'Строгий минимализм',
    layoutType: 'minimal',
  },
  {
    id: 'grok-monolith',
    name: 'Grok',
    description: 'Терминальный монохром',
    layoutType: 'single-column',
  },
  {
    id: 'phub-orange',
    name: 'PH Orange',
    description: 'Контрастный стиль',
    layoutType: 'two-column',
  },
];

export const TemplatesShowcase = () => {
  return (
    <section id="templates" className="border-b border-[#30363d] bg-[#0d1117] py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#f0f6fc] break-words">
            6 шаблонов резюме — выбери свой стиль
          </h2>
          <p className="mt-2 text-xs sm:text-base leading-relaxed text-[#8b949e]">
            Скачай PDF в один клик. Все шаблоны бесплатны и соответствуют стандартам ATS.
          </p>
        </div>

        {/* Templates 2-column Grid */}
        <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-2.5 sm:p-4 lg:p-5 transition-all hover:border-[#58a6ff]/60"
            >
              <div>
                <h3 className="text-xs sm:text-base lg:text-lg font-bold text-[#f0f6fc] truncate">
                  {tpl.name}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[#8b949e] truncate">
                  {tpl.description}
                </p>

                {/* Miniature CSS Document Skeleton Preview */}
                <div className="mt-2 sm:mt-3.5 rounded-md sm:rounded-lg border border-[#30363d] bg-[#0d1117] p-2 sm:p-2.5 shadow-inner" aria-hidden="true">
                  {tpl.layoutType === 'two-column' ? (
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                      <div className="col-span-1 space-y-1 border-r border-[#30363d]/60 pr-1">
                        <div className="h-1.5 sm:h-2 w-full rounded bg-[#2ea043]/30" />
                        <div className="h-1 sm:h-1.5 w-3/4 rounded bg-[#30363d]" />
                        <div className="h-1 sm:h-1.5 w-full rounded bg-[#30363d]" />
                        <div className="h-1 sm:h-1.5 w-1/2 rounded bg-[#30363d]" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <div className="h-1.5 sm:h-2 w-2/3 rounded bg-[#58a6ff]/30" />
                        <div className="h-1 sm:h-1.5 w-full rounded bg-[#21262d]" />
                        <div className="h-1 sm:h-1.5 w-5/6 rounded bg-[#21262d]" />
                        <div className="h-1 sm:h-1.5 w-4/5 rounded bg-[#21262d]" />
                      </div>
                    </div>
                  ) : tpl.layoutType === 'technical' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <div className="h-1.5 sm:h-2 w-1/3 rounded bg-[#58a6ff]/40" />
                        <div className="h-1 sm:h-1.5 w-1/4 rounded bg-[#21262d]" />
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <div className="h-2 sm:h-2.5 rounded bg-[#21262d] border border-[#30363d]/40" />
                        <div className="h-2 sm:h-2.5 rounded bg-[#21262d] border border-[#30363d]/40" />
                      </div>
                      <div className="h-1 sm:h-1.5 w-full rounded bg-[#21262d]" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="h-2 sm:h-2.5 w-1/2 rounded bg-[#f0f6fc]/20" />
                      <div className="h-1 sm:h-1.5 w-full rounded bg-[#21262d]" />
                      <div className="h-1 sm:h-1.5 w-4/5 rounded bg-[#21262d]" />
                      <div className="h-1 sm:h-1.5 w-full rounded bg-[#21262d]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#30363d]">
                <a
                  href={`${APP_URL}/login`}
                  className="flex min-h-[40px] sm:min-h-[44px] items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  <span>Выбрать</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
