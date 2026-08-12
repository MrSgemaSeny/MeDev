import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isNowDark = html.classList.contains('dark');
    localStorage.theme = isNowDark ? 'dark' : 'light';
    setIsDark(isNowDark);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300 min-h-screen">
      <style>{`
        .glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 12px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .fade-in { animation: fadeIn .6s ease-out both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: all .2s ease; }
        .card-hover:hover { border-color: #171717; transform: translateY(-2px); }
        .dark .card-hover:hover { border-color: #e5e5e5; }
        .repo-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .dark .repo-row { border-bottom-color: #262626; }
        .repo-row:last-child { border-bottom: none; }
        .lang-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1.5px; background: #171717; transition: width .25s ease; }
        .dark .nav-link::after { background: #e5e5e5; }
        .nav-link:hover::after { width: 100%; }
        .btn-primary-lp { position: relative; overflow: hidden; }
        .btn-primary-lp::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent); transition: left .5s ease; }
        .btn-primary-lp:hover::before { left: 100%; }
        .scroll-reveal { opacity: 0; transform: translateY(24px); transition: all .6s ease-out; }
        .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
        .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06); }
        .dark .mock-window { box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.2); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-2.5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-neutral-900 dark:text-white">
                      <path d="M16.53 15.06c.42.04.75.4.75.83s-.33.78-.75.83h-4.53a.83.83 0 0 1 0-1.66h4.53Z" fill="currentColor"/>
                      <path d="M6.97 7.52a.83.83 0 0 1 1.17 0l2.68 2.68a.83.83 0 0 1 0 1.18L8.14 14.09a.83.83 0 1 1-1.18-1.18l2.68-2.68-2.68-2.68a.83.83 0 0 1 0-1.18Z" fill="currentColor"/>
                      <path fillRule="evenodd" d="M17 3.1A3.9 3.9 0 0 1 20.9 7v10a3.9 3.9 0 0 1-3.9 3.9H7A3.9 3.9 0 0 1 3.1 17V7A3.9 3.9 0 0 1 7 3.1h10ZM7 4.9A2.1 2.1 0 0 0 4.9 7v10A2.1 2.1 0 0 0 7 19.1h10A2.1 2.1 0 0 0 19.1 17V7A2.1 2.1 0 0 0 17 4.9H7Z" fill="currentColor"/>
                  </svg>
                  <span className="text-xl font-bold tracking-tight">MeDev</span>
              </a>
              <nav className="hidden md:flex items-center gap-8">
                  <a href="#features" className="nav-link text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Features</a>
                  <a href="#how" className="nav-link text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">How it works</a>
                  <a href="#pricing" className="nav-link text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Pricing</a>
                  <a href="#demo" className="nav-link text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Demo</a>
              </nav>
              <div className="flex items-center gap-3">
                  <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" aria-label="Toggle theme">
                      {!isDark ? (
                          <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>
                      ) : (
                          <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
                      )}
                  </button>
                  <Link to="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-85 transition-opacity">Get Started</Link>
              </div>
          </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 mb-8">
                  <span className="glow-dot"></span>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Production-Ready MVP</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
                  One profile.<br/>
                  <span className="text-neutral-400 dark:text-neutral-600">Everywhere.</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed">
                  Connect GitHub. Let AI build your profile. Export PDF resumes and public portfolios instantly. Write once — use everywhere.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                  <a href="#demo" className="btn-primary-lp inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:opacity-85 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg>
                      Try Demo
                  </a>
                  <a href="https://github.com/MrSgemaSeny/MeDev" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-900 dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      View on GitHub
                  </a>
              </div>
          </div>

          {/* Stats */}
          <div className="max-w-2xl mx-auto mt-20 grid grid-cols-3 gap-8 py-8 border-y border-neutral-200 dark:border-neutral-800 fade-in" style={{ animationDelay: '.15s' }}>
              <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">12k+</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-medium">Developers</div>
              </div>
              <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">89k</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-medium">Repos Parsed</div>
              </div>
              <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">4.9</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-medium">Rating</div>
              </div>
          </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 scroll-reveal">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">How it works</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">Three steps to your perfect developer profile.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 card-hover">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-5">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
                      </div>
                      <div className="text-xs font-bold text-neutral-400 dark:text-neutral-600 mb-2">STEP 1</div>
                      <h3 className="text-lg font-bold mb-2">Connect GitHub</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">One-click OAuth2 login. We automatically parse your repositories, stars, languages, and contribution history.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 card-hover" style={{ transitionDelay: '.1s' }}>
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-5">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"/></svg>
                      </div>
                      <div className="text-xs font-bold text-neutral-400 dark:text-neutral-600 mb-2">STEP 2</div>
                      <h3 className="text-lg font-bold mb-2">AI Generates</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Groq AI with streaming SSE responses writes project descriptions, experience summaries, and analyzes your GitHub stats.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 card-hover" style={{ transitionDelay: '.2s' }}>
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-5">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                      </div>
                      <div className="text-xs font-bold text-neutral-400 dark:text-neutral-600 mb-2">STEP 3</div>
                      <h3 className="text-lg font-bold mb-2">Export Anywhere</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">PDF resume or public web portfolio — drag & drop sections with dnd-kit to customize layout and visibility.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 scroll-reveal">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Everything you need</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">Built for developers who hate writing resumes.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">GitHub Integration</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">OAuth2 one-click login. Auto-import repos, stars, languages, and contribution graphs.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover" style={{ transitionDelay: '.05s' }}>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">AI-Powered Generation</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Groq AI with streaming SSE responses. Auto-generates descriptions, summaries, and stats analysis.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover" style={{ transitionDelay: '.1s' }}>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">PDF Resume Builder</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">ATS-friendly PDF export. Drag & drop sections with dnd-kit. Customize order and visibility.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover" style={{ transitionDelay: '.15s' }}>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">Live Portfolio</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Public web portfolio auto-generated from your profile. Custom domain ready.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover" style={{ transitionDelay: '.2s' }}>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">Resume Parsing</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Upload existing PDF — AI extracts data and populates your profile automatically. Pro feature.</p>
                  </div>
                  <div className="scroll-reveal p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover" style={{ transitionDelay: '.25s' }}>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>
                      </div>
                      <h3 className="font-bold mb-1.5">Security First</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Bucket4j rate limiting, stateless JWT, Redis refresh tokens, strict CORS. Enterprise-grade.</p>
                  </div>
              </div>

              {/* Tech Stack */}
              <div className="scroll-reveal mt-10 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-neutral-400 dark:text-neutral-600">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Java 17</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Spring Boot 3.3</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">PostgreSQL</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Redis</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">React 19</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">TypeScript</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Vite</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Tailwind v4</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Zustand</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">React Query</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Stripe</span>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">Groq AI</span>
                  </div>
              </div>
          </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14 scroll-reveal">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Simple pricing</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">Start free. Upgrade when you need AI superpowers.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                  <div className="scroll-reveal p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 card-hover">
                      <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Free</div>
                      <div className="text-5xl font-extrabold mb-1">$0</div>
                      <div className="text-sm text-neutral-400 dark:text-neutral-600 mb-7">Forever</div>
                      <ul className="space-y-3.5 mb-8">
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>GitHub OAuth</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Public Portfolio</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Basic PDF Export</li>
                          <li className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>AI Generation</li>
                          <li className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>Resume Parsing</li>
                      </ul>
                      <Link to="/login" className="block text-center w-full py-2.5 text-sm font-semibold border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-900 dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">Get Started</Link>
                  </div>
                  <div className="scroll-reveal p-7 rounded-2xl border-2 border-neutral-900 dark:border-white bg-white dark:bg-neutral-950 card-hover relative" style={{ transitionDelay: '.1s' }}>
                      <div className="absolute -top-3 right-6 px-3 py-1 text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md">PRO</div>
                      <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Pro</div>
                      <div className="text-5xl font-extrabold mb-1">$9</div>
                      <div className="text-sm text-neutral-400 dark:text-neutral-600 mb-7">/ month</div>
                      <ul className="space-y-3.5 mb-8">
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Everything in Free</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Unlimited AI Generations</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>AI Resume Parsing</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Custom Domain</li>
                          <li className="flex items-center gap-3 text-sm"><svg className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Priority Support</li>
                      </ul>
                      <Link to="/login" className="btn-primary-lp block text-center w-full py-2.5 text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:opacity-85 transition-all">Upgrade to Pro</Link>
                  </div>
              </div>
          </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14 scroll-reveal">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Live Preview</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">This is how your portfolio looks after connecting GitHub.</p>
              </div>
              <div className="scroll-reveal mock-window rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="ml-3 text-xs text-neutral-400 font-mono">medev.io/@sgemaseny</span>
                  </div>
                  <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                          </div>
                          <div>
                              <div className="text-xl sm:text-2xl font-bold">MrSgemaSeny</div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Full-stack Developer · Java & React</div>
                              <div className="flex gap-5 mt-3">
                                  <span className="text-xs text-neutral-400"><strong className="text-neutral-900 dark:text-white">47</strong> repos</span>
                                  <span className="text-xs text-neutral-400"><strong className="text-neutral-900 dark:text-white">1.2k</strong> stars</span>
                                  <span className="text-xs text-neutral-400"><strong className="text-neutral-900 dark:text-white">342</strong> commits</span>
                              </div>
                          </div>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">Building developer tools that save time. Passionate about clean architecture, modular monoliths, and AI-powered workflows.</p>
                      <div className="flex flex-wrap gap-2 mb-8">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">Java</span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">Spring Boot</span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">React</span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">TypeScript</span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">PostgreSQL</span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">Docker</span>
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-4">Top Repositories</h4>
                      <div>
                          <div className="repo-row">
                              <div className="flex items-center gap-3">
                                  <span className="lang-dot bg-blue-500"></span>
                                  <span className="text-sm font-semibold">MeDev</span>
                              </div>
                              <span className="text-xs text-neutral-400 font-mono">⭐ 234 · Java</span>
                          </div>
                          <div className="repo-row">
                              <div className="flex items-center gap-3">
                                  <span className="lang-dot bg-amber-500"></span>
                                  <span className="text-sm font-semibold">api-gateway</span>
                              </div>
                              <span className="text-xs text-neutral-400 font-mono">⭐ 89 · TypeScript</span>
                          </div>
                          <div className="repo-row">
                              <div className="flex items-center gap-3">
                                  <span className="lang-dot bg-emerald-500"></span>
                                  <span className="text-sm font-semibold">dev-utils</span>
                              </div>
                              <span className="text-xs text-neutral-400 font-mono">⭐ 156 · Go</span>
                          </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                              Download PDF
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-900 dark:hover:border-white transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
                              Share
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-900 dark:text-white">
                      <path d="M16.53 15.06c.42.04.75.4.75.83s-.33.78-.75.83h-4.53a.83.83 0 0 1 0-1.66h4.53Z" fill="currentColor"/>
                      <path d="M6.97 7.52a.83.83 0 0 1 1.17 0l2.68 2.68a.83.83 0 0 1 0 1.18L8.14 14.09a.83.83 0 1 1-1.18-1.18l2.68-2.68-2.68-2.68a.83.83 0 0 1 0-1.18Z" fill="currentColor"/>
                      <path fillRule="evenodd" d="M17 3.1A3.9 3.9 0 0 1 20.9 7v10a3.9 3.9 0 0 1-3.9 3.9H7A3.9 3.9 0 0 1 3.1 17V7A3.9 3.9 0 0 1 7 3.1h10ZM7 4.9A2.1 2.1 0 0 0 4.9 7v10A2.1 2.1 0 0 0 7 19.1h10A2.1 2.1 0 0 0 19.1 17V7A2.1 2.1 0 0 0 17 4.9H7Z" fill="currentColor"/>
                  </svg>
                  <span className="text-sm font-bold">MeDev</span>
              </div>
              <div className="text-xs text-neutral-400 dark:text-neutral-600">
                  Built with Java 17, Spring Boot, React 19 & Groq AI. Open source on <a href="https://github.com/MrSgemaSeny/MeDev" target="_blank" rel="noreferrer" className="underline hover:text-neutral-900 dark:hover:text-white transition-colors">GitHub</a>.
              </div>
          </div>
      </footer>
    </div>
  );
};
