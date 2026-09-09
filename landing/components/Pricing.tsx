import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

const tiers = [
  {
    name: 'Developer',
    id: 'tier-developer',
    href: `${APP_URL}/login`,
    price: '0 ₸',
    period: 'навсегда',
    description: 'Идеально для старта: собери портфолио и подготовь первое резюме.',
    features: [
      'Синхронизация с GitHub (все публичные проекты)',
      'Личная страница-портфолио по ссылке',
      'До 3 сгенерированных PDF-резюме',
      'Канбан-доска для трекинга откликов',
      'Базовая адаптация под вакансии',
    ],
    buttonText: 'Начать бесплатно',
    featured: false,
  },
  {
    name: 'PRO',
    id: 'tier-pro',
    href: `${APP_URL}/login`,
    price: '$9',
    localPrice: 'или 4 500 ₸',
    period: '/ месяц',
    description: 'Для активного поиска работы, нескольких направлений и максимального отклика.',
    features: [
      'Все возможности бесплатного тарифа',
      'Безлимитная генерация резюме под любые вакансии',
      'Доступ ко всем 6 шаблонам',
      'Верифицированный бейдж PRO в портфолио',
      'Более быстрая генерация PDF',
      'Оплата через Kaspi Pay или Stripe',
      'Экспорт профиля в JSON и Markdown',
      'Приоритетная поддержка',
    ],
    buttonText: 'Оформить подписку PRO',
    featured: true,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="border-b border-[#30363d] bg-[#0d1117] py-14 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#f0f6fc] break-words">
            Честные тарифы без скрытых платежей
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-xl leading-relaxed text-[#8b949e]">
            Начните бесплатно без привязки банковской карты. Переходите на PRO, когда активно ищете работу.
          </p>
        </div>

        <div className="mx-auto mt-10 sm:mt-16 grid max-w-lg grid-cols-1 gap-6 sm:gap-8 lg:max-w-5xl lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-2xl p-5 sm:p-8 lg:p-10 transition-all ${
                tier.featured
                  ? 'border-2 border-[#238636] bg-[#161b22] shadow-xl'
                  : 'border border-[#30363d] bg-[#161b22]'
              }`}
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#f0f6fc]">{tier.name}</h3>

                <div className="mt-5 sm:mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#f0f6fc]">
                    {tier.price}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#8b949e]">{tier.period}</span>
                  {tier.localPrice && (
                    <span className="text-xs sm:text-sm text-[#8b949e]">({tier.localPrice})</span>
                  )}
                </div>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-[#c9d1d9]">{tier.description}</p>

                <div className="mt-6 sm:mt-8 border-t border-[#30363d] pt-6 sm:pt-8">
                  <ul className="space-y-3 sm:space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm sm:text-base text-[#c9d1d9]">
                        <Check className="h-5 w-5 shrink-0 text-[#2ea043] mt-0.5" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[#30363d]">
                <a
                  href={tier.href}
                  className={`flex w-full min-h-[44px] items-center justify-center rounded-xl px-4 py-3.5 sm:py-4 text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none ${
                    tier.featured
                      ? 'bg-[#238636] text-white shadow-md hover:bg-[#2ea043]'
                      : 'border border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white'
                  }`}
                >
                  {tier.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Payment info & Refund guarantee */}
        <div className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-[#8b949e] space-y-1 px-2">
          <div>
            Kaspi Pay для Казахстана · Stripe для всего мира · Отмена в любой момент
          </div>
          <div>
            Действует{' '}
            <Link href="/refund" className="text-[#58a6ff] hover:underline font-medium">
              14-дневная гарантия полного возврата средств
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
};
