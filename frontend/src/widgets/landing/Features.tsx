import { GitBranch, FileText, LayoutTemplate, ShieldCheck, Zap, Bot } from 'lucide-react';

const features = [
  {
    name: 'GitHub Sync',
    description: 'Connect your GitHub account and instantly import repositories, languages, and commit history into your portfolio.',
    icon: GitBranch,
  },
  {
    name: 'AI Resume Generation',
    description: 'Leverage Groq AI to automatically tailor your resume to specific job descriptions based on your real coding history.',
    icon: Bot,
  },
  {
    name: 'Kanban ATS',
    description: 'Track all your job applications in one place. Drag and drop cards through your custom interview pipeline.',
    icon: LayoutTemplate,
  },
  {
    name: 'Export to PDF',
    description: 'Generate pixel-perfect, ATS-friendly PDF resumes directly from the platform.',
    icon: FileText,
  },
  {
    name: 'Lightning Fast',
    description: 'Built on Spring Boot 3 and React 19, delivering sub-millisecond local caching for your public profiles.',
    icon: Zap,
  },
  {
    name: 'Privacy First',
    description: 'Stateless JWT auth and strict Row-Level Security. Your data belongs to you.',
    icon: ShieldCheck,
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 sm:py-32 surface-secondary border-b border-default">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#2ea043]">Built for Developers</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Everything you need to land the next role
          </p>
          <p className="mt-6 text-lg leading-8 text-secondary">
            Stop manually formatting documents. Let your code speak for itself and manage the entire hiring pipeline in one place.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-primary">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border border-default surface">
                    <feature.icon className="h-6 w-6 text-secondary" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-secondary">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
