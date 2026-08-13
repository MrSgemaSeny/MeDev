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
    <Modal isOpen={isOpen} onClose={() => {}} title="Welcome to MeDev!">
      <div className="p-2 w-[500px] max-w-full">
        <div className="mb-6 flex justify-between items-center text-sm font-medium text-secondary">
          <span className={step === 1 ? 'text-primary' : ''}>1. Role</span>
          <span className={step === 2 ? 'text-primary' : ''}>2. Stack</span>
          <span className={step === 3 ? 'text-primary' : ''}>3. Experience</span>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-primary mb-2">What is your primary role?</h3>
                <p className="text-sm text-secondary">This will be used to tailor your profile and AI generation.</p>
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
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-primary mb-2">What is your tech stack?</h3>
                <p className="text-sm text-secondary">List the main technologies you work with.</p>
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
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-primary mb-2">Recent Experience</h3>
                <p className="text-sm text-secondary">Briefly describe your most recent role or project.</p>
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
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
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
