import { Layout, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 'clean',
    name: 'Clean ATS',
    category: 'Enterprise & BigTech',
    isPro: false,
    badge: 'FREE',
    description: 'Одноколоночный строгий макет со стандартными секциями. Идеальная проходимость через любые корпоративные ATS-парсеры.',
    atsScore: 'ATS-Ready',
    layoutType: 'single-column',
    features: ['Строгая хронология', 'Стандартные заголовки', 'Без разрывов страниц'],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Backend & Systems',
    isPro: false,
    badge: 'FREE',
    description: 'Фирменный стиль GitHub: акцент на ключевой стек, подтвержденные репозитории и ссылки на кодовую базу.',
    atsScore: '99%',
    layoutType: 'technical',
    features: ['Блок репозиториев', 'Стек-матрица', 'Верифицированный код'],
  },
  {
    id: 'milky-soft',
    name: 'Milky Soft',
    category: 'Product & Full-Stack',
    isPro: true,
    badge: 'PRO',
    description: 'Теплый крафтовый двухколоночный дизайн с мягкой палитрой. Идеально для Full-Stack и Indie-разработчиков.',
    atsScore: '98%',
    layoutType: 'two-column',
    features: ['Сайдбар для навыков', 'Выделение ключевых метрик', 'Плотная верстка'],
  },
  {
    id: 'apple-modern',
    name: 'Apple',
    category: 'Tech Lead & Senior',
    isPro: true,
    badge: 'PRO',
    description: 'Ультраминимализм в духе Купертино: выверенный воздух, строгая сетка и типографика для Senior и Lead инженеров.',
    atsScore: '99%',
    layoutType: 'minimal',
    features: ['Высокая плотность текста', 'Минималистичные буллеты', 'Фокус на результатах'],
  },
  {
    id: 'grok-monolith',
    name: 'Grok',
    category: 'Startups & Scaleups',
    isPro: false,
    badge: 'FREE',
    description: 'Бруталистский черно-белый монохром. Терминальная четкость, высокая контрастность и фокус на фактах.',
    atsScore: '98%',
    layoutType: 'single-column',
    features: ['Терминальный стиль', 'Контрастные границы', 'Без визуального шума'],
  },
  {
    id: 'phub-orange',
    name: 'PH Orange',
    category: 'Frontend & Creative',
    isPro: true,
    badge: 'PRO',
    description: 'Высококонтрастный темный стиль с оранжевым акцентом. Максимальное привлечение внимания к ключевым достижениям.',
    atsScore: '97%',
    layoutType: 'two-column',
    features: ['Яркий акцент', 'Блок ключевых проектов', 'Визуальная иерархия'],
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
            6 инженерных форматов для любых требований
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            Каждый шаблон оптимизирован под стандарты международного найма и генерирует чистый векторный PDF в 1 клик.
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
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                        tpl.isPro
                          ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                          : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                      }`}
                    >
                      {tpl.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-[#2ea043] bg-[#238636]/10 border border-[#238636]/30 px-2 py-0.5 rounded">
                      ATS {tpl.atsScore}
                    </span>
                  </div>
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
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white"
                >
                  <span>Выбрать шаблон</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
