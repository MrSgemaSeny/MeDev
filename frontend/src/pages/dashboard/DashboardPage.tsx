import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../../shared/ui/Form';

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
    if (profile.githubUrl) score += 10;
    return score;
  };

  const completeness = getProfileCompleteness();

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
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back, {profile?.fullName || username || 'Developer'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Here's what's happening with your MeDev profile.
          </p>
        </div>
        <Badge tone={plan === 'PRO' ? 'accent' : 'default'}>
          Plan: {plan === 'PRO' ? 'PRO' : 'FREE'}
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Profile Completeness
          </h3>
          <div className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {completeness}%
          </div>
          <div
            className="w-full rounded-full h-1.5"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${completeness}%`, backgroundColor: 'var(--color-accent)' }}
            />
          </div>
        </Card>
      </div>

      <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="block rounded-md p-4 transition-colors duration-100"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
            }}
          >
            <h3 className="font-medium mb-0.5">{a.title}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {a.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
