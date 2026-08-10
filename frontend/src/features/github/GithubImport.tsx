import React, { useState } from 'react';
import { useUpdateProfile } from '../../shared/api/hooks/useProfile';
import { api } from '../../shared/api/axios';

export const GithubImport = ({ currentGithubUrl }: { currentGithubUrl?: string }) => {
  const [username, setUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setIsSyncing(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Assuming a generic backend sync endpoint
      await api.post(`/github/sync`, { username });
      
      // Update profile to reflect the new githubUrl
      await updateProfile.mutateAsync({ githubUrl: `https://github.com/${username}` });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync GitHub data.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-md max-w-md">
      <h3 className="text-lg font-bold text-white mb-2">Sync GitHub Profile</h3>
      <p className="text-sm text-gray-400 mb-4">
        Enter your GitHub username to import your repositories and activity stats.
      </p>
      
      <form onSubmit={handleSync} className="space-y-3">
        <div>
          <input 
            type="text" 
            placeholder="GitHub Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSyncing || !username}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      {success && <p className="text-emerald-400 text-sm mt-3">Successfully synced GitHub data!</p>}
      
      {currentGithubUrl && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Currently connected: <a href={currentGithubUrl} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">{currentGithubUrl}</a>
        </p>
      )}
    </div>
  );
};
