import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { Link } from 'react-router-dom';
import { GitBranch, Link as LinkIcon, Send, Globe, Briefcase, GraduationCap, FolderGit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
  const { data: profile, isLoading } = useProfile();
  const username = useAuthStore((state) => state.username);
  const plan = useAuthStore((state) => state.plan);
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="p-8 text-secondary">{t('dashboard.loading', 'Loading dashboard...')}</div>;
  }

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.headline) score += 10;
    if (profile.summary) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 20;
    if (profile.education && profile.education.length > 0) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.githubUsername) score += 10;
    return score;
  };

  const completeness = getProfileCompleteness();
  const displayName = profile?.fullName || username || 'Developer';

  return (
    <div className="animate-fade-in w-full pb-20">
      <style>{`
        .glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 12px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .card-hover { transition: all .2s ease; }
        .card-hover:hover { border-color: #171717; transform: translateY(-2px); }
        .dark .card-hover:hover { border-color: #e5e5e5; }
        .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06); }
        .dark .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.2); }
      `}</style>

      {/* Hero */}
      <section className="pt-12 pb-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            {t('dashboard.welcomeBack', 'Welcome back')},<br/>
            <span className="text-muted">{displayName}.</span>
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            {t('dashboard.heroText', 'Your profile is currently {{completeness}}% complete. Edit your details, sync from GitHub, or generate a fresh PDF resume.', { completeness })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/profile/edit" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[var(--color-text)] text-[var(--color-bg)] rounded-xl hover:opacity-85 transition-all">
              {t('dashboard.editProfileBtn', 'Edit Profile')}
            </Link>
            {username && (
              <a href={`/portfolio/${username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-default rounded-xl hover:border-[var(--color-text)] transition-all">
                {t('dashboard.viewPortfolioBtn', 'View Live Portfolio')}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto mt-16 grid grid-cols-3 gap-8 py-8 border-y border-default">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">{completeness}%</div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">{t('dashboard.profileStrength', 'Profile Strength')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">
              {profile?.githubUsername ? (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline text-[var(--color-link)] transition-all">
                  {t('dashboard.githubSynced', 'Synced')}
                </a>
              ) : t('dashboard.githubNone', 'None')}
            </div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">{t('dashboard.github', 'GitHub')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">{plan}</div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">{t('dashboard.currentPlan', 'Current Plan')}</div>
          </div>
        </div>
      </section>

      {/* Quick Actions (Style of Features) */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{t('dashboard.quickActions', 'Quick Actions')}</h2>
            <p className="text-secondary">{t('dashboard.quickActionsDesc', 'Everything you need to manage your developer presence.')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link to="/profile/edit" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.685-12.684z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.editProfile', 'Edit Profile')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.editProfileDesc', 'Update your experience, education, skills, and basic information.')}</p>
            </Link>
            
            <Link to="/resume" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.pdfResume', 'PDF Resume')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.pdfResumeDesc', 'Generate an ATS-friendly PDF resume instantly from your profile data.')}</p>
            </Link>
            
            <Link to="/tracker" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.jobTracker', 'Job Tracker')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.jobTrackerDesc', 'Manage your job applications with our Enterprise CRM table.')}</p>
            </Link>
            
            <Link to="/billing" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.billingQuota', 'Billing & Quota')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.billingQuotaDesc', 'Upgrade to Pro for unlimited AI generation and features.')}</p>
            </Link>

            <button
              onClick={async () => {
                try {
                  const { api } = await import('../../shared/api/axios');
                  const { toast } = await import('sonner');
                  const res = await api.get('/profile/readme');
                  await navigator.clipboard.writeText(res.data);
                  toast.success('README copied to clipboard!');
                } catch (e) {
                  const { toast } = await import('sonner');
                  toast.error('Failed to generate README');
                }
              }}
              className="p-6 rounded-2xl border border-default surface-primary card-hover text-left flex flex-col items-start w-full cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.copyReadme', 'Copy README')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.copyReadmeDesc', 'Copy your Markdown README to paste into your GitHub profile.')}</p>
            </button>

            <a
              href="http://localhost:8080/api/v1/profile/export/json"
              download="medev_profile.json"
              className="p-6 rounded-2xl border border-default surface-primary card-hover text-left flex flex-col items-start w-full cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.exportJson', 'Export JSON')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.exportJsonDesc', 'Download your full profile data in raw JSON format.')}</p>
            </a>

            <button
              onClick={async () => {
                try {
                  const { api } = await import('../../shared/api/axios');
                  const { toast } = await import('sonner');
                  const res = await api.get('/ai/export/linkedin');
                  await navigator.clipboard.writeText(res.data);
                  toast.success('LinkedIn About section copied!');
                } catch (e) {
                  const { toast } = await import('sonner');
                  toast.error('Failed to generate LinkedIn section');
                }
              }}
              className="p-6 rounded-2xl border border-default surface-primary card-hover text-left flex flex-col items-start w-full cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.copyLinkedin', 'Copy for LinkedIn')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.copyLinkedinDesc', 'Generate a tailored About section for LinkedIn via AI.')}</p>
            </button>

            <button
              onClick={async () => {
                try {
                  const { toast } = await import('sonner');
                  toast.loading(t('dashboard.aiRewriting', 'AI is rewriting your entire profile...'), { id: 'ai-sync' });
                  const { api } = await import('../../shared/api/axios');
                  await api.post('/ai/generate-profile');
                  
                  // Reload page to refetch everything (or invalidate queries if we had queryClient here)
                  window.location.reload();
                } catch (e: any) {
                  const { toast } = await import('sonner');
                  toast.error(e.response?.data?.message || t('dashboard.syncError', 'Failed to sync profile'), { id: 'ai-sync' });
                }
              }}
              className="p-6 rounded-2xl border border-default surface-primary card-hover text-left flex flex-col items-start w-full cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500"></div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">{t('dashboard.smartSync', 'Smart AI Sync')}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t('dashboard.smartSyncDesc', 'Merge PDF data and GitHub to generate the perfect profile.')}</p>
            </button>
          </div>
        </div>
      </section>

      {/* Live Preview Mock Window */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">

          <div className="mock-window rounded-2xl border border-default surface-primary overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-default surface-secondary">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-3 text-xs text-muted font-mono">medev.io/@{username || 'developer'}</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-5 mb-6">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-default" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full surface-tertiary flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{displayName}</div>
                  <div className="text-sm text-secondary mt-0.5">{profile?.headline || 'Add a headline...'}</div>
                </div>
              </div>

              {/* Contacts */}
              <div className="flex flex-wrap gap-4 mb-6">
                {profile?.githubUsername && (
                  <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="text-sm text-secondary hover:text-[var(--color-link)] transition-colors flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="text-sm text-secondary hover:text-[var(--color-link)] transition-colors flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile?.telegram && (
                  <a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noreferrer" className="text-sm text-secondary hover:text-[var(--color-link)] transition-colors flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> Telegram
                  </a>
                )}
                {profile?.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="text-sm text-secondary hover:text-[var(--color-link)] transition-colors flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>

              <p className="text-sm text-secondary leading-relaxed mb-10">{profile?.summary || 'Add a summary to introduce yourself...'}</p>
              
              {/* Projects */}
              {profile?.projects && profile.projects.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><FolderGit2 className="w-5 h-5 text-secondary"/> Projects</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.projects.map(proj => (
                      <div key={proj.id} className="p-4 rounded-xl border border-default surface-secondary">
                        <div className="font-semibold text-primary mb-1">{proj.name}</div>
                        {proj.description && <p className="text-xs text-secondary mb-3 line-clamp-2">{proj.description}</p>}
                        {proj.techStack && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {proj.techStack.split(',').map(tech => (
                              <span key={tech} className="px-1.5 py-0.5 text-[10px] font-medium rounded surface-tertiary text-secondary">{tech.trim()}</span>
                            ))}
                          </div>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-link)] hover:underline inline-flex items-center gap-1">
                            <GitBranch className="w-3 h-3" /> Source
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile?.experience && profile.experience.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-secondary"/> Experience</h4>
                  <div className="space-y-6">
                    {profile.experience.map(exp => (
                      <div key={exp.id} className="relative pl-4 border-l-2 border-default">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-secondary"></div>
                        <div className="font-semibold text-primary">{exp.position}</div>
                        <div className="text-sm text-secondary mb-2">{exp.company} • {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</div>
                        {exp.description && <p className="text-sm text-secondary whitespace-pre-wrap mb-2">{exp.description}</p>}
                        {exp.techStack && (
                          <div className="flex flex-wrap gap-1.5">
                            {exp.techStack.split(',').map(tech => (
                              <span key={tech} className="px-1.5 py-0.5 text-xs font-medium rounded surface-secondary text-primary">{tech.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile?.education && profile.education.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-secondary"/> Education</h4>
                  <div className="space-y-6">
                    {profile.education.map(edu => (
                      <div key={edu.id} className="relative pl-4 border-l-2 border-default">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-secondary"></div>
                        <div className="font-semibold text-primary">{edu.institution}</div>
                        <div className="text-sm text-secondary">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                        <div className="text-xs text-secondary mt-1">{edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.filter(s => s.name.toUpperCase() !== 'HTML' && s.name.toUpperCase() !== 'CSS').map(skill => (
                      <span key={skill.name} className="px-2.5 py-1 text-xs font-medium rounded-md surface-secondary text-primary border border-default shadow-sm">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
