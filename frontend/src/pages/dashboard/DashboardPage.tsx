import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../../shared/ui/Form';
import { OnboardingWizard } from '../../features/onboarding/ui/OnboardingWizard';
import { useQueryClient } from '@tanstack/react-query';

export const DashboardPage = () => {
  const { data: profile, isLoading } = useProfile();
  const username = useAuthStore((state) => state.username);
  const plan = useAuthStore((state) => state.plan);

  const queryClient = useQueryClient();

  if (isLoading) {
    return <div className="p-8 text-secondary">Loading dashboard...</div>;
  }

  if (profile && profile.isOnboardingCompleted === false) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[80vh]">
        <div className="w-full">
          <OnboardingWizard onComplete={() => queryClient.invalidateQueries({ queryKey: ['profile'] })} />
        </div>
      </div>
    );
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

  const getActionableItems = () => {
    if (!profile) return [];
    const items = [];
    if (!profile.fullName) items.push({ title: 'Add your Full Name', points: '+20%', to: '/profile/edit#about' });
    if (!profile.headline) items.push({ title: 'Add a professional Headline', points: '+10%', to: '/profile/edit#about' });
    if (!profile.summary) items.push({ title: 'Write a short Summary', points: '+20%', to: '/profile/edit#about' });
    if (!profile.experience || profile.experience.length === 0) items.push({ title: 'Add your latest Experience', points: '+20%', to: '/profile/edit#experience' });
    if (!profile.education || profile.education.length === 0) items.push({ title: 'Add your Education', points: '+10%', to: '/profile/edit#education' });
    if (!profile.skills || profile.skills.length === 0) items.push({ title: 'Add 3+ Skills', points: '+10%', to: '/profile/edit#skills' });
    if (!profile.githubUsername) items.push({ title: 'Link your GitHub Account', points: '+10%', to: '/profile/edit#github' });
    return items;
  };

  const actions = [
    { to: '/profile/edit', title: 'Edit Profile', desc: 'Update experience, skills, and bio' },
    { to: '/resume', title: 'Generate Resume', desc: 'Export your profile as a PDF' },
    ...(username
      ? [{ to: `/portfolio/${username}`, title: 'View Portfolio', desc: 'See what recruiters see' }]
      : []),
    { to: '/billing', title: 'Upgrade to Pro', desc: 'Unlock all templates and unlimited exports' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1 text-primary">
            Welcome back, {profile?.fullName || username || 'Developer'}
          </h1>
          <p className="text-sm text-secondary">
            Here's what's happening with your MeDev profile.
          </p>
        </div>
        <Badge tone={plan === 'PRO' ? 'accent' : 'default'}>
          Plan: {plan === 'PRO' ? 'PRO' : 'FREE'}
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 surface-inset border-default col-span-1 md:col-span-1">
          <h3 className="text-sm font-medium mb-3 text-secondary uppercase tracking-wider">
            Profile Strength
          </h3>
          <div className="text-4xl font-semibold mb-2 text-primary flex items-baseline gap-1">
            {completeness}<span className="text-lg text-secondary">%</span>
          </div>
          <div className="w-full rounded-full h-2 surface-tertiary mb-3 mt-4">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completeness}%`, backgroundColor: completeness === 100 ? 'var(--color-success, #238636)' : 'var(--color-accent)' }}
            />
          </div>
          {completeness === 100 ? (
            <p className="text-sm text-[var(--color-success, #238636)] font-medium">All-Star Profile! 🌟</p>
          ) : (
            <p className="text-xs text-secondary">Complete the tasks below to reach 100%.</p>
          )}
        </Card>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary mb-1">
            Next Steps for You
          </h3>
          {getActionableItems().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getActionableItems().slice(0, 4).map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="flex items-center justify-between p-4 rounded-lg border border-default surface-secondary hover:border-[var(--color-accent)] transition-all group"
                >
                  <span className="font-medium text-sm group-hover:text-[var(--color-link)] transition-colors">{item.title}</span>
                  <Badge tone="accent" className="font-mono text-xs">{item.points}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-default rounded-lg text-secondary text-sm">
              You've completed all profile steps! Your portfolio is ready to shine.
            </div>
          )}
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-secondary">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="block rounded-md p-4 transition-colors duration-100 surface-inset border border-default hover:border-[var(--color-text-muted)] group"
          >
            <h3 className="font-medium mb-0.5 text-[var(--color-link)] group-hover:underline">{a.title}</h3>
            <p className="text-sm text-secondary">
              {a.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
