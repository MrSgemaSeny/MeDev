import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { data: profile, isLoading } = useProfile();
  const username = useAuthStore((state) => state.username);
  const plan = useAuthStore((state) => state.plan);

  if (isLoading) {
    return <div className="p-8 text-secondary">Loading dashboard...</div>;
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
      <style>{\
        .glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 12px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .card-hover { transition: all .2s ease; }
        .card-hover:hover { border-color: #171717; transform: translateY(-2px); }
        .dark .card-hover:hover { border-color: #e5e5e5; }
        .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06); }
        .dark .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.2); }
      \}</style>

      {/* Hero */}
      <section className="pt-12 pb-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-default surface-secondary mb-8">
            <span className="glow-dot"></span>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Live Dashboard</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Welcome back,<br/>
            <span className="text-muted">{displayName}.</span>
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            Your profile is currently {completeness}% complete. Edit your details, sync from GitHub, or generate a fresh PDF resume.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/profile/edit" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[var(--color-text)] text-[var(--color-bg)] rounded-xl hover:opacity-85 transition-all">
              Edit Profile
            </Link>
            {username && (
              <a href={\/portfolio/\\} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-default rounded-xl hover:border-[var(--color-text)] transition-all">
                View Live Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto mt-16 grid grid-cols-3 gap-8 py-8 border-y border-default">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">{completeness}%</div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">Profile Strength</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">{profile?.githubUsername ? 'Synced' : 'None'}</div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">GitHub</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-primary">{plan}</div>
            <div className="text-xs text-secondary mt-1 font-medium uppercase tracking-wider">Current Plan</div>
          </div>
        </div>
      </section>

      {/* Quick Actions (Style of Features) */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Quick Actions</h2>
            <p className="text-secondary">Everything you need to manage your developer presence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link to="/profile/edit" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.685-12.684z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">Edit Profile</h3>
              <p className="text-sm text-secondary leading-relaxed">Update your experience, education, skills, and basic information.</p>
            </Link>
            
            <Link to="/resume" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">PDF Resume</h3>
              <p className="text-sm text-secondary leading-relaxed">Generate an ATS-friendly PDF resume instantly from your profile data.</p>
            </Link>
            
            <Link to="/tracker" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">Job Tracker</h3>
              <p className="text-sm text-secondary leading-relaxed">Manage your job applications with our Enterprise CRM table.</p>
            </Link>

            <Link to="/billing" className="p-6 rounded-2xl border border-default surface-primary card-hover">
              <div className="w-10 h-10 rounded-lg surface-tertiary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>
              </div>
              <h3 className="font-bold mb-1.5 text-primary">Billing & Quota</h3>
              <p className="text-sm text-secondary leading-relaxed">Upgrade to Pro for unlimited AI generation and features.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Preview Mock Window */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Portfolio Preview</h2>
            <p className="text-secondary">How recruiters and visitors see your live web portfolio.</p>
          </div>
          <div className="mock-window rounded-2xl border border-default surface-primary overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-default surface-secondary">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-3 text-xs text-muted font-mono">medev.io/@{username || 'developer'}</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full surface-tertiary flex items-center justify-center flex-shrink-0 text-xl font-bold">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{displayName}</div>
                  <div className="text-sm text-secondary mt-0.5">{profile?.headline || 'Add a headline...'}</div>
                </div>
              </div>
              <p className="text-sm text-secondary leading-relaxed mb-5">{profile?.summary || 'Add a summary to introduce yourself...'}</p>
              
              {profile?.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.skills.map(skill => (
                    <span key={skill.name} className="px-2.5 py-1 text-xs font-medium rounded-md surface-secondary text-primary">{skill.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
