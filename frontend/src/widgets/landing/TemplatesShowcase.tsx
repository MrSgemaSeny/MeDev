import { useState } from 'react';
import { FileText, Check, Layout, Sparkles, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 'classic',
    name: 'Classic (ATS Standard)',
    badge: 'Рекомендуется для Enterprise & BigTech',
    description:
      'Одноколоночный строгий макет со стандартными шрифтами и четкой иерархией. Максимальная совместимость со всеми типами ATS-сканеров (Workday, Greenhouse, Lever).',
    color: '#30363d',
    features: ['100% ATS-парсинг', 'Четкая хронология', 'Идеален для backend & data инженеров'],
    preview: {
      header: 'Иван Иванов · Senior Java Engineer',
      section1: 'Опыт работы: 5+ лет (Spring Boot, High-Load, Microservices)',
      section2: 'Ключевые проекты: MeDev Platform, FinTech Core Service',
      section3: 'Образование & Сертификации: Computer Science, Oracle Certified',
    },
  },
  {
    id: 'modern',
    name: 'Modern (Двухколоночный)',
    badge: 'Топ выбор для стартапов и Product компаний',
    description:
      'Сбалансированная двухколоночная структура с акцентным сайдбаром для навыков, языков, метрик и контактов. Экономит место на первой странице.',
    color: '#238636',
    features: ['Акцентный сайдбар навыков', 'Компактное размещение', 'Стильная типографика'],
    preview: {
      header: 'Мурат Орынбасар · Tech Lead / Architect',
      section1: 'Стек: Java 17, React 19, PostgreSQL, Docker, Redis',
      section2: 'Архитектура: Модульный монолит, RLS, Groq AI Pipeline',
      section3: 'Достижения: 100% uptime, 250+ JUnit тестов, sub-15ms отклик',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal (Чистый код)',
    badge: 'Скандинавский минимализм',
    description:
      'Максимум воздуха и плотности информации без графического шума. Фокус только на коде, метриках и ценности, которую инженер приносит в бизнес.',
    color: '#8b949e',
    features: ['Нулевой визуальный шум', 'Плотные буллеты достижений', 'Быстрое сканирование за 6 сек'],
    preview: {
      header: 'Software Engineer · Systems & Core',
      section1: 'Impact: Снизил latency API с 120ms до 14ms через Caffeine L1',
      section2: 'Scale: Оптимизировал 18k RPS нагрузочные тесты Artillery',
      section3: 'Code: Чистый FSD на фронтенде и DDD на бэкенде',
    },
  },
  {
    id: 'technical',
    name: 'Technical (GitHub-Centric)',
    badge: 'Для Open Source контрибьюторов',
    description:
      'Выделенный блок для GitHub репозиториев, ссылок на коммиты, контрибуций и архитектурных заметок. Говорит на языке реального кода.',
    color: '#58a6ff',
    features: ['Интеграция репо & звезд', 'Кодовые сниппеты', 'Прямые ссылки на PR'],
    preview: {
      header: 'Open Source Dev · github.com/MrSgemaSeny',
      section1: 'Top Repos: MeDev (253 tests), JF-1C (545 commits), Valeur',
      section2: 'Stack Matrix: Java (45%), TypeScript (35%), SQL (20%)',
      section3: 'Security: Zero IDOR, stateless JWT, strict Flyway V24',
    },
  },
  {
    id: 'executive',
    name: 'Executive (Tech Lead / Engineering Manager)',
    badge: 'Для лидеров команд и архитекторов',
    description:
      'Акцент на стратегию, управление инженерными командами, менторство, найм и метрики продуктивности инженерных отделов.',
    color: '#a371f7',
    features: ['Блок лидерства и менторства', 'Архитектурные ADR', 'Бизнес-метрики'],
    preview: {
      header: 'Head of Engineering / Lead Architect',
      section1: 'Leadership: Менторство 15+ разработчиков, проведение 100+ интервью',
      section2: 'Governance: Внедрение FSD, Tiered Memory Model и CI/CD',
      section3: 'Cost Optimization: Снижение серверных костов на 40%',
    },
  },
  {
    id: 'creative',
    name: 'Creative (Frontend & Full-Stack UI)',
    badge: 'Для инженеров с сильным чувством дизайна',
    description:
      'Выразительные акценты, сетка проектов с превью интерфейсов и акцент на UX/UI и доступность (WCAG AA).',
    color: '#d29922',
    features: ['Визуальная сетка портфолио', 'Метрики доступности', 'Акцент на UI-инжиниринг'],
    preview: {
      header: 'Full-Stack UI Engineer · Design Systems',
      section1: 'Design System: GitHub Dark Tokens, Tailwind v4, zero deslop',
      section2: 'Interactive: Canvas 2D, Three.js, dnd-kit, Radix UI',
      section3: 'Performance: 100 Lighthouse Performance score',
    },
  },
];

export const TemplatesShowcase = () => {
  const [selectedId, setSelectedId] = useState('classic');
  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  return (
    <section id="templates" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#58a6ff]">
            <Layout className="h-3.5 w-3.5" />
            <span>Коллекция шаблонов</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            6 инженерных PDF-дизайнов под любые цели
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            Каждый шаблон сверстан на Thymeleaf + Flying Saucer и оттестирован на прохождение через ATS-парсеры ведущих HR-систем.
          </p>
        </div>

        {/* Template Selector Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {templates.map((tpl) => {
            const isActive = tpl.id === selectedId;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedId(tpl.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'border border-[#238636] bg-[#21262d] text-[#f0f6fc] shadow-sm'
                    : 'border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                }`}
              >
                <FileText className="h-3.5 w-3.5" style={{ color: tpl.color }} />
                <span>{tpl.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Template Card & Visual Preview */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-6 sm:p-8">
            <div>
              <div className="inline-block rounded border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-xs font-medium text-[#c9d1d9]">
                {activeTemplate.badge}
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#f0f6fc]">{activeTemplate.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">
                {activeTemplate.description}
              </p>

              <div className="mt-6 space-y-2.5">
                {activeTemplate.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-[#c9d1d9]">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#238636]/20">
                      <Check className="h-3 w-3 text-[#2ea043]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#30363d] flex items-center justify-between">
              <span className="text-xs text-[#8b949e]">Готов к экспорту в 1 клик</span>
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-md bg-[#238636] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2ea043]"
              >
                <span>Создать в этом стиле</span>
                <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Mock Document Preview (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[#30363d] bg-[#0d1117] p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Fake PDF Header */}
              <div className="border-b border-[#30363d] pb-4">
                <div className="text-base sm:text-lg font-bold text-[#f0f6fc] font-mono">
                  {activeTemplate.preview.header}
                </div>
                <div className="mt-1 text-xs text-[#8b949e] font-mono flex gap-3">
                  <span>email: candidate@medev.io</span>
                  <span>github: github.com/user</span>
                  <span>pdf-engine: flying-saucer-9.1</span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4 text-xs sm:text-sm text-[#c9d1d9]">
                <div className="rounded-lg border border-[#30363d]/60 bg-[#161b22] p-3.5">
                  <div className="text-[11px] font-semibold text-[#58a6ff] uppercase tracking-wider mb-1">
                    01. Ключевой опыт
                  </div>
                  <div>{activeTemplate.preview.section1}</div>
                </div>

                <div className="rounded-lg border border-[#30363d]/60 bg-[#161b22] p-3.5">
                  <div className="text-[11px] font-semibold text-[#2ea043] uppercase tracking-wider mb-1">
                    02. Проекты и Результаты
                  </div>
                  <div>{activeTemplate.preview.section2}</div>
                </div>

                <div className="rounded-lg border border-[#30363d]/60 bg-[#161b22] p-3.5">
                  <div className="text-[11px] font-semibold text-[#d29922] uppercase tracking-wider mb-1">
                    03. Технические Достижения
                  </div>
                  <div>{activeTemplate.preview.section3}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
              <div className="flex items-center gap-1.5 font-mono">
                <Download className="h-3.5 w-3.5 text-[#2ea043]" />
                <span>Vector PDF (A4 300 DPI)</span>
              </div>
              <span className="font-mono text-[#8b949e]">Thymeleaf Engine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
