import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medev.mrsgemaseny.com';

const tiers = [
  {
    name: 'Developer',
    id: 'tier-developer',
    href: `${APP_URL}/login`,
    price: '0 ₸',
    period: 'навсегда',
    description: 'Идеально для старта: соберите портфолио и отслеживайте первые вакансии.',
    features: [
      'Синхронизация с GitHub (все публичные репо)',
      'Публичная страница medev.mrsgemaseny.com/:username',
      'До 3 сгенерированных PDF-резюме',
      'Полнофункциональный Kanban Job Tracker',
      'Базовая модель Groq AI (GPT-20B)',
      'L1 Caffeine кэш профиля',
    ],
    buttonText: 'Начать бесплатно',
    featured: false,
  },
  {
    name: 'PRO Engineer',
    id: 'tier-pro',
    href: `${APP_URL}/login`,
    price: '$9',
    localPrice: 'или 4 500 ₸',
    period: '/ месяц',
    description: 'Для активного поиска работы, нескольких направлений и максимальной конверсии.',
    features: [
      'Все возможности тарифа Developer',
      'Безлимитная генерация резюме через Groq AI',
      'Доступ ко всем 6 премиум PDF-шаблонам',
      'Верифицированный бейдж PRO в портфолио',
      'Приоритетный рендеринг PDF (Flying Saucer)',
      'Оплата через Kaspi Pay или Stripe',
      'Экспорт профиля в JSON / Markdown',
      'Приоритетная поддержка',
    ],
    buttonText: 'Перейти на PRO',
    featured: true,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="border-b border-[#30363d] bg-[#0d1117] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#2ea043]">
            <Zap className="h-3.5 w-3.5" />
            <span>Прозрачные условия</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            Честные тарифы без скрытых платежей
          </h2>
          <p className="mt-4 text-sm text-[#8b949e] sm:text-base">
            Начните бесплатно без привязки банковской карты. Улучшайте тариф, когда выходите на активный рынок поиска работы.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-lg grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-xl p-6 sm:p-8 transition-all ${
                tier.featured
                  ? 'relative border-2 border-[#238636] bg-[#161b22] shadow-xl shadow-[#238636]/5'
                  : 'border border-[#30363d] bg-[#161b22]'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-[#238636] px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    <span>Популярный выбор</span>
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#f0f6fc]">{tier.name}</h3>
                  {tier.featured && (
                    <span className="rounded border border-[#a371f7]/30 bg-[#a371f7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c084fc]">
                      Kaspi & Stripe
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-[#f0f6fc]">
                    {tier.price}
                  </span>
                  <span className="text-sm font-medium text-[#8b949e]">{tier.period}</span>
                  {tier.localPrice && (
                    <span className="ml-1 text-xs text-[#8b949e]">({tier.localPrice})</span>
                  )}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#8b949e]">{tier.description}</p>

                <div className="mt-6 border-t border-[#30363d] pt-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-[#c9d1d9]">
                        <Check className="h-4 w-4 shrink-0 text-[#2ea043]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#30363d]">
                <a
                  href={tier.href}
                  className={`flex w-full items-center justify-center rounded-md py-2.5 text-xs font-semibold transition-all ${
                    tier.featured
                      ? 'bg-[#238636] text-white shadow-sm hover:bg-[#2ea043]'
                      : 'border border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white'
                  }`}
                >
                  {tier.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Security badge */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-[#8b949e]">
          <ShieldCheck className="h-4 w-4 text-[#2ea043]" />
          <span>Безопасная оплата через Kaspi Pay и Stripe Checkout с мгновенной активацией.</span>
        </div>
      </div>
    </section>
  );
};
