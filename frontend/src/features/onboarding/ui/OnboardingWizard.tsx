import { useState, useRef } from 'react';
import { useOnboarding } from '../api/useOnboarding';
import { GithubImport } from '../../github/GithubImport';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Field } from '../../../shared/ui/Form';
import { useParseResume } from '../../../shared/api/hooks/useProfile';
import { UploadCloud, FileText } from 'lucide-react';

export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [stack, setStack] = useState('');
  const [recentExperience, setRecentExperience] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: submitOnboarding, isPending } = useOnboarding();
  const { mutate: parseResume, isPending: isParsing } = useParseResume();

  const handleGenerate = () => {
    submitOnboarding({ role, stack, recentExperience }, {
      onSuccess: () => {
        setStep(4); // Proceed to GitHub sync step
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseResume(file, {
        onSuccess: () => {
          setStep(4); // Skip manual steps and go straight to GitHub sync
        },
        onError: (err) => {
          console.error(err);
          alert('Failed to parse resume. Please try filling manually.');
        }
      });
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-inset)] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success,auto)] shadow-[0_0_8px_var(--color-success,auto)] animate-pulse"></span>
            <span className="text-xs font-semibold text-secondary tracking-wide uppercase">Zero-Input Setup</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-primary leading-tight">
            Build your portfolio in <span className="text-[var(--color-success,auto)]">seconds</span>.
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto">
            Upload your existing resume and let our AI instantly extract your experience, skills, and education. No manual typing required.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div 
            className="group relative border-2 border-dashed border-[var(--color-border-default)] rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-inset)] hover:border-[var(--color-success,auto)] transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(35,134,54,0.1)]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            {isParsing ? (
              <div className="text-[var(--color-success,auto)] animate-pulse flex flex-col items-center">
                <FileText size={64} className="mb-6 opacity-90" />
                <h3 className="text-xl font-bold mb-2">AI is analyzing your resume...</h3>
                <p className="text-sm opacity-80">Extracting skills, experience, and projects. Please wait.</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-[var(--color-bg-inset)] border border-[var(--color-border-default)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[var(--color-success,auto)] transition-all duration-300">
                  <UploadCloud size={32} className="text-secondary group-hover:text-[var(--color-success,auto)] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Upload Resume or LinkedIn Export</h3>
                <p className="text-sm text-secondary mb-6 max-w-sm">
                  We support PDF, DOC, and DOCX files up to 5MB. Your data is processed securely and never stored permanently.
                </p>
                <Button variant="primary" size="lg" type="button" className="pointer-events-none rounded-xl px-8 shadow-md">
                  Select File
                </Button>
              </>
            )}
          </div>
          
          <div className="relative flex py-8 items-center justify-center opacity-60">
            <div className="w-24 border-t border-[var(--color-border-default)]"></div>
            <span className="mx-4 text-secondary text-xs uppercase font-bold tracking-widest">Or</span>
            <div className="w-24 border-t border-[var(--color-border-default)]"></div>
          </div>
          
          <div className="text-center">
            <button 
              type="button"
              disabled={isParsing}
              onClick={() => setStep(2)}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-[var(--color-border-default)] hover:decoration-primary disabled:opacity-50"
            >
              I don't have a resume, fill manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-primary">Manual Setup</h2>
          <p className="text-secondary mb-6 text-sm leading-relaxed">Select a template or type your own role to get started.</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { role: 'Frontend Engineer', stack: 'React, TypeScript, Tailwind, Vite' },
              { role: 'Backend Engineer', stack: 'Java, Spring Boot, PostgreSQL, Docker' },
              { role: 'Full-Stack Engineer', stack: 'React, Node.js, TypeScript, SQL' },
              { role: 'DevOps Engineer', stack: 'Kubernetes, AWS, Terraform, CI/CD' }
            ].map(t => (
              <button 
                key={t.role}
                type="button"
                className="text-xs font-medium px-4 py-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:border-[var(--color-success,auto)] hover:text-primary transition-all shadow-sm"
                onClick={() => { setRole(t.role); setStack(t.stack); }}
              >
                {t.role}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <Field label="Current Role">
              <Input 
                placeholder="e.g. Senior Frontend Engineer" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="text-lg py-6"
              />
            </Field>
            
            <Field label="Tech Stack">
              <Input 
                placeholder="e.g. React, TypeScript, Next.js, Tailwind" 
                value={stack} 
                onChange={e => setStack(e.target.value)} 
                className="text-lg py-6"
              />
            </Field>
            
            <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--color-border-default)]">
              <Button variant="outline" onClick={() => setStep(1)} className="px-6">Back</Button>
              <Button 
                variant="primary" 
                className="flex-1 text-base font-semibold shadow-md"
                disabled={!role || !stack}
                onClick={() => setStep(3)}
              >
                Continue <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-primary">Your Experience</h2>
          <p className="text-secondary mb-8 text-sm leading-relaxed">Briefly describe your most recent job. Our AI will transform it into professional, ATS-friendly bullet points.</p>
          
          <div className="space-y-6">
            <Field label="Recent Experience">
              <Textarea 
                rows={6}
                placeholder="e.g. Worked at Acme Corp for 2 years building the new checkout flow using React and Stripe. Improved conversion by 15% and mentored junior devs." 
                value={recentExperience} 
                onChange={e => setRecentExperience(e.target.value)} 
                className="text-base resize-none"
              />
            </Field>
            
            <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--color-border-default)]">
              <Button variant="outline" onClick={() => setStep(2)} className="px-6">Back</Button>
              <Button 
                variant="primary" 
                className="flex-1 text-base font-semibold shadow-md relative overflow-hidden group"
                disabled={!recentExperience || isPending}
                onClick={handleGenerate}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {isPending ? 'AI is writing...' : 'Generate Profile with AI 🪄'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success,auto)]/20 text-[var(--color-success,auto)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-primary">Profile Generated!</h2>
          <p className="text-secondary mb-8 text-sm max-w-sm mx-auto">Now, let's sync your open-source projects from GitHub to complete your ultimate developer portfolio.</p>
          
          <div className="text-left bg-[var(--color-bg-inset)] p-6 rounded-xl border border-[var(--color-border-default)] mb-8">
            <GithubImport />
          </div>
          
          <Button variant="outline" className="w-full text-sm font-semibold" onClick={onComplete}>
            Skip for now / Finish Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
