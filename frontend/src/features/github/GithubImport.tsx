import { useState } from 'react';
import { api, BASE_URL } from '../../shared/api/axios';
import { useProfile, useGenerateProfile } from '../../shared/api/hooks/useProfile';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Form';
import { CheckCircle2, DownloadCloud, RefreshCw, Star } from 'lucide-react';
import { useAuthStore } from '../../entities/user/model/store';

export const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

interface GitHubProfileDto {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  publicRepos: number;
  repos: GitHubRepoDto[];
  languageStats: Record<string, number> | null;
}

interface GitHubRepoDto {
  id: number;
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
}

type Stage = 'idle' | 'fetching' | 'selecting' | 'importing' | 'done' | 'error';

export const GithubImport = () => {
  const { data: profileData, refetch } = useProfile();
  const { mutate: generateProfile, isPending: isGenerating } = useGenerateProfile();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfileDto | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const accessToken = useAuthStore(state => state.accessToken);

  const handleFetch = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setStage('fetching');
    setError(null);
    setProfile(null);
    setSelected(new Set());
    try {
      const { data } = await api.get<GitHubProfileDto>('/github/fetch');
      setProfile(data);
      const ownedRepos = (data.repos || []).filter((r) => !r.name.includes('.github'));
      setSelected(new Set(ownedRepos.map((r) => r.id)));
      setStage('selecting');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to fetch GitHub data. You might need to connect your account first.';
      setError(typeof msg === 'string' ? msg : 'Failed to fetch GitHub data.');
      setStage('error');
    }
  };

  const toggleRepo = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (!profile) return;
    setStage('importing');
    setError(null);
    try {
      await api.post('/github/import', {
        selectedRepoIds: Array.from(selected),
      });
      await refetch();
      setStage('done');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to import GitHub data.';
      setError(typeof msg === 'string' ? msg : 'Failed to import GitHub data.');
      setStage('selecting');
    }
  };

  const reset = () => {
    setStage('idle');
    setError(null);
    setProfile(null);
    setSelected(new Set());
  };

  const handleConnect = () => {
    const baseUrl = BASE_URL.replace(/\/api\/v1\/?$/, '');
    
    if (accessToken) {
        // Send token to backend via query param to set secure HttpOnly cookie and redirect
        window.location.href = `${baseUrl}/api/v1/auth/oauth2/link/github?token=${accessToken}`;
    } else {
        window.location.href = `${baseUrl}/api/oauth2/authorization/github`;
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--color-text-primary)' }}>
          <GithubIcon />
          GitHub Integration
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Connect your GitHub account to import your repositories and activity. This is the foundation of your Developer Portfolio.
        </p>
      </div>

      {stage === 'idle' || stage === 'fetching' || stage === 'error' ? (
        <Card className="p-0 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)' }}>
          {/* Subtle gradient background element for premium feel */}
          <div className="absolute -top-24 -right-24 w-48 h-48 opacity-[0.05] rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          
          <div className="p-6">
            {profileData?.githubUsername && !error ? (
              // Connected State
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ border: '2px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-inset)' }}>
                    {profileData?.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="GitHub Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <GithubIcon className="w-7 h-7 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        @{profileData.githubUsername}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)', border: '1px solid var(--color-border-success)' }}>
                        <CheckCircle2 size={10} /> Connected
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      Your GitHub account is securely linked to MeDev.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="primary" onClick={handleFetch} disabled={stage === 'fetching'} className="flex-1 sm:flex-none">
                    <RefreshCw size={16} className={`mr-2 ${stage === 'fetching' ? 'animate-spin' : ''}`} />
                    {stage === 'fetching' ? 'Syncing...' : 'Sync Repositories'}
                  </Button>
                </div>
              </div>
            ) : (
              // Disconnected State
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    Step 1. Link Account & Fetch Data
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Authorize MeDev to read your GitHub profile. If you have already connected your account, simply fetch your data.
                  </p>
                </div>
                
                {error && (
                  <div className="rounded-md px-4 py-3 text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--color-danger-muted)', border: '1px solid var(--color-border-danger)', color: 'var(--color-danger)' }}>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={handleConnect}>
                    <GithubIcon className="mr-2" />
                    Connect GitHub
                  </Button>
                  {profileData?.githubUsername && (
                    <Button type="button" variant="primary" onClick={handleFetch} disabled={stage === 'fetching'}>
                      <DownloadCloud size={16} className="mr-2" />
                      {stage === 'fetching' ? 'Fetching...' : 'Fetch Data Anyway'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {stage === 'selecting' || stage === 'importing' || stage === 'done' ? (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Step 2. Review & Import
            </h3>
            
            {profile && (
              <div className="flex items-start gap-4 p-4 rounded-md mb-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-12 h-12 rounded-full border"
                    style={{ borderColor: 'var(--color-border-muted)' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                  >
                    {(profile.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="font-semibold text-base truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {profile.name || profile.username}
                    </div>
                    <a
                      href={`https://github.com/${profile.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: 'var(--color-link)' }}
                    >
                      @{profile.username}
                    </a>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {profile.bio}
                    </p>
                  )}
                  
                  {profile.languageStats && Object.keys(profile.languageStats).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(profile.languageStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([lang, _]) => (
                          <span
                            key={lang}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-bg-inset)',
                              color: 'var(--color-text-primary)',
                              border: '1px solid var(--color-border-default)',
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {stage !== 'done' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Select Projects to Import
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                    {selected.size} / {(profile?.repos || []).length}
                  </span>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {(profile?.repos || []).map((repo) => {
                    const checked = selected.has(repo.id);
                    return (
                      <label
                        key={repo.id}
                        className="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all duration-150"
                        style={{
                          backgroundColor: checked ? 'var(--color-accent-muted)' : 'var(--color-bg-secondary)',
                          border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-border-default)'}`,
                        }}
                      >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRepo(repo.id)}
                            className="mt-0.5 w-4 h-4 rounded"
                            style={{ accentColor: 'var(--color-accent)', border: '1px solid var(--color-border-default)' }}
                          />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {repo.name}
                            </span>
                            {repo.language && (
                              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                {repo.language}
                              </span>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                              {repo.description}
                            </p>
                          )}
                          <div className="flex gap-4 text-xs mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazersCount}</span>
                            <span className="flex items-center gap-1">⑂ {repo.forksCount}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {stage === 'done' && (
              <div
                className="rounded-md px-4 py-3 text-sm flex items-start gap-2 mb-4"
                style={{
                  backgroundColor: 'var(--color-accent-muted)',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <span className="block font-medium mb-0.5">Import Successful!</span>
                  <span className="opacity-90">Your profile, projects and skills have been updated with data from GitHub.</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border-muted)' }}>
              {stage !== 'done' && (
                <Button variant="primary" onClick={handleImport} disabled={stage === 'importing' || selected.size === 0}>
                  {stage === 'importing' ? 'Importing...' : `Import ${selected.size} Projects`}
                </Button>
              )}
              {stage === 'done' && (
                <Button variant="primary" onClick={() => {
                  generateProfile(undefined, {
                    onSuccess: () => {
                      reset();
                    }
                  });
                }} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Enhance with AI'}
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                {stage === 'done' ? 'Close' : 'Cancel'}
              </Button>
            </div>

            {error && (
              <div
                className="mt-4 rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                }}
              >
                {error}
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};
