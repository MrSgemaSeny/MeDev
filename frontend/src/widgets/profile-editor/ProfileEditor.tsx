import { useSearchParams } from 'react-router-dom';
import { AboutSection } from '../../features/profile/sections/AboutSection';
import { ExperienceSection } from '../../features/profile/sections/ExperienceSection';
import { EducationSection } from '../../features/profile/sections/EducationSection';
import { SkillsSection } from '../../features/profile/sections/SkillsSection';
import { LanguagesSection } from '../../features/profile/sections/LanguagesSection';
import { ProjectsSection } from '../../features/profile/sections/ProjectsSection';
import { GithubSection } from '../../features/profile/sections/GithubSection';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'languages', label: 'Languages' },
  { id: 'projects', label: 'Projects' },
  { id: 'github', label: 'GitHub' },
];

export const ProfileEditor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'about';

  const handleSectionChange = (sectionId: string) => {
    setSearchParams({ section: sectionId });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'about':
        return <AboutSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'education':
        return <EducationSection />;
      case 'skills':
        return <SkillsSection />;
      case 'languages':
        return <LanguagesSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'github':
        return <GithubSection />;
      default:
        return <AboutSection />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar for Sections */}
      <div className="w-64 border-r border-gray-800 p-4 space-y-1">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Sections</h3>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeSection === section.id
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
      
      {/* Right Column for Active Form */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderActiveSection()}
      </div>
    </div>
  );
};
