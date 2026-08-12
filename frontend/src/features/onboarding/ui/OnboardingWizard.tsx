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
      <div className="p-6 max-w-lg mx-auto surface-secondary border border-default rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome to MeDev</h2>
        <p className="text-secondary mb-6 text-sm">The fastest way to build your portfolio is to upload your existing resume.</p>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-default rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
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
              <div className="text-[var(--color-accent)] animate-pulse">
                <FileText size={48} className="mx-auto mb-4 opacity-80" />
                <p className="font-medium">AI is analyzing your resume...</p>
                <p className="text-xs mt-1 opacity-70">This takes about 10-20 seconds.</p>
              </div>
            ) : (
              <>
                <UploadCloud size={48} className="text-secondary mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Upload Resume or LinkedIn Export</p>
                <p className="text-xs text-secondary mb-4">PDF, DOC, DOCX up to 5MB</p>
                <Button variant="outline" size="sm" type="button">Select File</Button>
              </>
            )}
          </div>
          
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-default"></div>
            <span className="flex-shrink-0 mx-4 text-secondary text-xs uppercase font-medium tracking-wider">or</span>
            <div className="flex-grow border-t border-default"></div>
          </div>
          
          <Button 
            variant="secondary" 
            className="w-full"
            disabled={isParsing}
            onClick={() => setStep(2)}
          >
            Fill manually using AI Assistant
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="p-6 max-w-lg mx-auto surface-secondary border border-default rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Manual Setup</h2>
        <p className="text-secondary mb-4 text-sm">Select a template or type your own role to get started.</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { role: 'Frontend Engineer', stack: 'React, TypeScript, Tailwind, Vite' },
            { role: 'Backend Engineer', stack: 'Java, Spring Boot, PostgreSQL, Docker' },
            { role: 'Full-Stack Engineer', stack: 'React, Node.js, TypeScript, SQL' },
            { role: 'DevOps Engineer', stack: 'Kubernetes, AWS, Terraform, CI/CD' }
          ].map(t => (
            <button 
              key={t.role}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full border border-default surface-secondary text-secondary hover:border-[var(--color-accent)] hover:text-primary transition-colors cursor-pointer"
              onClick={() => { setRole(t.role); setStack(t.stack); }}
            >
              {t.role}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Field label="Current Role">
            <Input 
              placeholder="e.g. Senior Frontend Engineer" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
            />
          </Field>
          
          <Field label="Tech Stack">
            <Input 
              placeholder="e.g. React, TypeScript, Next.js, Tailwind" 
              value={stack} 
              onChange={e => setStack(e.target.value)} 
            />
          </Field>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button 
              variant="primary" 
              className="flex-1"
              disabled={!role || !stack}
              onClick={() => setStep(3)}
            >
              Next Step
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="p-6 max-w-lg mx-auto surface-secondary border border-default rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Your Experience</h2>
        <p className="text-secondary mb-6 text-sm">Briefly describe your most recent job. The AI will turn this into professional bullet points.</p>
        
        <div className="space-y-4">
          <Field label="Recent Experience">
            <Textarea 
              rows={4}
              placeholder="e.g. Worked at Acme Corp building the new checkout flow using React and Stripe. Improved conversion by 15%." 
              value={recentExperience} 
              onChange={e => setRecentExperience(e.target.value)} 
            />
          </Field>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button 
              variant="primary" 
              className="flex-1"
              disabled={!recentExperience || isPending}
              onClick={handleGenerate}
            >
              {isPending ? 'Generating Profile...' : 'Generate Profile with AI'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="p-6 max-w-lg mx-auto surface-secondary border border-default rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Profile Generated!</h2>
        <p className="text-secondary mb-6 text-sm">Now, let's sync your open-source projects from GitHub to complete your portfolio.</p>
        
        <GithubImport />
        
        <Button variant="outline" className="w-full mt-6" onClick={onComplete}>
          Skip / Done
        </Button>
      </div>
    );
  }

  return null;
};
