import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Form';
import { useCheckout, useKaspiCheckout } from '../../features/billing/hooks/useBilling';

export const PricingPage = () => {
  const { checkout, isPending: isStripePending } = useCheckout();
  const { checkoutKaspi, isPending: isKaspiPending } = useKaspiCheckout();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Pricing
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Start free. Upgrade when you need more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 md:col-span-1 border border-border flex flex-col" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-inset)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Free
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для старта.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $0 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ 0₸</span>
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> 10 AI запросов в день</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> 1 шаблон резюме</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Публичное портфолио</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✗</span> Без водяных знаков</li>
          </ul>
          <Button variant="secondary" className="w-full mt-auto" disabled>Текущий план</Button>
        </Card>

        <Card className="p-6 md:col-span-1 border flex flex-col" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PRO: Старт</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-inset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>1 мес</span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для активного поиска.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $8.99 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ 15 000₸</span>
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Безлимит AI</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Все шаблоны резюме</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Кастомные секции</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> GitHub README экспорт</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto">
            <Button variant="primary" className="w-full font-medium" onClick={() => checkoutKaspi(1)} disabled={isKaspiPending}>
              {isKaspiPending ? 'Загрузка...' : 'Оплатить Kaspi (₸)'}
            </Button>
            <Button variant="secondary" className="w-full font-medium" onClick={checkout} disabled={isStripePending}>
              {isStripePending ? 'Загрузка...' : 'Оплатить Stripe ($)'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:col-span-1 border flex flex-col" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PRO: Оптима</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-inset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>3 мес</span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Баланс и выгода.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $24.99 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ 40 000₸</span>
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Всё из PRO: Старт</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Приоритетная поддержка</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Ранний доступ к фичам</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto">
            <Button variant="primary" className="w-full font-medium" onClick={() => checkoutKaspi(3)} disabled={isKaspiPending}>
              {isKaspiPending ? 'Загрузка...' : 'Оплатить Kaspi (₸)'}
            </Button>
            <Button variant="secondary" className="w-full font-medium" onClick={checkout} disabled={isStripePending}>
              {isStripePending ? 'Загрузка...' : 'Оплатить Stripe ($)'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:col-span-1 border flex flex-col" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PRO: Ультра</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)20', color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}>6 мес</span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для профи.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $39.99 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ 75 000₸</span>
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Всё из PRO: Оптима</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Личный AI-ассистент</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Закрытый чат</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto">
             <Button variant="primary" className="w-full font-medium" onClick={() => checkoutKaspi(6)} disabled={isKaspiPending}>
              {isKaspiPending ? 'Загрузка...' : 'Оплатить Kaspi (₸)'}
            </Button>
            <Button variant="secondary" className="w-full font-medium" onClick={checkout} disabled={isStripePending}>
              {isStripePending ? 'Загрузка...' : 'Оплатить Stripe ($)'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
