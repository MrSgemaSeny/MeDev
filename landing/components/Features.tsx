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
    title: 'AI Job Match & Cover Letter',
    description:
      'Вставь текст или ссылку на вакансию: AI рассчитает процент совместимости твоего стека и сгенерирует точечное сопроводительное письмо на основе реальных проектов.',
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
    <section id="features" className="border-b border-[#30363d] bg-[#0d1117] py-10 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#f0f6fc] break-words">
            Всё что нужно чтобы найти работу быстрее
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-[#8b949e]">
            От пустого резюме до оффера — один инструмент.
          </p>
        </div>

        {/* 4 Major Pillars */}
        <div className="mt-6 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-xl sm:rounded-2xl border border-[#30363d] bg-[#161b22] p-3.5 sm:p-6 lg:p-8 transition-all hover:border-[#58a6ff]/50"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-5">
                <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border border-[#30363d] bg-[#21262d]">
                  <pillar.icon className="h-4.5 w-4.5 sm:h-6 sm:w-6 text-[#2ea043]" />
                </div>
                <span className="font-mono text-sm sm:text-lg font-bold text-[#8b949e]">
                  {pillar.num}
                </span>
              </div>

              <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-[#f0f6fc]">
                {pillar.title}
              </h3>
              <p className="mt-1.5 sm:mt-3 text-xs sm:text-sm lg:text-base leading-relaxed text-[#c9d1d9]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works (3 Steps) */}
        <div className="mt-8 sm:mt-16 rounded-xl sm:rounded-2xl border border-[#30363d] bg-[#161b22] p-3.5 sm:p-6 lg:p-10">
          <div className="text-center mb-4 sm:mb-8">
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#f0f6fc]">
              Как это работает
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-5">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-lg sm:rounded-xl border border-[#30363d]/70 bg-[#0d1117] p-3 sm:p-5 transition-all hover:border-[#58a6ff]/40"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#21262d]">
                    <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#58a6ff]" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#8b949e]">{s.step}</span>
                </div>
                <h4 className="text-sm sm:text-lg font-bold text-[#f0f6fc]">{s.title}</h4>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[#8b949e]">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
