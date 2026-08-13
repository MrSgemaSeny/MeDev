const fs = require('fs');
const files = [
    'src/features/profile/sections/ExperienceSection.tsx',
    'src/features/profile/sections/LanguagesSection.tsx',
    'src/features/profile/sections/ProjectsSection.tsx',
    'src/features/profile/sections/SkillsSection.tsx',
    'src/features/resume/templates/ClassicTemplate.tsx',
    'src/features/resume/templates/ModernTemplate.tsx',
    'src/widgets/portfolio/PortfolioView.tsx',
    'src/shared/api/hooks/useProfile.ts',
    'src/widgets/header/UserProfileDropdown.tsx'
];
const replacements = {
    'linkedinUrl': 'linkedin',
    'exp.current': 'exp.isCurrent',
    'edu.current': 'edu.isCurrent',
    'fieldOfStudy': 'field',
    'lang.proficiency': 'lang.level',
    'proj.url': 'proj.githubUrl',
    '{proj.startDate} - {proj.endDate}': '',
    'current:': 'isCurrent:',
    'proficiency:': 'level:',
    'startDate: proj.startDate,': '/* startDate */',
    'endDate: proj.endDate,': '/* endDate */',
    "name: '', level: ''": "name: '', level: '', sortOrder: 0",
    "useNavigate": "/* useNavigate */",
    "role": "/* role */"
};
files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        for (const [k, v] of Object.entries(replacements)) {
            content = content.split(k).join(v);
        }
        content = content.replace(/profile\.githubUrl/g, '(profile.githubUsername ? `https://github.com/${profile.githubUsername}` : null)');
        fs.writeFileSync(f, content, 'utf8');
    }
});
