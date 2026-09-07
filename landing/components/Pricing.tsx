import React from 'react';
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
    buttonText: 'Перейти на PRO',
    featured: true,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="border-b border-[#30363d] bg-[#0d1117] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Честные тарифы без скрытых платежей
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#8b949e] sm:text-xl">
            Начните бесплатно без привязки банковской карты. Переходите на PRO, когда активно ищете работу.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-5xl lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-2xl p-8 sm:p-10 transition-all ${
                tier.featured
                  ? 'border-2 border-[#238636] bg-[#161b22] shadow-xl'
                  : 'border border-[#30363d] bg-[#161b22]'
              }`}
            >
              <div>
                <h3 className="text-2xl font-bold text-[#f0f6fc]">{tier.name}</h3>

                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold tracking-tight text-[#f0f6fc]">
                    {tier.price}
                  </span>
                  <span className="text-base font-semibold text-[#8b949e]">{tier.period}</span>
                  {tier.localPrice && (
                    <span className="text-sm text-[#8b949e]">({tier.localPrice})</span>
                  )}
                </div>

                <p className="mt-4 text-base leading-relaxed text-[#c9d1d9]">{tier.description}</p>

                <div className="mt-8 border-t border-[#30363d] pt-8">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-base text-[#c9d1d9]">
                        <Check className="h-5 w-5 shrink-0 text-[#2ea043] mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#30363d]">
                <a
                  href={tier.href}
                  className={`flex w-full items-center justify-center rounded-xl py-4 text-base font-bold transition-all ${
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

        {/* Payment info */}
        <div className="mt-12 text-center text-base text-[#8b949e]">
          Kaspi Pay для Казахстана · Stripe для всего мира · Отмена в любой момент
        </div>
      </div>
    </section>
  );
};
