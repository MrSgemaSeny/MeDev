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
        <Card className="p-6 md:col-span-1">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Free
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для старта.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            0₸
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 10 AI запросов в день</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 шаблон резюме</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Публичное портфолио</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Без водяных знаков</li>
          </ul>
          <Button variant="secondary" className="w-full" disabled>Текущий план</Button>
        </Card>

        <Card className="p-6 md:col-span-1 border border-accent relative" style={{ borderColor: 'var(--color-accent)' }}>
          <div className="absolute top-0 right-0 bg-[#238636] text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md font-medium">
            1 МЕСЯЦ
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            PRO: Старт
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Для активного поиска работы.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            15 000₸<span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>/мес</span>
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Безлимит AI</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Все шаблоны резюме</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Кастомные секции</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Экспорт в GitHub README</li>
          </ul>
          <Button variant="primary" className="w-full font-bold" onClick={() => checkoutKaspi(1)} disabled={isKaspiPending}>
            {isKaspiPending ? 'Загрузка...' : 'Kaspi Pay'}
          </Button>
        </Card>

        <Card className="p-6 md:col-span-1 border border-accent relative" style={{ borderColor: 'var(--color-accent)' }}>
          <div className="absolute top-0 right-0 bg-[#f85a40] text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md font-medium">
            3 МЕСЯЦА
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            PRO: Оптима
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Скидка 11%. Баланс и выгода.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            40 000₸
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Всё из PRO: Старт</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Приоритетная поддержка</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Ранний доступ к фичам</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button variant="primary" className="w-full font-bold bg-[#f85a40] text-white hover:bg-[#e04830] border-none" onClick={() => checkoutKaspi(3)} disabled={isKaspiPending}>
              {isKaspiPending ? 'Загрузка...' : 'Kaspi Pay'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:col-span-1 border border-accent relative" style={{ borderColor: 'var(--color-accent)', boxShadow: '0 0 15px rgba(35, 134, 54, 0.2)' }}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#238636] text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
            ВЫГОДНО
          </div>
          <div className="absolute top-0 right-0 bg-[#d29922] text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md font-medium">
            6 МЕСЯЦЕВ
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            PRO: Ультра
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Скидка 16%. Для профи.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            75 000₸
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Всё из PRO: Оптима</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Личный AI-ассистент</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Закрытый чат</li>
          </ul>
          <div className="flex flex-col gap-2 mt-auto pt-4">
             <Button variant="primary" className="w-full font-bold bg-[#d29922] text-white hover:bg-[#b07d15] border-none" onClick={() => checkoutKaspi(6)} disabled={isKaspiPending}>
              {isKaspiPending ? 'Загрузка...' : 'Kaspi Pay'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <p>Иностранные карты? <button className="underline hover:text-white" onClick={checkout} disabled={isStripePending}>Оплатить через Stripe (USD)</button></p>
      </div>
    </div>
  );
};
