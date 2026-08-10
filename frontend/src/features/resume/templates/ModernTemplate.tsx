import { useProfile } from '../../../shared/api/hooks/useProfile';
import { useResumeEditorStore } from '../../../entities/resume/model/resumeEditorStore';

export const ModernTemplate = () => {
  const { data: profile } = useProfile();
  const sections = useResumeEditorStore((state) => state.sections);

  if (!profile) return null;

  return (
    <div 
      className="bg-white text-gray-800 font-sans grid grid-cols-3"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* LEFT SIDEBAR */}
      <div 
        className="col-span-1 text-white p-8 flex flex-col"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wider leading-tight mb-2">
            {profile.fullName || 'Your Name'}
          </h1>
          <p className="text-blue-300 font-medium text-sm tracking-wide">
            {profile.headline || 'Professional Title'}
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {profile.location && (
            <div className="text-sm text-gray-300">{profile.location}</div>
          )}
          {profile.website && (
            <div className="text-sm text-gray-300">
              <a href={profile.website} className="hover:text-white truncate">{profile.website.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
          {profile.githubUrl && (
            <div className="text-sm text-gray-300">
              <a href={profile.githubUrl} className="hover:text-white truncate">{profile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</a>
            </div>
          )}
          {profile.linkedinUrl && (
            <div className="text-sm text-gray-300">
              <a href={profile.linkedinUrl} className="hover:text-white truncate">LinkedIn Profile</a>
            </div>
          )}
        </div>

        {sections.find(s => s.type === 'skills')?.visible && profile.skills && profile.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-600 pb-2">Skills</h2>
            <div className="flex flex-col gap-3">
              {profile.skills.map(skill => (
                <div key={skill.id}>
                  <div className="text-sm font-medium text-gray-200">{skill.name}</div>
                  <div className="text-xs text-blue-300 mt-0.5">{skill.level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.find(s => s.type === 'languages')?.visible && profile.languages && profile.languages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-600 pb-2">Languages</h2>
            <div className="flex flex-col gap-3">
              {profile.languages.map(lang => (
                <div key={lang.id}>
                  <div className="text-sm font-medium text-gray-200">{lang.name}</div>
                  <div className="text-xs text-blue-300 mt-0.5">{lang.proficiency}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="col-span-2 p-10 flex flex-col gap-8">
        {sections.filter(s => s.visible && !['skills', 'languages'].includes(s.type)).map(section => {
          switch (section.type) {
            case 'summary':
              return profile.summary ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-3 flex items-center gap-3">
                    <span className="w-8 h-px bg-blue-600 inline-block"></span>
                    Profile
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.summary}</p>
                </section>
              ) : null;
            case 'experience':
              return profile.experience && profile.experience.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-5 flex items-center gap-3">
                    <span className="w-8 h-px bg-blue-600 inline-block"></span>
                    Experience
                  </h2>
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                    {profile.experience.map(exp => (
                      <div key={exp.id} className="relative pl-6">
                        {/* Timeline dot */}
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white"></div>
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900">{exp.position}</h3>
                          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap ml-4">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-blue-600 mb-2">{exp.company}</div>
                        {exp.description && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'education':
              return profile.education && profile.education.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-5 flex items-center gap-3">
                    <span className="w-8 h-px bg-blue-600 inline-block"></span>
                    Education
                  </h2>
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                    {profile.education.map(edu => (
                      <div key={edu.id} className="relative pl-6">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white"></div>
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap ml-4">
                            {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-blue-600">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'projects':
              return profile.projects && profile.projects.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-5 flex items-center gap-3">
                    <span className="w-8 h-px bg-blue-600 inline-block"></span>
                    Projects
                  </h2>
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                    {profile.projects.map(proj => (
                      <div key={proj.id} className="relative pl-6">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-400 ring-4 ring-white"></div>
                        
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900">
                            {proj.name}
                            {proj.url && (
                              <a href={proj.url} className="ml-2 text-xs font-normal text-blue-600 hover:underline">
                                [Link]
                              </a>
                            )}
                          </h3>
                          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap ml-4">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
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
