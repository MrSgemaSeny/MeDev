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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center py-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-white mb-4">Choose Your Plan</h1>
        <p className="text-[#8b949e] text-lg max-w-xl mx-auto">
          Start for free to create an amazing developer profile, or upgrade to PRO for advanced AI features.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full justify-center">
        {/* FREE Plan */}
        <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-2">FREE</h2>
          <div className="text-4xl font-extrabold text-white mb-6">$0<span className="text-lg text-[#8b949e] font-normal">/forever</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Basic Resume Builder</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>GitHub Projects Import</span>
            </li>
            <li className="flex items-center gap-3 text-[#8b949e]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <span>Advanced AI Parsing</span>
            </li>
          </ul>

          <Button disabled className="w-full bg-[#30363d] text-[#c9d1d9] hover:bg-[#30363d] opacity-50 cursor-not-allowed">
            {plan === 'FREE' ? 'Current Plan' : 'Free Plan'}
          </Button>
        </div>

        {/* PRO Plan */}
        <div className="flex-1 bg-[#161b22] border-2 border-[#238636] rounded-xl p-8 flex flex-col relative shadow-[0_0_20px_rgba(35,134,54,0.1)]">
          <div className="absolute top-0 right-0 bg-[#238636] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">POPULAR</div>
          <h2 className="text-2xl font-bold text-white mb-2">PRO</h2>
          <div className="text-4xl font-extrabold text-white mb-6">$9<span className="text-lg text-[#8b949e] font-normal">.99/mo</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Everything in FREE</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium text-white">Unlimited AI Resume Parsing</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium text-white">No Watermarks on PDF</span>
            </li>
          </ul>

          <Button 
            onClick={handleUpgrade} 
            disabled={loading || plan === 'PRO'}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white"
          >
            {loading ? 'Redirecting...' : (plan === 'PRO' ? 'Current Plan' : 'Upgrade to PRO')}
          </Button>
        </div>
      </div>
    </div>
  );
}
