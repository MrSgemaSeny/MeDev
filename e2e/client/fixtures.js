export function generateUser(prefix = 'usr') {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  const ts = Date.now().toString().slice(-4);
  return {
    email: `e2e_${prefix}_${rand}_${ts}@medev-test.local`,
    username: `${prefix}_${rand}`,
    password: `P@ssw0rd123_${rand}`
  };
}

export function generateSkill(category = 'Backend') {
  const rand = Math.floor(Math.random() * 10000);
  return {
    name: `Tech-${rand}`,
    category,
    level: 'ADVANCED'
  };
}

export function generateExperience() {
  const rand = Math.floor(Math.random() * 10000);
  return {
    company: `Company-${rand} Corp`,
    position: 'Senior Software Engineer',
    description: 'Developed high-throughput distributed microservices.',
    techStack: 'Java, Spring Boot, PostgreSQL, Redis, Docker',
    startDate: '2023-01-01',
    endDate: '2024-06-01',
    isCurrent: false
  };
}

export function generateEducation() {
  const rand = Math.floor(Math.random() * 10000);
  return {
    institution: `State University ${rand}`,
    degree: 'Bachelor of Computer Science',
    field: 'Software Engineering',
    startDate: '2019-09-01',
    endDate: '2023-06-30',
    isCurrent: false
  };
}

export function generateLanguage() {
  const rand = Math.floor(Math.random() * 10000);
  return {
    name: `Language-${rand}`,
    level: 'Fluent'
  };
}

export function generateProject() {
  const rand = Math.floor(Math.random() * 10000);
  return {
    name: `Project-${rand} SaaS`,
    description: 'Automated developer portfolio platform with ATS resume generator.',
    techStack: 'React, TypeScript, Tailwind CSS, Spring Boot',
    githubUrl: 'https://github.com/test/project-' + rand,
    liveUrl: 'https://project-' + rand + '.medev.test',
    isFeatured: true,
    isVisible: true
  };
}

export function generateJobApplication() {
  const rand = Math.floor(Math.random() * 10000);
  return {
    companyName: `TargetCorp-${rand}`,
    role: 'Lead Architect',
    status: 'APPLIED',
    jobUrl: `https://targetcorp-${rand}.com/jobs/lead`,
    location: 'Remote, Almaty',
    salaryRange: '$120,000 - $150,000',
    notes: 'First round interview scheduled via recruiter email.',
    jobDescription: 'Seeking an experienced Lead Architect to scale core transactional services.'
  };
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
