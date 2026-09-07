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
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#30363d] bg-[#161b22] transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 sm:p-8 text-left transition-colors hover:text-[#58a6ff]"
                >
                  <span className="text-lg sm:text-xl font-bold text-[#f0f6fc]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-6 w-6 shrink-0 text-[#8b949e] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2ea043]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-8 pt-2 text-base sm:text-lg leading-relaxed text-[#c9d1d9] border-t border-[#30363d]">
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
