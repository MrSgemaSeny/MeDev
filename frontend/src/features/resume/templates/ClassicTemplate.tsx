import { useProfile } from '../../../shared/api/hooks/useProfile';
import { useResumeEditorStore } from '../../../entities/resume/model/resumeEditorStore';

export const ClassicTemplate = () => {
  const { data: profile } = useProfile();
  const sections = useResumeEditorStore((state) => state.sections);

  if (!profile) return null;

  return (
    <div className="bg-white text-black p-8 max-w-[800px] w-full min-h-[1131px] shadow-lg font-serif">
      <header className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{profile.fullName || 'Your Name'}</h1>
        <p className="text-lg text-gray-700 mt-1">{profile.headline || 'Professional Title'}</p>
        <div className="text-sm mt-2 text-gray-600 flex justify-center space-x-4 flex-wrap">
          {profile.location && <span>{profile.location}</span>}
          {profile.website && <span>{profile.website}</span>}
          {profile.githubUrl && <span>{profile.githubUrl}</span>}
          {profile.linkedinUrl && <span>{profile.linkedinUrl}</span>}
        </div>
      </header>

      <div className="space-y-6">
        {sections.filter(s => s.visible).map(section => {
          switch (section.type) {
            case 'summary':
              return profile.summary ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Profile</h2>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{profile.summary}</p>
                </section>
              ) : null;
            case 'experience':
              return profile.experience && profile.experience.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Experience</h2>
                  <div className="space-y-4">
                    {profile.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold">
                          <h3>{exp.position}</h3>
                          <span className="text-sm font-normal text-gray-600">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="text-gray-700 italic text-sm">{exp.company}</div>
                        {exp.description && (
                          <p className="text-sm mt-1 whitespace-pre-wrap">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'education':
              return profile.education && profile.education.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Education</h2>
                  <div className="space-y-3">
                    {profile.education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline font-bold">
                          <h3>{edu.degree} in {edu.fieldOfStudy}</h3>
                          <span className="text-sm font-normal text-gray-600">
                            {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                          </span>
                        </div>
                        <div className="text-gray-700 text-sm">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'skills':
              return profile.skills && profile.skills.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill.id} className="text-sm">
                        <span className="font-semibold">{skill.name}</span> ({skill.level})
                      </span>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'languages':
              return profile.languages && profile.languages.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Languages</h2>
                  <div className="flex flex-wrap gap-4">
                    {profile.languages.map(lang => (
                      <span key={lang.id} className="text-sm">
                        <span className="font-semibold">{lang.name}</span>: {lang.proficiency}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'projects':
              return profile.projects && profile.projects.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase border-b border-gray-300 mb-2 pb-1">Projects</h2>
                  <div className="space-y-3">
                    {profile.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline font-bold">
                          <h3>{proj.name}</h3>
                          <span className="text-sm font-normal text-gray-600">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                          </span>
                        </div>
                        {proj.url && <a href={proj.url} className="text-sm text-blue-600 hover:underline">{proj.url}</a>}
                        {proj.description && (
                          <p className="text-sm mt-1 whitespace-pre-wrap">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
