import React from 'react';
import {
  GitPullRequest,
  Bot,
  KanbanSquare,
  FileCode2,
  Lock,
  Zap,
  Database,
} from 'lucide-react';

const pillars = [
  {
    title: 'Автоматический GitHub Sync',
    tag: 'GitHub API v3',
    description:
      'Импорт всех публичных репозиториев, языков программирования, динамики коммитов и верифицированных проектов без ручного заполнения анкет.',
    icon: GitPullRequest,
    metrics: ['Авто-детект топ-языков', 'Синхронизация коммитов', 'Верифицированные ссылки'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
  {
    title: 'AI Resume Studio (Groq GPT-20B)',
    tag: 'Smart Merge Core',
    description:
      'Генерация резюме под конкретные вакансии. Наш алгоритм Smart Merge сверяет реальные коммиты с PDF-опытом, исключая галлюцинации LLM.',
    icon: Bot,
    metrics: ['Строгая модель openai/gpt-oss-20b', 'ATS-оптимизированный текст', '0% выдуманных технологий'],
    highlight: 'border-[#238636]/40 bg-[#161b22]',
  },
  {
    title: 'Мгновенное портфолио (/:username)',
    tag: 'L1 Caffeine + L2 Valkey',
    description:
      'Персональная страница разработчика с откликом менее 15мс. Двухуровневый кэш, реактивная инвалидация через события Spring и адаптивный дизайн.',
    icon: Zap,
    metrics: ['Отклик sub-15ms', '6 цветовых схем', 'SEO и OpenGraph метатеги'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
  {
    title: 'Job Tracker ATS & Kanban',
    tag: 'Career CRM',
    description:
      'Полноценный трекер собеседований с drag-and-drop доской, фиксацией зарплатных вилок, дат этапов, заметок рекрутеров и архивной аналитикой.',
    icon: KanbanSquare,
    metrics: ['Drag-and-Drop воронка', 'История статусов и офферов', 'Аналитика конверсии'],
    highlight: 'border-[#30363d] bg-[#161b22]',
  },
];

const smallFeatures = [
  {
    icon: FileCode2,
    title: 'Экспорт в PDF через Flying Saucer',
    description: 'Чистый векторный PDF без сдвигов верстки, проходящий любые корпоративные ATS-парсеры.',
  },
  {
    icon: Lock,
    title: 'Zero-Trust Безопасность & RLS',
    description: 'Row-Level Security на уровне бэкенда, JWT в безопасных cookies и полная защита от IDOR.',
  },
  {
    icon: Database,
    title: 'PostgreSQL 17 + Flyway',
    description: 'Строгие миграции БД, версионирование схемы и подготовка к семантическому поиску через pgvector.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            Все инструменты инженера в одной платформе
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            Хватит тратить часы на верстку резюме в Word или Canva. MeDev берет достоверные данные из вашего GitHub и превращает их в рабочий карьерный арсенал.
          </p>
        </div>

        {/* 4 Major Pillars (Bento Grid) */}
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

        {/* 3 Secondary Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {smallFeatures.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 transition-all hover:border-[#8b949e]/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d]">
                <item.icon className="h-4 w-4 text-[#58a6ff]" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-[#f0f6fc]">{item.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8b949e]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
