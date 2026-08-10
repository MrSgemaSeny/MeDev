import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../shared/api/axios';
import type { ProfileDto } from '../../entities/profile/model/types';

export const PortfolioView = () => {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading, error } = useQuery<ProfileDto>({
    queryKey: ['portfolio', username],
    queryFn: async () => {
      const { data } = await api.get(`/portfolio/${username}`);
      return data;
    },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400">Developer portfolio not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header Profile */}
      <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 bg-gray-800 rounded-full flex-shrink-0 flex items-center justify-center text-4xl font-bold text-emerald-500 border-4 border-gray-900 shadow-xl">
          {profile.fullName?.charAt(0) || username?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{profile.fullName || username}</h1>
          <p className="text-xl text-emerald-400 mb-4 font-medium">{profile.headline}</p>
          <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">{profile.summary}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                🔗 {profile.website}
              </a>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                🐙 GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                💼 LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-12">
          {profile.experience && profile.experience.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-emerald-500 text-sm">💼</span>
                Experience
              </h2>
              <div className="space-y-6">
                {profile.experience.map((exp: any) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-gray-800">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-2"></div>
                    <h3 className="text-lg font-bold text-white">{exp.position}</h3>
                    <div className="text-emerald-400 font-medium mb-1">{exp.company}</div>
                    <div className="text-xs text-gray-500 mb-3">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                    {exp.description && <p className="text-gray-400 text-sm whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.projects && profile.projects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-emerald-500 text-sm">🚀</span>
                Projects
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {profile.projects.map((proj: any) => (
                  <div key={proj.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-emerald-500/50 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-1">{proj.name}</h3>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm hover:underline block mb-2">
                        {proj.url}
                      </a>
                    )}
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          {profile.skills && profile.skills.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any) => (
                  <span key={skill.id} className="bg-gray-800 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-gray-700">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile.education && profile.education.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Education</h2>
              <div className="space-y-4">
                {profile.education.map((edu: any) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-white text-sm">{edu.degree}</h3>
                    <div className="text-gray-400 text-sm">{edu.institution}</div>
                    <div className="text-xs text-gray-500 mt-1">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Languages</h2>
              <div className="space-y-2">
                {profile.languages.map((lang: any) => (
                  <div key={lang.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{lang.name}</span>
                    <span className="text-emerald-500 font-medium">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
