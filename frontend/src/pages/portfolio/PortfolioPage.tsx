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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex h-full items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 flex-col gap-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-4">
          <h1 className="text-4xl font-black text-red-600 dark:text-red-500">404</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Profile not found or is private.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 sm:p-14 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-200/50 dark:bg-slate-800/50 blur-3xl rounded-full translate-y-[-50%] group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-32 h-32 rounded-3xl mx-auto mb-6 shadow-2xl shadow-slate-300/50 dark:shadow-black/50 border-4 border-white dark:border-slate-800 object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 mx-auto mb-6 flex items-center justify-center shadow-xl shadow-slate-500/10 dark:shadow-black/50 border-4 border-white dark:border-slate-800">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{profile.fullName?.charAt(0) || username?.charAt(0)}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{profile.fullName || username}</h1>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{profile.headline}</p>
            {profile.location && <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3 flex items-center justify-center gap-1">📍 {profile.location}</p>}
            
            {profile.summary && (
              <p className="mt-8 text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
                {profile.summary}
              </p>
            )}
          </div>
        </div>

        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60 relative">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-12 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">💼</div>
              Experience
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
              {profile.experience.map((exp: any) => (
                <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:border-slate-300 dark:group-hover:border-slate-600 text-slate-500 group-hover:text-white dark:group-hover:text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300 absolute md:relative left-0 md:left-auto"></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 group-hover:shadow-lg group-hover:border-slate-500/30 dark:group-hover:border-slate-500/30 transition-all duration-300 ml-16 md:ml-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{exp.position}</h3>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-3">{exp.company}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{exp.description}</p>
                    {exp.techStack && (
                      <div className="flex flex-wrap gap-2">
                        {exp.techStack.split(',').map((tech: string, i: number) => (
                          <span key={i} className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">🚀</div>
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.projects.filter((p: any) => p.isFeatured).map((proj: any) => (
                <div key={proj.id} className="group border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-500/10 dark:hover:shadow-none hover:border-slate-500/30 dark:hover:border-slate-500/30 transition-all duration-300 flex flex-col h-full">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-slate-950 dark:group-hover:text-slate-300 transition-colors">{proj.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">{proj.description}</p>
                  <div className="flex gap-4 text-sm font-semibold mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Live Demo
                      </a>
                    )}
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
