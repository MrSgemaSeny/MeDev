import { useEffect, useState, useRef } from 'react';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';
import { api } from '../../shared/api/api';
import { useAiChatStore } from '../../features/ai-assistant/model/store';
import { useUpsellStore } from '../../entities/user/model/upsellStore';
import { toast } from 'sonner';
import { Bot, Download, ArrowUp, ArrowDown, FileText, Files, File, Settings } from 'lucide-react';
import { exportResumePdf } from '../../shared/lib/mobile/exportPdf';
import { useTranslation } from 'react-i18next';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const TEMPLATES = [
  { id: 'clean', name: 'Clean ATS', desc: 'Recruiter Classic', accent: '#1a1a1a', isPro: false },
  { id: 'github', name: 'GitHub', desc: 'Dev Standard', accent: '#238636', isPro: false },
  { id: 'milky-soft', name: 'Milky Soft', desc: 'Warm Indie', accent: '#d4b7a1', isPro: false },
  { id: 'apple-modern', name: 'Apple', desc: 'Minimalist', accent: '#0071e3', isPro: false },
  { id: 'grok-monolith', name: 'Grok', desc: 'Brutalist', accent: '#ffffff', isPro: false },
  { id: 'phub-orange', name: 'PH Orange', desc: 'High Contrast', accent: '#ff9900', isPro: false }
];

import { LocalErrorBoundary } from '../../shared/ui/LocalErrorBoundary';

const InnerResumeBuilder = () => {
  const { t } = useTranslation();
  const { sections, selectedTemplate, isSinglePageMode, setTemplate, setSinglePageMode, toggleSection, reorderSections } = useResumeEditorStore();
  const { openWithPrompt } = useAiChatStore();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const handleAiAnalysis = () => {
    openWithPrompt(t('builder.aiPrompt', "Проанализируй моё резюме: насколько оно привлекательно для работодателей? Чего не хватает?"));
  };

  const handleDownload = async () => {
    try {
      const { data } = await api.get('/profile/readme', { responseType: 'blob', headers: { Accept: 'text/markdown' } } as any);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = window.document.createElement('a');
      a.href = url;
      a.download = 'resume.md';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert('Resume export is not available yet.');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const { data } = await api.get(`/resume/generate/${selectedTemplate}?singlePage=${isSinglePageMode}`, { responseType: 'blob' });
      await exportResumePdf(new Blob([data], { type: 'application/pdf' }), `resume-${selectedTemplate}.pdf`);
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 429) {
        toast.error('Достигнут дневной лимит генерации резюме. Пожалуйста, обновитесь до PRO.');
        useUpsellStore.getState().openUpsell();
      } else {
        toast.error('Не удалось сгенерировать PDF.');
      }
    }
  };

  const handleDownloadHtml = async () => {
    try {
      const { data } = await api.get(`/resume/html/${selectedTemplate}?singlePage=${isSinglePageMode}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'text/html' }));
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `resume-${selectedTemplate}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 429) {
        toast.error('Достигнут дневной лимит генерации резюме. Пожалуйста, обновитесь до PRO.');
        useUpsellStore.getState().openUpsell();
      } else {
        toast.error('Не удалось сгенерировать HTML.');
      }
    }
  };

  const moveUp = (index: number) => { if (index > 0) reorderSections(index, index - 1); };
  const moveDown = (index: number) => { if (index < sections.length - 1) reorderSections(index, index + 1); };

  const [htmlDoc, setHtmlDoc] = useState<string | null>(null);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!previewWrapperRef.current) return;
      const containerWidth = previewWrapperRef.current.clientWidth;
      if (!containerWidth) return;
      const availableWidth = Math.max(containerWidth - 32, 260);
      const newScale = Math.min(1, availableWidth / A4_WIDTH);
      setPreviewScale(newScale);
    };

    updateScale();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && previewWrapperRef.current) {
      ro = new ResizeObserver(updateScale);
      ro.observe(previewWrapperRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let urlToRevoke: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const { data } = await api.get(`/resume/html/${selectedTemplate}?preview=true&singlePage=${isSinglePageMode}`, { responseType: 'text' });
        if (active) {
          setHtmlDoc(data);
          const blob = new Blob([data], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          urlToRevoke = url;
          setHtmlUrl(url);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setPreviewLoading(false);
      }
    };

    // Debounce the preview fetch to avoid spamming the backend
    timeoutId = setTimeout(() => {
      loadPreview();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (urlToRevoke) {
        window.URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [selectedTemplate, isSinglePageMode]);

  return (
    <div className="flex flex-col lg:flex-row h-full surface-inset text-primary overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center border-b border-default surface-primary p-2 gap-2 sticky top-0 z-30 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 min-h-[38px] flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'editor'
              ? 'surface-tertiary text-primary border border-default'
              : 'text-muted hover:text-primary'
          }`}
        >
          <Settings size={14} />
          {t('builder.mobileTabs.settings', 'Настройки')}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 min-h-[38px] flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'preview'
              ? 'surface-tertiary text-primary border border-default'
              : 'text-muted hover:text-primary'
          }`}
        >
          <FileText size={14} />
          {t('builder.mobileTabs.preview', 'Предпросмотр')}
          <span className="w-1.5 h-1.5 rounded-full bg-[#238636] animate-pulse"></span>
        </button>
      </div>

      {/* Left Sidebar */}
      <div className={`w-full lg:w-[320px] surface-primary border-b lg:border-b-0 lg:border-r border-default flex-col shrink-0 ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-default">
          <h1 className="text-lg font-semibold text-primary">{t('builder.title', 'Resume Builder')}</h1>
          <p className="text-xs text-muted mt-1">{t('builder.subtitle', 'Configure layout & appearance')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 sm:space-y-8">
          
          {/* Layout Mode */}
          <section className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{t('builder.pdfLayoutMode', 'PDF Layout Mode')}</h2>
              <span className="text-[10px] text-muted">{t('builder.toggleCompact', 'Toggle compact view')}</span>
            </div>
            <button
              onClick={() => setSinglePageMode(!isSinglePageMode)}
              className="relative flex items-center w-[72px] h-8 p-1 rounded-full bg-[#238636] cursor-pointer shadow-inner focus:outline-none transition-all duration-300 border border-[#2ea043]"
            >
              {/* Sliding Thumb (White) */}
              <span
                className={`absolute left-1 w-[32px] h-6 rounded-full bg-white shadow-md transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
                  isSinglePageMode ? 'translate-x-[30px]' : 'translate-x-0'
                }`}
              />
              
              {/* Left Icon (Multi-Page) */}
              <span className="relative z-10 flex flex-1 justify-center items-center h-full pointer-events-none">
                <Files size={14} className={`transition-colors duration-300 ${!isSinglePageMode ? 'text-[#238636]' : 'text-white'}`} strokeWidth={2.5} />
              </span>
              
              {/* Right Icon (1 Page) */}
              <span className="relative z-10 flex flex-1 justify-center items-center h-full pointer-events-none">
                <File size={14} className={`transition-colors duration-300 ${isSinglePageMode ? 'text-[#238636]' : 'text-white'}`} strokeWidth={2.5} />
              </span>
            </button>
          </section>

          {/* Templates Section */}
          <section>
            <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">{t('builder.templatesHeading', 'Templates')}</h2>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((tmpl) => {
                const isActive = selectedTemplate === tmpl.id;
                const tmplName = t(`builder.templateNames.${tmpl.id}`, tmpl.name);
                const tmplDesc = t(`builder.templateNames.${tmpl.id}Desc`, tmpl.desc);
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'surface-secondary border-[var(--color-accent)]' 
                        : 'surface-primary border-default hover:surface-secondary'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-secondary'}`}>
                          {tmplName}
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">{tmplDesc}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.accent }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sections Management */}
          <section>
            <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">{t('builder.sectionsManagement', 'Sections Content')}</h2>
            <div className="space-y-2">
              {sections.map((section, index) => {
                const sectionLabel = t(`builder.sectionNames.${section.id}`, section.label);
                return (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-2.5 rounded-md surface-secondary border border-default group"
                  >
                    <label className="flex items-center gap-3 text-sm cursor-pointer select-none text-secondary group-hover:text-primary transition-colors">
                      <input 
                        type="checkbox" 
                        checked={section.visible} 
                        onChange={() => toggleSection(section.id)} 
                        className="w-4 h-4 rounded border-default bg-[var(--color-bg-primary)] checked:bg-[#238636] checked:border-[#238636] focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative
                          before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+')] 
                          before:bg-center before:bg-no-repeat before:scale-0 checked:before:scale-[0.6] before:transition-transform"
                      />
                      {sectionLabel}
                    </label>
                    <div className="flex gap-1 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => moveUp(index)} 
                        disabled={index === 0} 
                        aria-label={`Move ${sectionLabel} up`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:surface-tertiary text-muted hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        onClick={() => moveDown(index)} 
                        disabled={index === sections.length - 1} 
                        aria-label={`Move ${sectionLabel} down`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:surface-tertiary text-muted hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-default surface-primary space-y-3">
          <button 
            onClick={handleAiAnalysis}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 surface-secondary hover:surface-tertiary border border-default text-secondary hover:text-primary py-2.5 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer"
          >
            <Bot size={16} />
            {t('builder.aiReview', 'AI Analysis')}
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white py-2.5 px-3 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Download size={14} />
              {t('builder.downloadPdf', 'PDF')}
            </button>
            <button 
              onClick={handleDownloadHtml}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white py-2.5 px-3 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <FileText size={14} />
              {t('builder.downloadHtml', 'HTML')}
            </button>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-transparent hover:underline text-muted hover:text-[var(--color-accent)] py-2 px-4 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <FileText size={14} />
            {t('builder.downloadMarkdown', 'Download Markdown (README)')}
          </button>
        </div>
      </div>

      {/* Main Content - Scaled PDF Viewer */}
      <div className={`flex-1 flex-col p-2.5 sm:p-6 lg:p-8 overflow-y-auto relative ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Top bar for preview */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-lg font-medium text-primary">{t('builder.livePreview', 'Live PDF Preview')}</h2>
            <button
              onClick={() => setMobileTab('editor')}
              className="lg:hidden text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              {t('builder.mobileTabs.settings', 'Настройки')}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="lg:hidden flex items-center gap-1 bg-[#238636] hover:bg-[#2ea043] text-white py-1 px-2.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Download size={13} />
              {t('builder.export', 'Экспорт')}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full surface-secondary border border-default text-[11px] sm:text-xs text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-[#238636] animate-pulse"></span>
              Live
            </div>
          </div>
        </div>

        {/* Live Scaled Container with scroll support */}
        <div ref={previewWrapperRef} className="w-full flex justify-center items-start pb-16 lg:pb-24">
          <div 
            style={{
              width: `${A4_WIDTH}px`,
              height: `${A4_HEIGHT}px`,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: `-${(1 - previewScale) * A4_HEIGHT}px`,
            }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden border border-default shrink-0 transition-transform duration-150 ease-out flex flex-col"
          >
            {previewLoading ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted surface-primary">
                <div className="w-8 h-8 border-2 border-default border-t-[#238636] rounded-full animate-spin"></div>
                <div className="text-sm">{t('builder.previewLoading', 'Rendering HTML Template...')}</div>
              </div>
            ) : (htmlDoc || htmlUrl) ? (
              <iframe 
                srcDoc={htmlDoc || undefined} 
                src={htmlUrl || undefined} 
                className="w-full h-full border-0 bg-white" 
                title="HTML Preview" 
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted text-sm surface-primary">
                {t('builder.failedPreview', 'Failed to load preview')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResumeBuilder = () => (
  <LocalErrorBoundary>
    <InnerResumeBuilder />
  </LocalErrorBoundary>
);
