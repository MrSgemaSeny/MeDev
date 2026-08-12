import { useState } from 'react';
import { useOnboarding } from '../api/useOnboarding';
import { GithubImport } from '../../github/GithubImport';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Field } from '../../../shared/ui/Form';

export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [stack, setStack] = useState('');
  const [recentExperience, setRecentExperience] = useState('');
  
  const { mutate: submitOnboarding, isPending } = useOnboarding();

  const handleGenerate = () => {
    submitOnboarding({ role, stack, recentExperience }, {
      onSuccess: () => {
        setStep(3); // Proceed to GitHub sync step
      }
    });
  };

  if (step === 1) {
    return (
      <div className="p-6 max-w-lg mx-auto surface-secondary border border-default rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome to MeDev</h2>
        <p className="text-secondary mb-6 text-sm">Let's build your profile in seconds using AI. What do you do?</p>
        
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
          
          <Button 
            variant="primary" 
            className="w-full mt-4"
            disabled={!role || !stack}
            onClick={() => setStep(2)}
          >
            Next Step
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
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
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
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

  if (step === 3) {
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
