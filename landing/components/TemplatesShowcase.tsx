import React from 'react';
import { Layout, Check, ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

const templates = [
  {
    id: 'classic',
    name: 'Classic ATS',
    category: 'Enterprise & Корпорации',
    description: 'Строгий, чистый, без лишнего. Идеально подходит для крупных компаний и банков.',
    atsScore: '100%',
    layoutType: 'single-column',
    features: ['Строгая хронология', 'Стандартные секции', 'Легко читается HR'],
  },
  {
    id: 'modern',
    name: 'Modern Split',
    category: 'Product & FinTech',
    description: 'Двухколоночный макет с боковой панелью для навыков. Удобно умещает опыт на 1 странице.',
    atsScore: '98%',
    layoutType: 'two-column',
    features: ['Сайдбар для навыков', 'Компактное оформление', 'Акцент на опыте'],
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    category: 'Стартапы & Scaleups',
    description: 'Лаконичный дизайн без визуального шума. Рекрутер считывает главное за 6 секунд.',
    atsScore: '99%',
    layoutType: 'minimal',
    features: ['Высокая читаемость', 'Четкая структура', 'Фокус на результатах'],
  },
  {
    id: 'technical',
    name: 'Technical GitHub',
    category: 'Backend & Systems',
    description: 'Акцент на ключевой стек, подтвержденные репозитории и ссылки на кодовую базу.',
    atsScore: '97%',
    layoutType: 'technical',
    features: ['Блок репозиториев', 'Стек технологий', 'Ссылки на код'],
  },
  {
    id: 'executive',
    name: 'Executive Lead',
    category: 'Tech Lead & Senior',
    description: 'Для опытных специалистов: упор на лидерство, результаты и управление проектами.',
    atsScore: '98%',
    layoutType: 'executive',
    features: ['Управление проектами', 'Достижения команды', 'Масштаб решений'],
  },
  {
    id: 'creative',
    name: 'Creative UI',
    category: 'Frontend & Full-Stack',
    description: 'Выразительный макет для frontend и full-stack разработчиков с упором на витрину проектов.',
    atsScore: '96%',
    layoutType: 'creative',
    features: ['Витрина проектов', 'Визуальные акценты', 'Современная сетка'],
  },
];

export const TemplatesShowcase = () => {
  return (
    <section id="templates" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#58a6ff]">
            <Layout className="h-3.5 w-3.5" />
            <span>Шаблоны резюме</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            6 шаблонов резюме — выбери свой стиль
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            Скачай PDF в один клик. Все шаблоны проходят автоматические фильтры HR-систем.
          </p>
        </div>

        {/* Templates 3x2 Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6 transition-all hover:border-[#8b949e]/60"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-[11px] font-medium text-[#8b949e]">
                    {tpl.category}
                  </span>
                  <span className="text-[11px] font-semibold text-[#2ea043] bg-[#238636]/10 border border-[#238636]/30 px-2 py-0.5 rounded">
                    Совместимость {tpl.atsScore}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-[#f0f6fc]">{tpl.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8b949e] min-h-[36px]">
                  {tpl.description}
                </p>

                {/* Miniature CSS Document Skeleton Preview */}
                <div className="mt-5 rounded-lg border border-[#30363d] bg-[#0d1117] p-3 shadow-inner">
                  {tpl.layoutType === 'two-column' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-1.5 border-r border-[#30363d]/60 pr-2">
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
                        <div className="h-2 w-1/4 rounded bg-[#21262d]" />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
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

                {/* Feature Pills */}
                <div className="mt-4 space-y-1.5 border-t border-[#30363d]/60 pt-3">
                  {tpl.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-[11px] text-[#c9d1d9]">
                      <Check className="h-3 w-3 text-[#2ea043]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-[#30363d]">
                <a
                  href={`${APP_URL}/login`}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white"
                >
                  <span>Выбрать шаблон</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
