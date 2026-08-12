import { useEffect, useState, useRef } from 'react';
import { useProfile, useUpdateProfile, useParseResume } from '../../../shared/api/hooks/useProfile';
import { useGenerateSummary } from '../../ai/hooks/useAiGenerate';
import { Upload, Camera, Sparkles, Check } from 'lucide-react';
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
    website: '', githubUrl: '', linkedinUrl: '',
  });

  const [toastVisible, setToastVisible] = useState(false);

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
          setFormData((prev) => ({ ...prev, ...data }));
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
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-[var(--color-border-default)]">
        <div>
          <h1 className="text-[17px] font-medium text-primary mb-[2px]">About you</h1>
          <p className="text-[13px] text-secondary">Shown on your public profile and resume.</p>
        </div>
        <div>
          <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parseResume.isPending}
            className="inline-flex items-center gap-[6px] text-[12px] px-[11px] py-[6px] rounded-md border border-[var(--color-border-strong)] bg-surface-1 text-secondary hover:bg-surface-2 hover:text-primary transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} />
            {parseResume.isPending ? 'Parsing...' : 'Import from PDF'}
            <span className="text-[10px] py-[2px] px-[5px] bg-[var(--bg-pro)] text-[var(--text-pro)] border border-[var(--border-pro)] rounded-[4px] font-medium tracking-[0.03em] ml-1">Pro</span>
          </button>
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-[14px] mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-muted)] border-[0.5px] border-[var(--border-accent)] flex items-center justify-center text-[16px] font-medium text-accent shrink-0">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <strong className="text-[14px] text-primary font-medium">{formData.fullName || username}</strong>
          <p className="text-[12px] text-secondary mt-[1px]">{formData.headline || 'No headline set'}</p>
          <button type="button" className="text-[12px] text-accent mt-1 inline-flex items-center gap-1 bg-transparent border-none p-0 hover:underline cursor-pointer">
            <Camera size={13} />
            Upload photo
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* Basic info */}
        <div className="text-[10px] font-medium text-muted tracking-[0.08em] uppercase mb-[10px]">Basic info</div>
        <div className="grid grid-cols-3 gap-[10px] mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">Full name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">Headline</label>
            <input name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Full-Stack Engineer" className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">Location</label>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">Website</label>
            <input name="website" value={formData.website} onChange={handleChange} placeholder="https://" className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">GitHub</label>
            <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="github.com/username" className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted" />
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-5" />

        {/* Summary */}
        <div className="flex justify-between items-center mb-[6px]">
          <div className="text-[10px] font-medium text-muted tracking-[0.08em] uppercase m-0">Summary</div>
          <button 
            type="button" 
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="inline-flex items-center gap-[5px] text-[11px] py-[4px] px-[9px] rounded-[5px] border border-[var(--border-accent)] bg-[var(--color-accent-muted)] text-accent hover:bg-[rgba(59,130,246,0.18)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={13} />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <div className="flex flex-col gap-1 mb-5">
          <textarea 
            name="summary" 
            value={formData.summary} 
            onChange={handleChange} 
            rows={3} 
            className="bg-surface-1 border border-[var(--color-border-strong)] rounded-md py-[7px] px-[10px] text-[13px] text-primary w-full outline-none focus:border-[var(--border-accent)] focus:bg-[var(--color-bg-tertiary)] transition-colors placeholder:text-muted resize-none leading-[1.6]"
          />
          <div className="text-[11px] text-muted text-right mt-[3px]">
            <span style={{ color: formData.summary.length > 600 ? 'var(--color-danger)' : '' }}>{formData.summary.length}</span> / 600
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-5" />

        {/* Actions */}
        <div className="flex items-center gap-[10px]">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="py-[8px] px-[18px] rounded-md border-none bg-[var(--color-accent)] text-white text-[13px] font-medium cursor-pointer hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <button 
            type="button"
            className="py-[8px] px-[14px] rounded-md border border-[var(--color-border-strong)] bg-transparent text-secondary text-[13px] cursor-pointer hover:bg-surface-1 hover:text-primary transition-colors"
          >
            Discard
          </button>
          {toastVisible && (
            <span className="inline-flex items-center gap-[6px] text-[12px] text-[#4ade80] ml-1">
              <Check size={14} />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
