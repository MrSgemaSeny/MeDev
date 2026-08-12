import { Link } from 'react-router-dom';
import { useQuota } from '../hooks/useQuota';
import { Zap } from 'lucide-react';

export const QuotaWidget = () => {
  const { data: quota, isLoading, isError } = useQuota();

  if (isLoading || isError || !quota) return null;

  const { remainingRequests, dailyLimit } = quota;
  const isLow = remainingRequests <= 2;

  return (
    <Link to="/billing" title={`AI Quota: ${remainingRequests} / ${dailyLimit}`} className={`flex items-center h-9 px-3 mx-1 mb-2 rounded-md transition-colors ${isLow ? 'bg-[var(--color-danger-hover)] text-white' : 'surface-tertiary text-primary hover:bg-[var(--color-btn-hover)]'}`}>
      <span className="w-4 text-center shrink-0 flex items-center justify-center"><Zap size={14} /></span>
      <span className="ml-3 text-sm font-medium whitespace-nowrap group-hover:opacity-100 opacity-0 transition-opacity duration-150">
        AI: {remainingRequests} / {dailyLimit}
      </span>
    </Link>
  );
};
