import { useProfile } from '../../../shared/api/hooks/useProfile';
import { GithubImport } from '../../github/GithubImport';

export const GithubSection = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white">GitHub Integration</h2>
      
      <GithubImport currentGithubUrl={profile?.githubUrl} />
      
      {profile?.githubUrl && (
        <div className="mt-8 bg-gray-900 border border-gray-800 p-6 rounded-md">
          <h3 className="text-lg font-bold text-white mb-4">Repository Selection</h3>
          <p className="text-sm text-gray-400 mb-4">
            (Feature coming soon: Select which repositories to display on your portfolio)
          </p>
        </div>
      )}
    </div>
  );
};
