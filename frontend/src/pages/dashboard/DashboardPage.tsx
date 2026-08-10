import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { data: profile, isLoading } = useProfile();
  const user = useAuthStore((state) => state.user);

  if (isLoading) return <div className="p-8 text-gray-400">Loading dashboard...</div>;

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || profile?.fullName || 'Developer'}!</h1>
          <p className="text-gray-400">Here's what's happening with your MeDev profile.</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full text-sm font-medium">
            Plan: {user?.plan === 'PRO' ? 'PRO' : 'FREE'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Profile Completeness</h3>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-white">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completeness}%` }}></div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Profile Views (Placeholder)</h3>
          <div className="text-3xl font-bold text-white mb-2">1,204</div>
          <p className="text-sm text-emerald-400">+12% from last week</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Resume Downloads</h3>
          <div className="text-3xl font-bold text-white mb-2">3</div>
          <p className="text-sm text-gray-500">Free tier limit: 3/day</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/profile/edit" className="flex items-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-emerald-500/50 transition-colors group">
          <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-xl mr-4 group-hover:bg-emerald-900/30 group-hover:text-emerald-500">
            ✍️
          </div>
          <div>
            <h3 className="text-white font-medium">Edit Profile</h3>
            <p className="text-sm text-gray-400">Update your experience, skills, and bio</p>
          </div>
        </Link>
        <Link to="/resume" className="flex items-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-emerald-500/50 transition-colors group">
          <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-xl mr-4 group-hover:bg-emerald-900/30 group-hover:text-emerald-500">
            📄
          </div>
          <div>
            <h3 className="text-white font-medium">Generate Resume</h3>
            <p className="text-sm text-gray-400">Export your profile as a beautiful PDF</p>
          </div>
        </Link>
        {user?.username && (
          <Link to={`/portfolio/${user.username}`} target="_blank" className="flex items-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-xl mr-4 group-hover:bg-emerald-900/30 group-hover:text-emerald-500">
              👁️
            </div>
            <div>
              <h3 className="text-white font-medium">View Portfolio</h3>
              <p className="text-sm text-gray-400">See what recruiters see</p>
            </div>
          </Link>
        )}
        <Link to="/billing" className="flex items-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-emerald-500/50 transition-colors group">
          <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-xl mr-4 group-hover:bg-emerald-900/30 group-hover:text-emerald-500">
            ⭐
          </div>
          <div>
            <h3 className="text-white font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-gray-400">Unlock all templates and unlimited exports</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
