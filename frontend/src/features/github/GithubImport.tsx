import { useState } from 'react';
import { api } from '../../shared/api/axios';
import { useProfile } from '../../shared/api/hooks/useProfile';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Card } from '../../shared/ui/Form';

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
  const { refetch } = useProfile();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfileDto | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

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
        'Failed to fetch GitHub data. Check your token and try again.';
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

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        GitHub Integration
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Connect GitHub with a Personal Access Token (PAT) to import your profile, repositories and
        language stats. The token is used only for this import and is not stored.
      </p>

      {stage === 'idle' || stage === 'fetching' || stage === 'error' ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                GitHub Connection
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Authorize MeDev to read your GitHub profile and repositories. We only request read access to public data.
              </p>
            </div>
            {error && (
              <div
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                }}
              >
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/github'}>
                Connect GitHub
              </Button>
              <Button type="button" variant="primary" onClick={handleFetch} disabled={stage === 'fetching'}>
                {stage === 'fetching' ? 'Fetching...' : 'Fetch GitHub data'}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {stage === 'selecting' || stage === 'importing' || stage === 'done' ? (
        <div className="space-y-4">
          {profile && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                  >
                    {(profile.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {profile.name || profile.username}
                  </div>
                  <a
                    href={`https://github.com/${profile.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm"
                    style={{ color: 'var(--color-link)' }}
                  >
                    @{profile.username} · {profile.publicRepos} repos
                  </a>
                </div>
              </div>
              {profile.bio && (
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {profile.bio}
                </p>
              )}
              {profile.languageStats && Object.keys(profile.languageStats).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(profile.languageStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([lang, count]) => (
                      <span
                        key={lang}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: 'var(--color-bg-tertiary)',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-default)',
                        }}
                      >
                        {lang} · {count}
                      </span>
                    ))}
                </div>
              )}
            </Card>
          )}

          {stage !== 'done' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Select repositories to import as projects
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {selected.size} of {(profile?.repos || []).length} selected
                </span>
              </div>
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {(profile?.repos || []).map((repo) => {
                  const checked = selected.has(repo.id);
                  return (
                    <label
                      key={repo.id}
                      className="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors duration-100"
                      style={{
                        backgroundColor: checked ? 'var(--color-accent-muted)' : 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-default)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRepo(repo.id)}
                        className="mt-0.5"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {repo.name}
                          </span>
                          {repo.language && (
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {repo.description}
                          </p>
                        )}
                        <div className="flex gap-3 text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          <span>{repo.stargazersCount} stars</span>
                          <span>{repo.forksCount} forks</span>
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
              className="rounded-md px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--color-accent-muted)',
                border: '1px solid var(--color-accent-muted)',
                color: 'var(--color-accent)',
              }}
            >
              GitHub data imported successfully. Your profile, projects and skills have been updated.
            </div>
          )}

          <div className="flex gap-2">
            {stage !== 'done' && (
              <Button variant="primary" onClick={handleImport} disabled={stage === 'importing' || selected.size === 0}>
                {stage === 'importing' ? 'Importing...' : `Import ${selected.size} repos`}
              </Button>
            )}
            <Button variant="outline" onClick={reset}>
              {stage === 'done' ? 'Done' : 'Cancel'}
            </Button>
          </div>

          {error && (
            <div
              className="rounded-md px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
              }}
            >
              {error}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
