import { GithubImport } from '../../github/GithubImport';
import { useProfile } from '../../../shared/api/hooks/useProfile';

export const GithubSection = () => {
  const { isLoading } = useProfile();

  if (isLoading) return <div className="text-secondary">Loading...</div>;

  return <GithubImport />;
};
