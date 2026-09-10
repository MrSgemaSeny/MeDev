import React from 'react';
import { ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

const templates = [
  {
    id: 'clean',
    name: 'Clean ATS',
    isPro: false,
    badge: 'FREE',
    description: 'Строгий, чистый классический одноколоночный макет. 100% считываемость любыми ATS-системами банков и корпораций.',
    layoutType: 'single-column',
  },
  {
    id: 'github',
    name: 'GitHub',
    isPro: false,
    badge: 'FREE',
    description: 'Инженерный стандарт с фирменным стилем GitHub: акцент на коммиты, проверенные репозитории и стек.',
    layoutType: 'technical',
  },
  {
    id: 'milky-soft',
    name: 'Milky Soft',
    isPro: true,
    badge: 'PRO',
    description: 'Теплый крафтовый дизайн с мягкими акцентами. Идеально подходит для Full-Stack и Indie-разработчиков.',
    layoutType: 'two-column',
  },
  {
    id: 'apple-modern',
    name: 'Apple',
    isPro: true,
    badge: 'PRO',
    description: 'Ультраминимализм в духе Купертино: выверенный воздух, строгая сетка и типографика для Senior и Lead инженеров.',
    layoutType: 'minimal',
  },
  {
    id: 'grok-monolith',
    name: 'Grok',
    isPro: false,
    badge: 'FREE',
    description: 'Бруталистский черно-белый монохром. Высокая плотность данных, терминальная эстетика и фокус на фактах.',
    layoutType: 'single-column',
  },
  {
    id: 'phub-orange',
    name: 'PH Orange',
    isPro: true,
    badge: 'PRO',
    description: 'Высококонтрастный темный стиль с ярким оранжевым акцентом. Максимальное привлечение внимания к ключевым достижениям.',
    layoutType: 'two-column',
  },
];

export const TemplatesShowcase = () => {
  return (
    <section id="templates" className="border-b border-[#30363d] bg-[#0d1117] py-10 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#f0f6fc] break-words">
            6 шаблонов резюме — выбери свой стиль
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-[#8b949e]">
            Скачай PDF в один клик. Шаблоны спроектированы в соответствии со стандартами ATS для безошибочного считывания текстовой структуры рекрутинговыми системами.
          </p>
        </div>

        {/* Templates 3x2 Grid */}
        <div className="mt-6 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-[#30363d] bg-[#161b22] p-3.5 sm:p-6 transition-all hover:border-[#58a6ff]/60"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-xl font-bold text-[#f0f6fc]">{tpl.name}</h3>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                      tpl.isPro
                        ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                        : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                    }`}
                  >
                    {tpl.badge}
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm leading-relaxed text-[#c9d1d9] sm:min-h-[44px]">
                  {tpl.description}
                </p>

                {/* Miniature CSS Document Skeleton Preview */}
                <div className="mt-3 sm:mt-5 rounded-lg sm:rounded-xl border border-[#30363d] bg-[#0d1117] p-2.5 sm:p-3.5 shadow-inner" aria-hidden="true">
                  {tpl.layoutType === 'two-column' ? (
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <div className="col-span-1 space-y-1.5 border-r border-[#30363d]/60 pr-1.5">
                        <div className="h-2 w-full rounded bg-[#2ea043]/30" />
                        <div className="h-1.5 w-3/4 rounded bg-[#30363d]" />
                        <div className="h-1.5 w-full rounded bg-[#30363d]" />
                        <div className="h-1.5 w-1/2 rounded bg-[#30363d]" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <div className="h-2 w-2/3 rounded bg-[#58a6ff]/30" />
                        <div className="h-1.5 w-full rounded bg-[#21262d]" />
                        <div className="h-1.5 w-5/6 rounded bg-[#21262d]" />
                        <div className="h-1.5 w-4/5 rounded bg-[#21262d]" />
                      </div>
                    </div>
                  ) : tpl.layoutType === 'technical' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-2 w-1/3 rounded bg-[#58a6ff]/40" />
                        <div className="h-1.5 w-1/4 rounded bg-[#21262d]" />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <div className="h-3 rounded bg-[#21262d] border border-[#30363d]/40" />
                        <div className="h-3 rounded bg-[#21262d] border border-[#30363d]/40" />
                      </div>
                      <div className="h-1.5 w-full rounded bg-[#21262d]" />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-1/2 rounded bg-[#f0f6fc]/20" />
                      <div className="h-1.5 w-full rounded bg-[#21262d]" />
                      <div className="h-1.5 w-4/5 rounded bg-[#21262d]" />
                      <div className="h-1.5 w-full rounded bg-[#21262d]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-3.5 sm:mt-6 pt-3 sm:pt-4 border-t border-[#30363d]">
                <a
                  href={`${APP_URL}/login`}
                  className="flex min-h-[40px] sm:min-h-[44px] items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  <span>Выбрать шаблон резюме</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
