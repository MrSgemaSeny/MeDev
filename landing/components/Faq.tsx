'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

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
      'Да. PDF-файлы из MeDev генерируются в стандартном текстовом формате без таблиц и скрытых слоёв. Такие файлы читают все крупные HR-платформы включая hh.kz, Workday и Greenhouse.',
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
    question: 'Как оплатить PRO из Казахстана?',
    answer:
      'Через Kaspi Pay — привычно и мгновенно. Или через Stripe если платишь картой. Подписка активируется сразу, отменить можно в настройках в любой момент.',
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
            Если остались вопросы — здесь ответы.
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
