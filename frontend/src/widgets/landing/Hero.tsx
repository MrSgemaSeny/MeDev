import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden surface pt-32 pb-24 sm:pt-40 sm:pb-32 border-b border-default">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
          Data-first SaaS platform <br className="hidden sm:block" /> for Developers
        </h1>
        <p className="mt-6 text-lg leading-8 text-secondary max-w-2xl">
          Turn your GitHub activity into a professional portfolio. Generate AI-tailored resumes in seconds. Manage applications with an integrated Kanban ATS.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/auth/login"
            className="rounded-md bg-[#238636] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2ea043] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#238636]"
          >
            Get Started with GitHub
          </Link>
          <a href="#features" className="text-sm font-semibold leading-6 text-primary hover:text-secondary">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
        
        {/* Terminal mock */}
        <div className="mt-16 sm:mt-24 w-full max-w-4xl mx-auto rounded-lg surface-secondary border-default shadow-lg overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-default bg-[#0d1117]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#f85149]"></div>
              <div className="w-3 h-3 rounded-full bg-[#d29922]"></div>
              <div className="w-3 h-3 rounded-full bg-[#238636]"></div>
            </div>
            <div className="ml-4 text-xs text-secondary font-mono">medev-cli</div>
          </div>
          <div className="p-6 text-left font-mono text-sm text-primary overflow-x-auto">
            <p className="text-secondary">$ medev profile sync --github MrSgemaSeny</p>
            <p className="text-[#2ea043] mt-1">✔ Successfully synced 14 repositories</p>
            <p className="text-[#2ea043]">✔ Generated skills graph</p>
            <p className="text-secondary mt-4">$ medev resume generate --target "Senior Backend Engineer"</p>
            <p className="text-[#79c0ff] mt-1">AI Agent analyzing GitHub commits and PRs...</p>
            <p className="text-[#2ea043] mt-1">✔ Resume generated: resume_backend.pdf</p>
          </div>
        </div>
      </div>
    </section>
  );
};
