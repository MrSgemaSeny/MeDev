import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { XCircle } from 'lucide-react';

export function CancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-[#f85149]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-[#8b949e] mb-8">
          Your checkout session was cancelled. No charges were made. You can try upgrading again whenever you're ready.
        </p>
        <Button onClick={() => navigate('/pricing')} className="w-full bg-[#30363d] text-white hover:bg-[#8b949e]">
          Return to Pricing
        </Button>
      </div>
    </div>
  );
}
