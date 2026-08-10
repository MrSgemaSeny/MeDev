import { Button } from '../../shared/ui/Button';
import { useAuthStore } from '../../entities/user/model/store';
import { api } from '../../shared/api/axios';
import { useState } from 'react';

export function PricingPage() {
  const { plan } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/billing/checkout');
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to create checkout session', error);
      alert('Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-20 px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)' }}
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--color-text-primary)' }}>Choose Your Plan</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
          Start for free to create an amazing developer profile, or upgrade to PRO for advanced AI features.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full justify-center">
        {/* FREE Plan */}
        <div
          className="flex-1 rounded-xl p-8 flex flex-col"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>FREE</h2>
          <div className="text-4xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            $0<span className="text-lg font-normal" style={{ color: 'var(--color-text-muted)' }}>/forever</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Basic Resume Builder</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>GitHub Projects Import</span>
            </li>
            <li className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <span>Advanced AI Parsing</span>
            </li>
          </ul>

          <Button
            disabled
            className="w-full opacity-50 cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-btn-hover)', color: 'var(--color-text-secondary)' }}
          >
            {plan === 'FREE' ? 'Current Plan' : 'Free Plan'}
          </Button>
        </div>

        {/* PRO Plan */}
        <div
          className="flex-1 rounded-xl p-8 flex flex-col relative"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '2px solid var(--color-accent)',
            boxShadow: '0 0 20px rgba(35,134,54,0.1)',
          }}
        >
          <div
            className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            POPULAR
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>PRO</h2>
          <div className="text-4xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            $9<span className="text-lg font-normal" style={{ color: 'var(--color-text-muted)' }}>.99/mo</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Everything in FREE</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Unlimited AI Resume Parsing</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>No Watermarks on PDF</span>
            </li>
          </ul>

          <Button
            onClick={handleUpgrade}
            disabled={loading || plan === 'PRO'}
            className="w-full text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {loading ? 'Redirecting...' : (plan === 'PRO' ? 'Current Plan' : 'Upgrade to PRO')}
          </Button>
        </div>
      </div>
    </div>
  );
}
