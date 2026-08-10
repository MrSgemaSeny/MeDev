import { useProfile } from '../../../shared/api/hooks/useProfile';
import { useResumeEditorStore } from '../../../entities/resume/model/resumeEditorStore';

export const ModernTemplate = () => {
  const { data: profile } = useProfile();
  const sections = useResumeEditorStore((state) => state.sections);

  if (!profile) return null;

  return (
    <div className="bg-white text-gray-800 p-8 max-w-[800px] w-full min-h-[1131px] shadow-lg font-sans grid grid-cols-3 gap-8">
      {/* Left Sidebar (Dark) */}
      <div className="col-span-1 bg-gray-900 text-gray-300 -m-8 p-8 flex flex-col space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">{profile.fullName || 'Your Name'}</h1>
          <p className="text-emerald-500 font-medium mt-1">{profile.headline || 'Professional Title'}</p>
        </div>

        <div className="space-y-2 text-sm">
          {profile.location && <p>📍 {profile.location}</p>}
          {profile.website && <p>🔗 {profile.website}</p>}
          {profile.githubUrl && <p>🐙 {profile.githubUrl}</p>}
          {profile.linkedinUrl && <p>💼 {profile.linkedinUrl}</p>}
        </div>

        {sections.find(s => s.type === 'skills')?.visible && profile.skills && profile.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white uppercase mb-3 border-b border-gray-700 pb-1">Skills</h2>
            <div className="flex flex-col space-y-2">
              {profile.skills.map(skill => (
                <div key={skill.id} className="text-sm">
                  <div className="text-white">{skill.name}</div>
                  <div className="text-gray-500 text-xs">{skill.level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.find(s => s.type === 'languages')?.visible && profile.languages && profile.languages.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white uppercase mb-3 border-b border-gray-700 pb-1">Languages</h2>
            <div className="flex flex-col space-y-2">
              {profile.languages.map(lang => (
                <div key={lang.id} className="text-sm">
                  <div className="text-white">{lang.name}</div>
                  <div className="text-gray-500 text-xs">{lang.proficiency}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="col-span-2 space-y-6">
        {sections.filter(s => s.visible && !['skills', 'languages'].includes(s.type)).map(section => {
          switch (section.type) {
            case 'summary':
              return profile.summary ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-2 border-b-2 border-emerald-500 inline-block pb-1">Profile</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.summary}</p>
                </section>
              ) : null;
            case 'experience':
              return profile.experience && profile.experience.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-3 border-b-2 border-emerald-500 inline-block pb-1">Experience</h2>
                  <div className="space-y-5">
                    {profile.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold text-gray-900">
                          <h3>{exp.position}</h3>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="text-gray-500 font-medium text-sm mb-1">{exp.company}</div>
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'education':
              return profile.education && profile.education.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-3 border-b-2 border-emerald-500 inline-block pb-1">Education</h2>
                  <div className="space-y-4">
                    {profile.education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline font-bold text-gray-900">
                          <h3>{edu.degree} in {edu.fieldOfStudy}</h3>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                          </span>
                        </div>
                        <div className="text-gray-500 font-medium text-sm">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
            case 'projects':
              return profile.projects && profile.projects.length > 0 ? (
                <section key={section.id}>
                  <h2 className="text-xl font-bold uppercase text-gray-900 mb-3 border-b-2 border-emerald-500 inline-block pb-1">Projects</h2>
                  <div className="space-y-4">
                    {profile.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline font-bold text-gray-900">
                          <h3>{proj.name}</h3>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                          </span>
                        </div>
                        {proj.url && <a href={proj.url} className="text-sm text-emerald-500 hover:underline mb-1 block">{proj.url}</a>}
                        {proj.description && (
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{proj.description}</p>
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
