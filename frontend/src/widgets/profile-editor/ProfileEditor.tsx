import { useLocation } from 'react-router-dom';
import { AboutSection } from '../../features/profile/sections/AboutSection';
import { ExperienceSection } from '../../features/profile/sections/ExperienceSection';
import { EducationSection } from '../../features/profile/sections/EducationSection';
import { SkillsSection } from '../../features/profile/sections/SkillsSection';
import { LanguagesSection } from '../../features/profile/sections/LanguagesSection';
import { ProjectsSection } from '../../features/profile/sections/ProjectsSection';
import { GithubSection } from '../../features/profile/sections/GithubSection';
import { Button } from '../../shared/ui/Button';
import { useGenerateProfile } from '../../shared/api/hooks/useProfile';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const ProfileEditor = () => {
  const location = useLocation();
  const activeSection = location.hash.replace('#', '') || 'about';
  const { mutateAsync: generateProfile, isPending } = useGenerateProfile();
  const { t } = useTranslation();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'about': return <AboutSection />;
      case 'experience': return <ExperienceSection />;
      case 'education': return <EducationSection />;
      case 'skills': return <SkillsSection />;
      case 'languages': return <LanguagesSection />;
      case 'projects': return <ProjectsSection />;
      case 'github': return <GithubSection />;
      default: return <AboutSection />;
    }
  };

  const handleSmartSync = async () => {
    toast.loading(t('dashboard.aiRewriting', 'AI is rewriting your entire profile...'), { id: 'ai-sync' });
    try {
      await generateProfile();
      toast.success(t('dashboard.syncSuccess', 'Profile synced successfully!'), { id: 'ai-sync' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('dashboard.syncError', 'Failed to sync profile'), { id: 'ai-sync' });
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto w-full p-8">
      <div className="flex justify-end mb-6">
        <Button 
          variant="primary" 
          onClick={handleSmartSync} 
          disabled={isPending}
          className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-2 font-bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          {isPending ? t('dashboard.merging', 'Merging PDF & GitHub...') : t('dashboard.smartSync', 'Smart AI Sync')}
        </Button>
      </div>
      {renderActiveSection()}
    </div>
  );
};
