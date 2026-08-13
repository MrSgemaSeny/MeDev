import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Form';
import { useKaspiCheckout } from '../../features/billing/hooks/useBilling';
import { X, Check } from 'lucide-react';

export const PricingPage = () => {
  const { checkoutKaspi, isPending: isKaspiPending } = useKaspiCheckout();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  return (
    <>
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
            <div className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Upgrade to PRO</div>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="p-2 rounded-md transition-colors" 
              style={{ color: 'var(--color-text-muted)' }} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Выберите цикл оплаты</h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                Экономьте до 25% при оплате за несколько месяцев вперед. Все возможности PRO включены в каждый план.
              </p>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1 Month */}
              <Card className="p-8 border flex flex-col cursor-default transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-inset)' }}>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>1 месяц</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>$8.99</span>
                    <span className="text-lg pb-1" style={{ color: 'var(--color-text-muted)' }}>/мес</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Базовая цена</p>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Безлимитный AI</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Все шаблоны резюме</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Экспорт в README</li>
                </ul>

                <Button 
                  variant="secondary" 
                  className="w-full text-base py-3" 
                  onClick={() => checkoutKaspi(1)} 
                  disabled={isKaspiPending}
                >
                  {isKaspiPending ? 'Загрузка...' : 'Выбрать на 1 месяц'}
                </Button>
              </Card>

              {/* 3 Months */}
              <Card className="p-8 border flex flex-col cursor-default transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-inset)' }}>
                <div className="absolute top-0 right-0 px-4 py-1.5 text-xs font-semibold rounded-bl-lg rounded-tr-md" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border-default)', borderLeft: '1px solid var(--color-border-default)' }}>
                  Выгода 7%
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>3 месяца</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>$24.99</span>
                    <span className="text-lg pb-1" style={{ color: 'var(--color-text-muted)' }}>за 3 мес</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>≈ $8.33 в месяц</p>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Все возможности PRO</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Оптимальный баланс</li>
                </ul>

                <Button 
                  variant="secondary" 
                  className="w-full text-base py-3" 
                  onClick={() => checkoutKaspi(3)} 
                  disabled={isKaspiPending}
                >
                  {isKaspiPending ? 'Загрузка...' : 'Выбрать на 3 месяца'}
                </Button>
              </Card>

              {/* 6 Months */}
              <Card className="p-8 border-2 flex flex-col cursor-default transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative" style={{ borderColor: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-inset)' }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-bold rounded-full shadow-md" style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)' }}>
                  Самый выгодный
                </div>
                <div className="mb-8 mt-2">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>6 месяцев</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>$39.99</span>
                    <span className="text-lg pb-1" style={{ color: 'var(--color-text-muted)' }}>за 6 мес</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>≈ $6.66 в месяц (скидка 25%)</p>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Все возможности PRO</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-primary)' }}/> Максимальная экономия</li>
                </ul>

                <Button 
                  variant="primary" 
                  className="w-full text-base py-3 font-semibold" 
                  onClick={() => checkoutKaspi(6)} 
                  disabled={isKaspiPending}
                >
                  {isKaspiPending ? 'Загрузка...' : 'Выбрать на 6 месяцев'}
                </Button>
              </Card>
            </div>
            
            <div className="mt-12 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Безопасная оплата через Kaspi. Подписка не продлевается автоматически.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
