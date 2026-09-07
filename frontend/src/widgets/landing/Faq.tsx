import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Как происходит синхронизация с моим GitHub аккаунтом?',
    answer:
      'Вы авторизуетесь через официальный GitHub OAuth2. MeDev запрашивает только публичный профиль и публичные репозитории. Мы анализируем языки программирования, историю коммитов и описания проектов, формируя структурированный профиль разработчика.',
  },
  {
    question: 'Почему Groq AI не придумывает несуществующий опыт (zero hallucinations)?',
    answer:
      'В MeDev внедрен алгоритм Smart Merge. Мы подаем в Groq AI (модель openai/gpt-oss-20b) строго верифицированные факты из ваших коммитов и загруженного PDF. Нейросеть отвечает за адаптацию формулировок под требования вакансии и выделение бизнес-импакта, а не за выдумывание стека.',
  },
  {
    question: 'Проходят ли сгенерированные PDF-резюме автоматические ATS-парсеры?',
    answer:
      'Да. Мы генерируем стандартные векторные PDF через движок Flying Saucer + Thymeleaf. В них нет многослойных SVG, разрывов таблиц или скрытых шрифтов, поэтому такие HR-системы, как Workday, Greenhouse и Lever парсят 100% текста без ошибок.',
  },
  {
    question: 'Действительно ли базовый тариф Developer бесплатен?',
    answer:
      'Да, тариф Developer бесплатен навсегда. Вы получаете неограниченную синхронизацию с GitHub, публичный профиль medev.mrsgemaseny.com/:username, до 3 PDF-резюме и полноценный трекер откликов Kanban.',
  },
  {
    question: 'Как обеспечивается высокая скорость открытия публичного портфолио?',
    answer:
      'На бэкенде MeDev (Spring Boot 3) развернута двухуровневая архитектура кэширования: L1 In-Memory Caffeine для мгновенного отклика (sub-15ms) и L2 Valkey Redis. При сохранении любых изменений в профиле кэш сбрасывается только после успешного завершения транзакции БД.',
  },
  {
    question: 'Как работает оплата тарифа PRO?',
    answer:
      'Для пользователей из Казахстана поддерживается Kaspi Pay, а также международные платежи через Stripe Checkout. Подписка активируется мгновенно и может быть отменена в любой момент в настройках профиля.',
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#8b949e]">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Частые вопросы</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            Ответы на ключевые вопросы
          </h2>
          <p className="mt-4 text-sm text-[#8b949e]">
            Все, что нужно знать об архитектуре, безопасности данных и работе сервиса.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-xl border border-[#30363d] bg-[#161b22] transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:text-[#58a6ff]"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#f0f6fc]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#8b949e] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2ea043]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-[#8b949e] border-t border-[#30363d]/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
