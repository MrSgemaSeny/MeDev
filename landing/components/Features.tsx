import React from 'react';
import {
  GitPullRequest,
  Sparkles,
  KanbanSquare,
  Globe,
  Sliders,
  Download,
} from 'lucide-react';

const pillars = [
  {
    num: '01',
    title: 'Резюме из твоих реальных проектов',
    description:
      'Подключи GitHub одним кликом. MeDev сам найдёт твои ключевые проекты, языки и опыт разработки — без ручного заполнения анкет.',
    icon: GitPullRequest,
  },
  {
    num: '02',
    title: 'Резюме под конкретную вакансию',
    description:
      'Вставь ссылку на вакансию — получи резюме, адаптированное под её требования. Только твой реальный опыт и факты из коммитов.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Твоё портфолио по личной ссылке',
    description:
      'Получи персональную страницу medev.mrsgemaseny.com/твой-ник с проектами, стеком и контактами. Отправляй её работодателям напрямую.',
    icon: Globe,
  },
  {
    num: '04',
    title: 'Не теряй отклики',
    description:
      'Канбан-доска для всех твоих заявок. Статус, дата, контакты рекрутера и условия офферов — всё в одном месте.',
    icon: KanbanSquare,
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
    description: 'Выбери подходящий шаблон и адаптируй текст под желаемую вакансию.',
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
    <section id="features" className="border-b border-[#30363d] bg-[#0d1117] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Всё что нужно чтобы найти работу быстрее
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#8b949e] sm:text-xl">
            От пустого резюме до оффера — один инструмент.
          </p>
        </div>

        {/* 4 Major Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 sm:p-10 transition-all hover:border-[#58a6ff]/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d]">
                  <pillar.icon className="h-7 w-7 text-[#2ea043]" />
                </div>
                <span className="font-mono text-xl font-bold text-[#8b949e]">
                  {pillar.num}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#f0f6fc]">
                {pillar.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#c9d1d9] sm:text-lg">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works (3 Steps) */}
        <div className="mt-20 rounded-2xl border border-[#30363d] bg-[#161b22] p-8 sm:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-[#f0f6fc] sm:text-3xl">
              Как это работает
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-[#30363d]/70 bg-[#0d1117] p-8 transition-all hover:border-[#58a6ff]/40"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d]">
                    <s.icon className="h-6 w-6 text-[#58a6ff]" />
                  </div>
                  <span className="font-mono text-base font-bold text-[#8b949e]">{s.step}</span>
                </div>
                <h4 className="text-xl font-bold text-[#f0f6fc]">{s.title}</h4>
                <p className="mt-3 text-base leading-relaxed text-[#8b949e]">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
