import { Link } from 'react-router-dom';
import { useUpsellStore } from '../../entities/user/model/upsellStore';
import { Button } from './Button';

export const UpsellModal = () => {
  const { isOpen, closeUpsell } = useUpsellStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-sm w-full p-6 text-center shadow-2xl">
        <div className="mb-4 text-3xl">🚀</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          You've reached your daily AI limit
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Upgrade to Pro to unlock 100 requests per day, all resume templates, and remove watermarks.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/billing" onClick={closeUpsell}>
            <Button variant="primary" className="w-full">
              Upgrade to Pro
            </Button>
          </Link>
          <Button variant="secondary" className="w-full" onClick={closeUpsell}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};
