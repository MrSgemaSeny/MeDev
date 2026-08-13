import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../shared/api/axios';
import type { ProfileDto } from '../../entities/profile/model/types';
import { Card } from '../../shared/ui/Form';

export const PortfolioView = () => {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading, error } = useQuery<ProfileDto>({
    queryKey: ['portfolio', username],
    queryFn: async () => { const { data } = await api.get(`/portfolio/${username}`); return data; },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <span className="inline-block animate-spin rounded-full" style={{ width: 24, height: 24, border: '2px solid var(--color-border-default)', borderTopColor: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>404</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Developer portfolio not found.</p>
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
        <title>{profile.fullName || username} | Portfolio</title>
        <meta name="description" content={profile.summary || profile.headline || 'Developer Portfolio'} />
        <meta property="og:title" content={`${profile.fullName || username} | Portfolio`} />
        <meta property="og:description" content={profile.summary || profile.headline || 'Developer Portfolio'} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://medev.app/${username}`} />
        {profile.avatarUrl && <meta property="og:image" content={profile.avatarUrl} />}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      <div className="max-w-4xl mx-auto py-10 px-6" style={{ color: 'var(--color-text-primary)' }}>
      <header className="mb-10 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div
          className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-semibold"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)', border: '1px solid var(--color-border-default)' }}
        >
          {profile.fullName?.charAt(0) || username?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{profile.fullName || username}</h1>
          {profile.headline && <p className="text-base mb-3" style={{ color: 'var(--color-text-secondary)' }}>{profile.headline}</p>}
          {profile.summary && <p className="text-sm leading-relaxed mb-4 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>{profile.summary}</p>}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {profile.location && <span>{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">Website</a>}
            {profile.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">GitHub</a>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-10">
          {profile.experience && profile.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-5 border-l-2" style={{ borderColor: 'var(--color-border-default)' }}>
                    <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5" style={{ backgroundColor: 'var(--color-accent)' }} />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{exp.position}</h3>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-link)' }}>{exp.company}</div>
                    <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</div>
                    {exp.description && <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {profile.projects && profile.projects.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Projects</h2>
              <div className="grid grid-cols-1 gap-3">
                {profile.projects.map((proj) => (
                  <Card key={proj.id} className="p-4">
                    <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {proj.githubUrl ? <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">{proj.name}</a> : proj.name}
                    </h3>
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-sm hover:underline block mb-2" style={{ color: 'var(--color-link)' }}>{proj.githubUrl}</a>}
                    {proj.description && <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{proj.description}</p>}
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {profile.skills && profile.skills.length > 0 && (
            <Card className="p-4">
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span key={skill.id} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-default)' }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
          {profile.education && profile.education.length > 0 && (
            <Card className="p-4">
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Education</h2>
              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{edu.degree}</h3>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{edu.institution}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <Card className="p-4">
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Languages</h2>
              <div className="space-y-1.5">
                {profile.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{lang.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {profile.githubUsername && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>GitHub Activity</h2>
          <Card className="p-4 overflow-x-auto">
            <img 
              src={`https://ghchart.rshah.org/238636/${profile.githubUsername}`} 
              alt={`${profile.githubUsername}'s GitHub chart`} 
              className="w-full min-w-[600px] select-none pointer-events-none"
            />
          </Card>
        </div>
      )}
    </div>
    </>
  );
};
