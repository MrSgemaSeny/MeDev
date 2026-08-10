import { useEffect, useState } from 'react';
import { useProfile, useUpdateProfile } from '../../../shared/api/hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label } from '../../../shared/ui/Form';
import { useAiGenerate } from '../../ai/hooks/useAiGenerate';

export const AboutSection = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { generate, isGenerating } = useAiGenerate();

  const [formData, setFormData] = useState({
    fullName: '', headline: '', summary: '', location: '',
    website: '', githubUrl: '', linkedinUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '', headline: profile.headline || '',
        summary: profile.summary || '', location: profile.location || '',
        website: profile.website || '', githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
      });
    }
  }, [profile]);

  if (isLoading) return <div className="text-secondary">Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleGenerateSummary = async () => {
    setFormData((prev) => ({ ...prev, summary: '' }));
    await generate(
      "Сгенерируй профессиональное summary для резюме на основе моего профиля. Максимум 3 предложения. Фокус на стеке и ключевых проектах.",
      (token) => {
        setFormData((prev) => ({ ...prev, summary: prev.summary + token }));
      }
    );
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>About You</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Full-Stack Engineer" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="summary" className="mb-0">Summary</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}
            >
              ✨ {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <Textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" value={formData.website} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="githubUrl">GitHub</Label>
            <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input id="linkedinUrl" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} />
          </div>
        </div>
        <div className="pt-1">
          <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
