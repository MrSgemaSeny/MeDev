import { useState, useEffect } from 'react';
import { useOnboarding } from '../api/useOnboarding';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label } from '../../../shared/ui/Form';
import { Modal } from '../../../shared/ui/Modal';
import { useProfile } from '../../../shared/api/hooks/useProfile';

export const OnboardingWizard = () => {
  const { data: profile, isLoading } = useProfile();
  const onboardingMutation = useOnboarding();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    stack: '',
    recentExperience: '',
  });

  useEffect(() => {
    if (!isLoading && profile && profile.isOnboardingCompleted === false) {
      setIsOpen(true);
    }
  }, [profile, isLoading]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardingMutation.mutate(formData, {
      onSuccess: () => setIsOpen(false),
      onError: (err) => {
        console.error(err);
        alert('Failed to complete onboarding. Please try again.');
      }
    });
  };

  const handleSkip = () => {
    setIsOpen(false);
    // Ideally we should tell the backend that onboarding is completed/skipped so it doesn't pop up again.
    // Assuming the user can update their profile manually instead.
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title="Welcome to MeDev!">
      <div className="p-4 w-[500px] max-w-full">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: step >= s ? 'var(--color-accent)' : 'var(--color-border-default)'
              }}
            />
          ))}
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>What is your primary role?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>This helps us tailor your profile and AI suggestions.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer, Full-Stack Developer"
                  required
                  autoFocus
                  className="w-full"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>What is your tech stack?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>List the main technologies you work with.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stack">Tech Stack</Label>
                <Textarea
                  id="stack"
                  name="stack"
                  value={formData.stack}
                  onChange={handleChange}
                  placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                  required
                  rows={3}
                  autoFocus
                  className="w-full resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Recent Experience</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Briefly describe your most recent role or project.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recentExperience">Experience</Label>
                <Textarea
                  id="recentExperience"
                  name="recentExperience"
                  value={formData.recentExperience}
                  onChange={handleChange}
                  placeholder="e.g. Worked at Google as a Software Engineer for 3 years, building scalable microservices..."
                  required
                  rows={4}
                  autoFocus
                  className="w-full resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-10 pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={step === 1 ? handleSkip : handleBack}
            >
              {step === 1 ? 'Skip' : 'Back'}
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={onboardingMutation.isPending}
            >
              {onboardingMutation.isPending ? 'Generating...' : step === 3 ? 'Generate Profile' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
