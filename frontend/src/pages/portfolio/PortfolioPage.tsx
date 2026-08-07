import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/axios';

export function PortfolioPage() {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['portfolio', username],
    queryFn: async () => {
      const { data } = await api.get(`/portfolio/${username}`);
      return data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-zinc-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 flex-col gap-4">
        <h1 className="text-3xl font-bold text-zinc-900">404</h1>
        <p className="text-zinc-500">Profile not found or is private.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 text-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} className="w-24 h-24 rounded-full mx-auto mb-4 border border-zinc-200" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-100 mx-auto mb-4 flex items-center justify-center border border-zinc-200">
              <span className="text-2xl font-bold text-zinc-400">{profile.fullName?.charAt(0) || username?.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-zinc-900">{profile.fullName || username}</h1>
          <p className="text-zinc-500 font-medium mt-1">{profile.headline}</p>
          {profile.location && <p className="text-zinc-400 text-sm mt-2">📍 {profile.location}</p>}
          
          {profile.summary && (
            <p className="mt-6 text-zinc-600 text-sm leading-relaxed max-w-xl mx-auto">
              {profile.summary}
            </p>
          )}
        </div>

        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Experience</h2>
            <div className="space-y-6">
              {profile.experience.map((exp: any) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-zinc-200">
                  <div className="absolute w-3 h-3 bg-white border-2 border-zinc-300 rounded-full -left-[7px] top-1.5"></div>
                  <h3 className="font-semibold text-zinc-900">{exp.position}</h3>
                  <div className="text-sm text-zinc-500 font-medium mb-2">{exp.company}</div>
                  <p className="text-sm text-zinc-600 mb-2">{exp.description}</p>
                  {exp.techStack && (
                    <div className="text-xs text-zinc-400 bg-zinc-100 inline-block px-2 py-1 rounded">
                      {exp.techStack}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.filter((p: any) => p.isFeatured).map((proj: any) => (
                <div key={proj.id} className="border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition-colors">
                  <h3 className="font-semibold text-zinc-900 mb-1">{proj.name}</h3>
                  <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{proj.description}</p>
                  <div className="flex gap-2 text-xs">
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub</a>}
                    {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Live</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
