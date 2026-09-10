import { useEffect, useState, useRef } from 'react';
import { useProfile, useUpdateProfile, useParseResume } from '../../../entities/profile/api/hooks';
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 pb-6 border-b border-[var(--color-border-default)]">
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
            aria-label="Импортировать данные из PDF-файла"
            className="inline-flex items-center gap-2 text-[12px] min-h-[44px] px-3 py-2 rounded-md border border-[var(--color-border-default)] surface-secondary text-secondary hover:surface-tertiary hover:text-primary focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} aria-hidden="true" />
            {parseResume.isPending ? 'Импорт...' : 'Импортировать из PDF'}
          </button>
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {profile?.githubUsername ? (
          <img 
            src={`https://github.com/${profile.githubUsername}.png`} 
            alt={`${formData.fullName || username || 'Пользователь'} — фото профиля`} 
            className="w-12 h-12 rounded-full border border-default object-cover shrink-0" 
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-medium shrink-0" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div className="flex flex-col">
          <strong className="text-[14px] text-primary font-medium">{formData.fullName || username}</strong>
          <p className="text-[12px] text-secondary mt-0.5">{formData.headline || 'No headline set'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* Basic info */}
        <div className="text-[11px] font-semibold text-muted tracking-widest uppercase mb-3">Основная информация</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-fullname" className="text-[11px] text-muted font-medium tracking-wide uppercase">Полное имя</label>
            <input 
              id="about-fullname" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] min-h-[44px] md:min-h-[38px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted" 
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="about-headline" className="text-[11px] text-muted font-medium tracking-wide uppercase">Заголовок / Профессия</label>
            <input 
              id="about-headline" 
              name="headline" 
              value={formData.headline} 
              onChange={handleChange} 
              placeholder="например, Full Stack Engineer | Java · Spring Boot · React" 
              className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] min-h-[44px] md:min-h-[38px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-location" className="text-[11px] text-muted font-medium tracking-wide uppercase">Город, Страна</label>
            <input 
              id="about-location" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="например, Shymkent, Kazakhstan · Remote" 
              className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] min-h-[44px] md:min-h-[38px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-website" className="text-[11px] text-muted font-medium tracking-wide uppercase">Веб-сайт / Портфолио</label>
            <input 
              id="about-website" 
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              placeholder="https://medev.mrsgemaseny.com" 
              className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] min-h-[44px] md:min-h-[38px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-github" className="text-[11px] text-muted font-medium tracking-wide uppercase">GitHub никнейм</label>
            <input 
              id="about-github" 
              name="githubUsername" 
              value={formData.githubUsername} 
              onChange={handleChange} 
              placeholder="логин на github.com" 
              className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] min-h-[44px] md:min-h-[38px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted" 
            />
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-6" />

        {/* Summary */}
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="about-summary" className="text-[11px] font-semibold text-muted tracking-widest uppercase m-0">О себе (Summary)</label>
          <button 
            type="button" 
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            aria-label="Сгенерировать краткое резюме с помощью искусственного интеллекта"
            className="inline-flex items-center gap-1.5 text-[11px] py-1 px-2 rounded-md border border-[var(--color-border-default)] surface-secondary text-secondary hover:surface-tertiary hover:text-primary focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={13} aria-hidden="true" />
            {isGenerating ? 'Генерация...' : 'Сгенерировать резюме через AI'}
          </button>
        </div>
        <div className="flex flex-col gap-1 mb-6">
          <textarea 
            id="about-summary"
            name="summary" 
            value={formData.summary} 
            onChange={handleChange} 
            rows={3} 
            className="surface-inset border border-default rounded-md py-2 px-3 text-[16px] md:text-[13px] text-primary w-full outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent hover:border-[var(--color-border-muted)] transition-all placeholder:text-muted resize-none leading-relaxed"
          />
          <div className="text-[11px] text-muted text-right mt-1">
            <span style={{ color: formData.summary.length > 600 ? 'var(--color-danger)' : '' }}>{formData.summary.length}</span> / 600
          </div>
        </div>

        <hr className="border-t border-[var(--color-border-default)] my-6" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="min-h-[44px] py-2 px-4 rounded-md border-none bg-[var(--color-accent)] text-white text-[14px] md:text-[13px] font-medium cursor-pointer hover:bg-[var(--color-accent-hover)] focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {updateProfile.isPending ? 'Сохранение...' : 'Сохранить изменения профиля'}
          </button>
          <button 
            type="button"
            onClick={() => {
              if (profile) {
                setFormData({
                  fullName: profile.fullName || '',
                  headline: profile.headline || '',
                  summary: profile.summary || '',
                  location: profile.location || '',
                  website: profile.website || '',
                  githubUsername: profile.githubUsername || '',
                  linkedin: profile.linkedin || '',
                });
              }
            }}
            className="min-h-[44px] py-2 px-4 rounded-md border border-[var(--color-border-default)] bg-transparent text-secondary text-[14px] md:text-[13px] cursor-pointer hover:surface-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none transition-colors flex items-center justify-center"
          >
            Отменить изменения
          </button>
          {toastVisible && (
            <span className="inline-flex items-center gap-2 text-[12px] text-[#4ade80] sm:ml-2 justify-center">
              <Check size={14} aria-hidden="true" />
              Сохранено
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
