import { useLocation } from 'react-router-dom';
import { AboutSection } from '../../features/profile/sections/AboutSection';
import { ExperienceSection } from '../../features/profile/sections/ExperienceSection';
import { EducationSection } from '../../features/profile/sections/EducationSection';
import { SkillsSection } from '../../features/profile/sections/SkillsSection';
import { LanguagesSection } from '../../features/profile/sections/LanguagesSection';
import { ProjectsSection } from '../../features/profile/sections/ProjectsSection';
import { GithubSection } from '../../features/profile/sections/GithubSection';

export const ProfileEditor = () => {
  const location = useLocation();
  const activeSection = location.hash.replace('#', '') || 'about';

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

  return (
    <div className="max-w-[1100px] mx-auto w-full">
      {renderActiveSection()}
    </div>
  );
};
