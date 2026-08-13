import { useEffect, useState, useRef } from 'react';
import { useProfile, useUpdateProfile, useParseResume } from '../../../shared/api/hooks/useProfile';
import { useGenerateSummary } from '../../ai/hooks/useAiGenerate';
import { Upload, Sparkles, Check } from 'lucide-react';
import { useAuthStore } from '../../../entities/user/model/store';

export const AboutSection = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const parseResume = useParseResume();
  const { generateSummary, isGenerating } = useGenerateSummary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const username = useAuthStore(s => s.username);
  
  const [formData, setFormData] = useState({
    fullName: '', headline: '', summary: '', location: '',
    website: '', githubUsername: '', linkedin: '',
  });

  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '', headline: profile.headline || '',
        summary: profile.summary || '', location: profile.location || '',
        website: profile.website || '', githubUsername: profile.githubUsername || '',
        linkedin: profile.linkedin || '',
      });
    }
  }, [profile]);

  if (isLoading) return <div className="text-secondary text-[13px]">Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseResume.mutate(e.target.files[0], {
        onSuccess: (data) => {
          setFormData((prev) => ({
            ...prev,
            fullName: data.fullName ?? prev.fullName,
            headline: data.headline ?? prev.headline,
            summary: data.summary ?? prev.summary,
            location: data.location ?? prev.location,
            website: data.website ?? prev.website,
            githubUsername: data.githubUsername ?? prev.githubUsername,
            linkedin: data.linkedin ?? prev.linkedin,
          }));
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || "Failed to parse resume");
        }
      });
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const summary = await generateSummary('ru');
      if (summary) {
        setFormData((prev) => ({ ...prev, summary }));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate summary");
    }
  };

  return (
    <div className="flex flex-col gap-0 w-full max-w-[800px]">
      
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-[var(--color-border-default)]">
        <div>
          <h1 className="text-[17px] font-medium text-primary mb-1">About you</h1>
          <p className="text-[13px] text-secondary">Shown on your public profile and resume.</p>
        </div>
        <div>
          <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parseResume.isPending}
            className="inline-flex items-center gap-2 text-[12px] px-3 py-2 rounded-md border border-[var(--color-border-default)] surface-secondary text-secondary hover:surface-tertiary hover:text-primary transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} />
            {parseResume.isPending ? 'Parsing...' : 'Import from PDF'}
            <span className="text-[10px] py-0.5 px-1 bg-[var(--bg-pro)] text-[var(--text-pro)] border border-[var(--border-pro)] rounded font-medium tracking-wide ml-1">Pro</span>
          </button>
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-medium shrink-0" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <strong className="text-[14px] text-primary font-medium">{formData.fullName || username}</strong>
          <p className="text-[12px] text-secondary mt-0.5">{formData.headline || 'No headline set'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* Basic info */}
        <div className="text-[11px] font-semibold text-muted tracking-widest uppercase mb-3">Basic info</div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-medium tracking-wide uppercase">Full name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-[11px] text-muted font-medium tracking-wide uppercase">Headline</label>
            <input name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Full-Stack Engineer" className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-medium tracking-wide uppercase">Location</label>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-medium tracking-wide uppercase">Website</label>
            <input name="website" value={formData.website} onChange={handleChange} placeholder="https://" className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-medium tracking-wide uppercase">GitHub</label>
            <input name="githubUsername" value={formData.githubUsername} onChange={handleChange} placeholder="github.com/username" className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted" />
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-6" />

        {/* Summary */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-[11px] font-semibold text-muted tracking-widest uppercase m-0">Summary</div>
          <button 
            type="button" 
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 text-[11px] py-1 px-2 rounded-md border border-[var(--color-border-default)] surface-secondary text-secondary hover:surface-tertiary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={13} />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <div className="flex flex-col gap-1 mb-6">
          <textarea 
            name="summary" 
            value={formData.summary} 
            onChange={handleChange} 
            rows={3} 
            className="surface-inset border border-default rounded-md py-2 px-3 text-[13px] text-primary w-full outline-none focus:border-[var(--color-accent)] hover:border-[var(--color-border-muted)] transition-colors placeholder:text-muted resize-none leading-relaxed"
          />
          <div className="text-[11px] text-muted text-right mt-1">
            <span style={{ color: formData.summary.length > 600 ? 'var(--color-danger)' : '' }}>{formData.summary.length}</span> / 600
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-6" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="py-2 px-4 rounded-md border-none bg-[var(--color-accent)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <button 
            type="button"
            className="py-2 px-4 rounded-md border border-[var(--color-border-default)] bg-transparent text-secondary text-[13px] cursor-pointer hover:surface-secondary hover:text-primary transition-colors"
          >
            Discard
          </button>
          {toastVisible && (
            <span className="inline-flex items-center gap-2 text-[12px] text-[#4ade80] ml-2">
              <Check size={14} />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
