import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { CheckCircle2 } from 'lucide-react';

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const setPlan = useAuthStore((state) => state.setPlan);

  useEffect(() => {
    // В реальном приложении лучше сделать GET /api/v1/users/me,
    // но для скорости (поскольку webhook уже обновил базу) обновим состояние локально.
    if (sessionId) {
      setPlan('PRO');
    }
  }, [sessionId, setPlan]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-[#238636]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-[#8b949e] mb-8">
          Thank you for upgrading to PRO. Your account has been updated and you now have access to all premium features.
        </p>
        <Button onClick={() => navigate('/builder')} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white">
          Go to Resume Builder
        </Button>
      </div>
    </div>
  );
}
