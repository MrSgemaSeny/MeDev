import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { useKaspiCheckout } from '../../features/billing/hooks/useBilling';

export const PricingPage = () => {
  const { checkoutKaspi, isPending: isKaspiPending } = useKaspiCheckout();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Pricing
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Start free. Upgrade when you need more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free Plan */}
        <Card className="p-6 border flex flex-col" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-inset)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Free
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для старта.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $0
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> 10 AI запросов в день</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> 1 шаблон резюме</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Публичное портфолио</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✗</span> Без водяных знаков</li>
          </ul>
          <Button variant="secondary" className="w-full mt-auto" disabled>Текущий план</Button>
        </Card>

        {/* PRO Plan */}
        <Card className="p-6 border flex flex-col" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PRO</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-inset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>От 1 мес</span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для активного поиска и профи.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $8.99 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ мес</span>
          </div>
          <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Безлимит AI</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Все шаблоны резюме</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Кастомные секции</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> GitHub README экспорт</li>
            <li className="flex items-center gap-2"><span style={{ color: 'var(--color-text-muted)' }}>✓</span> Приоритетная поддержка</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto">
            <Button variant="primary" className="w-full font-medium" onClick={() => setIsModalOpen(true)}>
              Upgrade to PRO
            </Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Выберите длительность подписки">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="p-4 border flex flex-col hover:border-gray-500 transition-colors" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>1 месяц</h3>
            <div className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>$8.99</div>
            <Button 
              variant="primary" 
              className="w-full mt-auto" 
              onClick={() => checkoutKaspi(1)} 
              disabled={isKaspiPending}
            >
              {isKaspiPending ? 'Загрузка...' : 'Оплатить'}
            </Button>
          </Card>
          
          <Card className="p-4 border flex flex-col hover:border-gray-500 transition-colors" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>3 месяца</h3>
            <div className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>$24.99</div>
            <Button 
              variant="primary" 
              className="w-full mt-auto" 
              onClick={() => checkoutKaspi(3)} 
              disabled={isKaspiPending}
            >
              {isKaspiPending ? 'Загрузка...' : 'Оплатить'}
            </Button>
          </Card>

          <Card className="p-4 border flex flex-col hover:border-gray-500 transition-colors relative" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: 'var(--color-bg-inset)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
              Выгодно
            </span>
            <h3 className="font-semibold text-lg mb-2 mt-2" style={{ color: 'var(--color-text-primary)' }}>6 месяцев</h3>
            <div className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>$39.99</div>
            <Button 
              variant="primary" 
              className="w-full mt-auto" 
              onClick={() => checkoutKaspi(6)} 
              disabled={isKaspiPending}
            >
              {isKaspiPending ? 'Загрузка...' : 'Оплатить'}
            </Button>
          </Card>
        </div>
      </Modal>
    </div>
  );
};
