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
    <div className="flex h-full">
      <div
        className="w-52 border-r p-3 space-y-0.5 shrink-0"
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3 px-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sections
        </h3>
        {SECTIONS.map((section) => {
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className="w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors duration-100"
              style={{
                backgroundColor: active ? 'var(--color-btn-hover)' : 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {renderActiveSection()}
      </div>
    </div>
  );
};
