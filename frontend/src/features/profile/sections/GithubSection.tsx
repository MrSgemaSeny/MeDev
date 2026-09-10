import { GithubImport } from '../../github/GithubImport';
import { useProfile } from '../../../entities/profile/api/hooks';

export const GithubSection = () => {
  const { isLoading } = useProfile();

  if (isLoading) return <div className="text-secondary">Loading...</div>;

  return <GithubImport />;
};
