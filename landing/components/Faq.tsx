'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Что MeDev берёт из моего GitHub?',
    answer:
      'После входа через GitHub мы читаем твои публичные репозитории — языки, проекты, историю коммитов. Приватные репозитории мы не видим и не запрашиваем.',
  },
  {
    question: 'Может ли AI выдумать в резюме то чего я не делал?',
    answer:
      'Нет. MeDev передаёт AI только то что есть в твоих реальных коммитах и загруженном PDF. AI адаптирует формулировки под вакансию — но не придумывает технологии или опыт которого у тебя нет.',
  },
  {
    question: 'Пройдёт ли моё резюме через фильтры HR-систем?',
    answer:
      'Да. PDF-файлы из MeDev генерируются в стандартном текстовом формате без скрытых слоёв и графических артефактов. Форматирование оптимизировано для корректного считывания текста популярными ATS и HR-платформами (включая hh.kz, Workday, Greenhouse и др.).',
  },
  {
    question: 'Бесплатный тариф — это навсегда или только на старте?',
    answer:
      'Навсегда. Без привязки карты. Бесплатный тариф даёт синхронизацию GitHub, личную страницу-портфолио и до 3 PDF-резюме. Платить нужно только если хочешь безлимитную генерацию и все 6 шаблонов.',
  },
  {
    question: 'Моё резюме будет выглядеть профессионально?',
    answer:
      'Да. Все шаблоны сделаны с расчётом что рекрутер тратит на резюме 6-10 секунд. Чистая вёрстка, правильная иерархия, нужные секции на виду.',
  },
  {
    question: 'Как оплатить PRO из Казахстана и есть ли возврат?',
    answer:
      'Через Kaspi Pay в тенге или через Stripe картой. Подписка активируется мгновенно. Действует 14-дневная гарантия возврата средств при первом обращении, а отключить продление можно в любой момент в настройках.',
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-b border-[#30363d] bg-[#0d1117] py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Ответы на ключевые вопросы
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#8b949e] sm:text-xl">
            Если остались вопросы — здесь ответы.
          </p>
        </div>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const btnId = `faq-btn-${idx}`;
            const panelId = `faq-panel-${idx}`;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#30363d] bg-[#161b22] transition-colors"
              >
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 sm:p-8 text-left transition-colors hover:text-[#58a6ff] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded-2xl"
                >
                  <span className="text-lg sm:text-xl font-bold text-[#f0f6fc]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-6 w-6 shrink-0 text-[#8b949e] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2ea043]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className="px-6 sm:px-8 pb-8 pt-2 text-base sm:text-lg leading-relaxed text-[#c9d1d9] border-t border-[#30363d]"
                  >
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
