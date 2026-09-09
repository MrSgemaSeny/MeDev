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
    <section id="templates" className="border-b border-[#30363d] bg-[#0d1117] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl">
            6 шаблонов резюме — выбери свой стиль
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#8b949e] sm:text-xl">
            Скачай PDF в один клик. Шаблоны спроектированы в соответствии со стандартами ATS для безошибочного считывания текстовой структуры рекрутинговыми системами.
          </p>
        </div>

        {/* Templates 3x2 Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-2xl border border-[#30363d] bg-[#161b22] p-8 transition-all hover:border-[#58a6ff]/60"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#f0f6fc]">{tpl.name}</h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded tracking-wider ${
                      tpl.isPro
                        ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                        : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                    }`}
                  >
                    {tpl.badge}
                  </span>
                </div>
                <p className="mt-3 text-base leading-relaxed text-[#c9d1d9] min-h-[50px]">
                  {tpl.description}
                </p>

                {/* Miniature CSS Document Skeleton Preview */}
                <div className="mt-6 rounded-xl border border-[#30363d] bg-[#0d1117] p-4 shadow-inner" aria-hidden="true">
                  {tpl.layoutType === 'two-column' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-2 border-r border-[#30363d]/60 pr-2">
                        <div className="h-2.5 w-full rounded bg-[#2ea043]/30" />
                        <div className="h-2 w-3/4 rounded bg-[#30363d]" />
                        <div className="h-2 w-full rounded bg-[#30363d]" />
                        <div className="h-2 w-1/2 rounded bg-[#30363d]" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <div className="h-2.5 w-2/3 rounded bg-[#58a6ff]/30" />
                        <div className="h-2 w-full rounded bg-[#21262d]" />
                        <div className="h-2 w-5/6 rounded bg-[#21262d]" />
                        <div className="h-2 w-4/5 rounded bg-[#21262d]" />
                      </div>
                    </div>
                  ) : tpl.layoutType === 'technical' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-2.5 w-1/3 rounded bg-[#58a6ff]/40" />
                        <div className="h-2 w-1/4 rounded bg-[#21262d]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="h-4 rounded bg-[#21262d] border border-[#30363d]/40" />
                        <div className="h-4 rounded bg-[#21262d] border border-[#30363d]/40" />
                      </div>
                      <div className="h-2 w-full rounded bg-[#21262d]" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-3 w-1/2 rounded bg-[#f0f6fc]/20" />
                      <div className="h-2 w-full rounded bg-[#21262d]" />
                      <div className="h-2 w-4/5 rounded bg-[#21262d]" />
                      <div className="h-2 w-full rounded bg-[#21262d]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-8 pt-4 border-t border-[#30363d]">
                <a
                  href={`${APP_URL}/login`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] py-3 text-sm font-bold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
                >
                  <span>Выбрать шаблон резюме</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
