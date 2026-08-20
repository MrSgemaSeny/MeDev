import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { api } from '../../shared/api/axios';
import type { ProfileDto } from '../../entities/profile/model/types';
import { Card } from '../../shared/ui/Form';
import { ProfileSkeleton } from '../../shared/ui/Skeleton';

export const PortfolioView = () => {
  const { username } = useParams<{ username: string }>();
  const [isCopied, setIsCopied] = useState(false);

  const { data: profile, isLoading, error } = useQuery<ProfileDto>({
    queryKey: ['portfolio', username],
    queryFn: async () => { const { data } = await api.get(`/portfolio/${username}`); return data; },
    enabled: !!username,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Portfolio link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>404</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Developer portfolio not found or private.</p>
      </div>
    );
  }

  const structuredData = profile ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.fullName || username,
    "jobTitle": profile.headline,
    "url": `https://medev.app/${username}`,
    "sameAs": [
      profile.githubUsername ? `https://github.com/${profile.githubUsername}` : null,
      profile.linkedin,
      profile.website
    ].filter(Boolean)
  } : null;

  return (
    <>
      <Helmet>
        <title>{profile.fullName || username} — Developer Profile & Portfolio</title>
        <meta name="description" content={profile.summary || profile.headline || `${profile.fullName || username}'s verified developer portfolio on MeDev`} />
        <meta property="og:title" content={`${profile.fullName || username} — Portfolio`} />
        <meta property="og:description" content={profile.summary || profile.headline || `${profile.fullName || username}'s developer portfolio`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        {profile.avatarUrl && <meta property="og:image" content={profile.avatarUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.fullName || username} — Portfolio`} />
        <meta name="twitter:description" content={profile.summary || profile.headline || 'Developer Portfolio'} />
        {profile.avatarUrl && <meta name="twitter:image" content={profile.avatarUrl} />}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      <div className="max-w-4xl mx-auto py-10 px-6" style={{ color: 'var(--color-text-primary)' }}>
        {/* Profile Header */}
        <header className="mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName || username}
              className="w-24 h-24 rounded-full flex-shrink-0 object-cover"
              style={{ border: '2px solid var(--color-border-default)' }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-semibold select-none"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)', border: '1px solid var(--color-border-default)' }}
            >
              {profile.fullName?.charAt(0) || username?.charAt(0)?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {profile.fullName || username}
              </h1>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors self-center md:self-auto cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {isCopied ? 'Copied' : 'Share Profile'}
              </button>
            </div>

            {profile.headline && (
              <p className="text-base mb-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {profile.headline}
              </p>
            )}

            {profile.summary && (
              <p className="text-sm leading-relaxed mb-4 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                {profile.summary}
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {profile.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[var(--color-link)]">
                  🌐 Website
                </a>
              )}
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[var(--color-link)]">
                  🐙 GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[var(--color-link)]">
                  💼 LinkedIn
                </a>
              )}
              {profile.telegram && (
                <a href={`https://t.me/${profile.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[var(--color-link)]">
                  ✈️ Telegram
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-10">
            {/* Experience Section */}
            {profile.experience && profile.experience.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-5 border-l-2" style={{ borderColor: 'var(--color-border-default)' }}>
                      <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5" style={{ backgroundColor: 'var(--color-accent)' }} />
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{exp.position}</h3>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-link)' }}>{exp.company}</div>
                      <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        {exp.startDate} — {exp.isCurrent ? 'Present' : (exp.endDate || 'Present')}
                      </div>
                      {exp.description && <p className="text-sm whitespace-pre-wrap mb-2" style={{ color: 'var(--color-text-secondary)' }}>{exp.description}</p>}
                      {exp.techStack && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {exp.techStack.split(',').map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-[11px] rounded font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {profile.projects && profile.projects.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Projects</h2>
                <div className="grid grid-cols-1 gap-3">
                  {profile.projects.map((proj) => (
                    <Card key={proj.id} className="p-4 transition-all hover:border-[var(--color-border-muted)]">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {proj.githubUrl ? (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">
                              {proj.name}
                            </a>
                          ) : proj.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {proj.stars != null && proj.stars > 0 && (
                            <span className="text-xs flex items-center gap-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                              ★ {proj.stars}
                            </span>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded font-medium hover:underline" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                      </div>
                      {proj.description && (
                        <p className="text-sm whitespace-pre-wrap mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {proj.description}
                        </p>
                      )}
                      {proj.techStack && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.techStack.split(',').map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-[11px] rounded font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-default)' }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card className="p-4">
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Skills & Technologies</h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <Card className="p-4">
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Education</h2>
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{edu.degree}</h3>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{edu.institution}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {edu.startDate} — {edu.isCurrent ? 'Present' : (edu.endDate || 'Present')}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <Card className="p-4">
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Languages</h2>
                <div className="space-y-1.5">
                  {profile.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center text-sm">
                      <span style={{ color: 'var(--color-text-secondary)' }}>{lang.name}</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* GitHub Activity */}
        {profile.githubUsername && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>GitHub Contributions</h2>
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs hover:underline"
                style={{ color: 'var(--color-link)' }}
              >
                @{profile.githubUsername} on GitHub ↗
              </a>
            </div>
            <Card className="p-4 overflow-x-auto">
              <img
                src={`https://ghchart.rshah.org/238636/${profile.githubUsername}`}
                alt={`${profile.githubUsername}'s GitHub chart`}
                className="w-full min-w-[600px] select-none pointer-events-none"
              />
            </Card>
          </div>
        )}

        {/* Footer branding */}
        <footer className="mt-16 pt-6 border-t text-center text-xs" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}>
          Powered by <a href="https://medev.app" className="font-semibold hover:underline" style={{ color: 'var(--color-text-primary)' }}>MeDev</a> — The Developer Profile Platform
        </footer>
      </div>
    </>
  );
};

