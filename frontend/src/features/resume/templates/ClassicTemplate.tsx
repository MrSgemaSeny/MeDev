import { useProfile } from '../../../shared/api/hooks/useProfile';
import { useResumeEditorStore } from '../../../entities/resume/model/resumeEditorStore';

export const ClassicTemplate = () => {
  const { data: profile } = useProfile();
  const sections = useResumeEditorStore((state) => state.sections);

  if (!profile) return null;

  return (
    <div 
      className="bg-white text-black p-12 font-serif"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{profile.fullName || 'Your Name'}</h1>
        
        <div className="text-sm text-gray-800 flex justify-center items-center flex-wrap gap-2">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && (profile.website || profile.githubUrl || profile.linkedinUrl) && <span>•</span>}
          {profile.website && <a href={profile.website} className="hover:underline">{profile.website}</a>}
          {profile.website && (profile.githubUrl || profile.linkedinUrl) && <span>•</span>}
          {profile.githubUrl && <a href={profile.githubUrl} className="hover:underline">{profile.githubUrl}</a>}
          {profile.githubUrl && profile.linkedinUrl && <span>•</span>}
          {profile.linkedinUrl && <a href={profile.linkedinUrl} className="hover:underline">{profile.linkedinUrl}</a>}
        </div>
      </header>

      <div className="space-y-6">
        {sections.filter(s => s.visible).map(section => {
          switch (section.type) {
            case 'summary':
              return profile.summary ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Summary</h2>
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{profile.summary}</p>
                </section>
              ) : null;
            case 'experience':
              return profile.experience && profile.experience.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Experience</h2>
                  <div className="space-y-4">
                    {profile.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-base">{exp.company}</h3>
                          <span className="text-sm font-medium">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="italic text-sm mb-1">{exp.position}</div>
                        {exp.description && (
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'education':
              return profile.education && profile.education.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Education</h2>
                  <div className="space-y-4">
                    {profile.education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-base">{edu.institution}</h3>
                          <span className="text-sm font-medium">
                            {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                          </span>
                        </div>
                        <div className="italic text-sm">
                          {edu.degree} in {edu.fieldOfStudy}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'skills':
              return profile.skills && profile.skills.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Skills</h2>
                  <div className="text-sm leading-relaxed">
                    {profile.skills.map(skill => (
                      <span key={skill.id} className="mr-3">
                        <span className="font-bold">{skill.name}</span>
                        {skill.level && <span className="text-gray-600 ml-1">({skill.level})</span>}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'languages':
              return profile.languages && profile.languages.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Languages</h2>
                  <div className="text-sm leading-relaxed">
                    {profile.languages.map(lang => (
                      <span key={lang.id} className="mr-4">
                        <span className="font-bold">{lang.name}</span>: {lang.proficiency}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'projects':
              return profile.projects && profile.projects.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">Projects</h2>
                  <div className="space-y-4">
                    {profile.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-base">
                            {proj.name}
                            {proj.url && (
                              <a href={proj.url} className="ml-2 text-sm font-normal text-blue-600 hover:underline">
                                [Link]
                              </a>
                            )}
                          </h3>
                          <span className="text-sm font-medium">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
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
