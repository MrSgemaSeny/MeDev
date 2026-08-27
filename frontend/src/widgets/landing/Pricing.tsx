import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Developer',
    id: 'tier-developer',
    href: '/auth/login',
    price: 'Free',
    description: 'Everything you need to build your portfolio and apply for jobs.',
    features: ['GitHub Integration', 'Public Portfolio Page', 'Up to 3 PDF Resumes', 'Basic Kanban ATS', 'Standard AI Generation'],
    buttonText: 'Get started for free',
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/auth/login',
    price: '$9',
    period: '/mo',
    description: 'Advanced AI features and custom branding for serious job seekers.',
    features: ['Unlimited PDF Resumes', 'Advanced Groq AI Models', 'Custom Domain Support', 'Premium Themes', 'Priority Support'],
    buttonText: 'Upgrade to Pro',
    featured: true,
  }
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 sm:py-32 surface border-b border-default">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-secondary">
            Start for free, upgrade when you need more power.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          {tiers.map((tier) => (
            <div key={tier.id} className={`flex flex-col justify-between rounded-xl p-8 ring-1 ring-inset ${tier.featured ? 'surface-secondary border-default ring-[#30363d] shadow-lg relative' : 'surface ring-[#30363d]'}`}>
              {tier.featured && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-[#238636] px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
                </div>
              )}
              <div>
                <h3 id={tier.id} className="text-base font-semibold leading-7 text-primary">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-primary">{tier.price}</span>
                  {tier.period && <span className="text-base font-semibold leading-7 text-secondary">{tier.period}</span>}
                </div>
                <p className="mt-6 text-base leading-7 text-secondary">{tier.description}</p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-secondary">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-[#2ea043]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={tier.href}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3.5 py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-[#238636] text-white hover:bg-[#2ea043] focus-visible:outline-[#238636]'
                    : 'bg-[#21262d] text-primary border border-default hover:bg-[#30363d] focus-visible:outline-white'
                }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
