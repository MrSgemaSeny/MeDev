import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Form';
import { useCheckout } from '../../features/billing/hooks/useBilling';

export const PricingPage = () => {
  const { checkout, isPending } = useCheckout();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Pricing
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Start free. Upgrade when you need more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Free
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            For getting started.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $0
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li>10 AI requests per day</li>
            <li>1 resume template</li>
            <li>Public portfolio page</li>
            <li>MeDev badge on portfolio</li>
          </ul>
          <Button variant="secondary" className="w-full" disabled>Current plan</Button>
        </Card>

        <Card className="p-6" style={{ borderColor: 'var(--color-accent)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Pro
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            For active job seekers.
          </p>
          <div className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            $9<span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>/mo</span>
          </div>
          <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <li>100 AI requests per day</li>
            <li>All resume templates</li>
            <li>Custom resume sections</li>
            <li>No watermark on PDFs</li>
            <li>GitHub README export</li>
          </ul>
          <Button variant="primary" className="w-full" onClick={checkout} disabled={isPending}>
            {isPending ? 'Redirecting...' : 'Upgrade to Pro'}
          </Button>
        </Card>
      </div>
    </div>
  );
};
