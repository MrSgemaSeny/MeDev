import React from 'react';
import {
  GitPullRequest,
  Sparkles,
  KanbanSquare,
  Globe,
  ArrowRight,
  FileText,
  Sliders,
  Download,
} from 'lucide-react';

const pillars = [
  {
    title: 'Резюме из твоих реальных проектов',
    tag: 'GitHub',
    description:
      'Подключи GitHub одним кликом. MeDev сам найдёт твои лучшие проекты, языки и опыт — без ручного заполнения анкет.',
    icon: GitPullRequest,
    metrics: ['Всё из реальных коммитов', 'Без выдуманного опыта', 'Обновляется автоматически'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
  {
    title: 'Резюме под конкретную вакансию',
    tag: 'Адаптация',
    description:
      'Вставь ссылку на вакансию — получи резюме адаптированное под её требования. Только твой реальный опыт, никаких выдумок.',
    icon: Sparkles,
    metrics: ['Адаптация под каждую вакансию', 'Только реальный опыт', 'Формат понятен HR-системам'],
    highlight: 'border-[#238636]/40 bg-[#161b22]',
  },
  {
    title: 'Твоё портфолио по личной ссылке',
    tag: 'Портфолио',
    description:
      'Получи страницу medev.mrsgemaseny.com/твой-ник с проектами, стеком и контактами. Отправляй её вместо резюме или вместе с ним.',
    icon: Globe,
    metrics: ['Готово сразу после регистрации', 'Открывается мгновенно', '6 цветовых схем'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
  {
    title: 'Не теряй отклики',
    tag: 'Трекер',
    description:
      'Канбан-доска для всех твоих заявок. Статус, дата, контакт рекрутера, зарплатная вилка — всё в одном месте.',
    icon: KanbanSquare,
    metrics: ['Перетаскивай карточки по этапам', 'Фиксируй условия офферов', 'Видишь всю воронку сразу'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
];

const steps = [
  {
    step: '01',
    icon: GitPullRequest,
    title: 'Подключи GitHub',
    description: 'Вход в 1 клик. Сервис автоматически определит твои основные языки, проекты и историю коммитов.',
  },
  {
    step: '02',
    icon: Sliders,
    title: 'Настрой резюме',
    description: 'Выбери подходящий дизайн из 6 шаблонов и при необходимости адаптируй текст под желаемую вакансию.',
  },
  {
    step: '03',
    icon: Download,
    title: 'Скачай PDF',
    description: 'Получи готовый PDF-файл, который без ошибок распознается HR-системами и рекрутерами.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            Всё что нужно чтобы найти работу быстрее
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            От пустого резюме до оффера — один инструмент.
          </p>
        </div>

        {/* 4 Major Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className={`flex flex-col justify-between rounded-xl border p-6 sm:p-8 transition-all hover:border-[#8b949e]/50 ${pillar.highlight}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#30363d] bg-[#21262d]">
                    <pillar.icon className="h-5 w-5 text-[#2ea043]" />
                  </div>
                  <span className="rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 font-mono text-[11px] text-[#8b949e]">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#f0f6fc]">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8b949e]">{pillar.description}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#30363d]">
                <ul className="space-y-2">
                  {pillar.metrics.map((metric) => (
                    <li key={metric} className="flex items-center gap-2 text-xs text-[#c9d1d9]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2ea043]" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works (3 Steps) */}
        <div className="mt-16 rounded-2xl border border-[#30363d] bg-[#161b22] p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2ea043]">
              Простой процесс
            </span>
            <h3 className="mt-2 text-xl font-bold text-[#f0f6fc] sm:text-2xl">
              Как это работает
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-[#30363d]/70 bg-[#0d1117] p-6 transition-all hover:border-[#8b949e]/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#21262d]">
                    <s.icon className="h-5 w-5 text-[#58a6ff]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#8b949e]">{s.step}</span>
                </div>
                <h4 className="text-base font-semibold text-[#f0f6fc]">{s.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#8b949e]">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
