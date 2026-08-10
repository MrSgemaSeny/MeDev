import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '../../../shared/api/hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { toast } from 'sonner';

export function AboutForm({ onClose }: { onClose: () => void }) {
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    summary: '',
    location: '',
    website: '',
    githubUsername: '',
    linkedin: '',
    telegram: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        location: profile.location || '',
        website: profile.website || '',
        githubUsername: profile.githubUsername || '',
        linkedin: profile.linkedin || '',
        telegram: profile.telegram || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData, {
      onSuccess: () => {
        toast.success('Profile updated');
        onClose();
      },
      onError: () => toast.error('Failed to update profile'),
    });
  };

  const inputClass = "w-full rounded-md px-3 py-2 text-sm transition-colors border focus:outline-none";
  const inputStyle = {
    backgroundColor: 'var(--color-bg-primary)',
    borderColor: 'var(--color-border-default)',
    color: 'var(--color-text-primary)'
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
      

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Headline</label>
          <input name="headline" value={formData.headline} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="Software Engineer" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Summary</label>
          <textarea name="summary" value={formData.summary} onChange={handleChange} rows={4} className={inputClass} style={inputStyle} placeholder="A short bio about yourself..." />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Location</label>
          <input name="location" value={formData.location} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="New York, USA" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Website</label>
          <input name="website" value={formData.website} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="https://johndoe.com" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>GitHub Username</label>
          <input name="githubUsername" value={formData.githubUsername} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="johndoe" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>LinkedIn Username</label>
          <input name="linkedin" value={formData.linkedin} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="johndoe" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Telegram</label>
          <input name="telegram" value={formData.telegram} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="@johndoe" />
        </div>
      </form>

      <div className="pt-4 border-t mt-auto flex justify-end" style={{ borderColor: 'var(--color-border-default)' }}>
        <Button onClick={handleSubmit} disabled={isPending} className="text-white px-6 font-medium" style={{ backgroundColor: 'var(--color-accent)' }}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
