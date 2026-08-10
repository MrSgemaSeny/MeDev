const fs = require('fs');
const files = [
  'AboutForm.tsx',
  'ExperienceForm.tsx',
  'EducationForm.tsx',
  'SkillsForm.tsx',
  'LanguagesForm.tsx',
  'ProjectsForm.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync('frontend/src/features/resume/forms/' + file, 'utf8');
  
  if (file === 'AboutForm.tsx') {
    content = content.replace(/<div className="flex items-center justify-between mb-4">[\s\S]*?<\/div>/, '');
  } else {
    content = content.replace(/<div className="flex items-center justify-between mb-4">[\s\S]*?<\/div>/, '{editingId && (<div className="flex items-center justify-end mb-4"><button type="button" onClick={() => setEditingId(null)} className="text-sm font-medium hover:underline" style={{ color: \'var(--color-text-muted)\' }}>Cancel Edit</button></div>)}');
  }

  content = content.replace(/<div className="pt-4 border-t mt-auto"/g, '<div className="pt-4 border-t mt-auto flex justify-end"');
  content = content.replace(/className="w-full text-white/g, 'className="text-white px-6');
  
  fs.writeFileSync('frontend/src/features/resume/forms/' + file, content);
});
console.log('Forms updated');
