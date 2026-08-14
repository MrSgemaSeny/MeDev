import { useEffect, useState } from 'react';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';
import { api } from '../../shared/api/axios';
import { useAiChatStore } from '../../features/ai-assistant/model/store';
import { Bot, Download, ArrowUp, ArrowDown, FileText, Files, File } from 'lucide-react';

const TEMPLATES = [
  { id: 'github', name: 'GitHub', desc: 'Dev Standard', accent: '#238636' },
  { id: 'milky-soft', name: 'Milky Soft', desc: 'Warm Indie', accent: '#d4b7a1' },
  { id: 'apple-modern', name: 'Apple', desc: 'Minimalist', accent: '#0071e3' },
  { id: 'grok-monolith', name: 'Grok', desc: 'Brutalist', accent: '#ffffff' },
  { id: 'phub-orange', name: 'PH Orange', desc: 'High Contrast', accent: '#ff9900' }
];

export const ResumeBuilder = () => {
  const { sections, selectedTemplate, isSinglePageMode, setTemplate, setSinglePageMode, toggleSection, reorderSections } = useResumeEditorStore();
  const { toggleChat, isOpen } = useAiChatStore();

  const handleAiAnalysis = () => {
    if (!isOpen) toggleChat();
    setTimeout(() => {
      const chatWidget = document.querySelector('textarea[placeholder="Спроси о чём-нибудь..."]') as HTMLTextAreaElement;
      if (chatWidget) {
        const form = chatWidget.closest('form');
        if (form) {
          chatWidget.value = "Проанализируй моё резюме: насколько оно привлекательно для работодателей? Чего не хватает?";
          chatWidget.dispatchEvent(new Event('input', { bubbles: true }));
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    }, 300);
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
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = window.document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 429) {
        window.alert('Достигнут дневной лимит генерации резюме. Пожалуйста, обновитесь до PRO.');
      } else {
        window.alert('PDF export failed.');
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
      if (e.response && e.response.status === 429) {
        window.alert('Достигнут дневной лимит генерации резюме. Пожалуйста, обновитесь до PRO.');
      } else {
        window.alert('HTML export failed.');
      }
    }
  };

  const moveUp = (index: number) => { if (index > 0) reorderSections(index, index - 1); };
  const moveDown = (index: number) => { if (index < sections.length - 1) reorderSections(index, index + 1); };

  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let urlToRevoke: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const { data } = await api.get(`/resume/html/${selectedTemplate}?preview=true&singlePage=${isSinglePageMode}`, { responseType: 'blob' });
        if (active) {
          const url = window.URL.createObjectURL(new Blob([data], { type: 'text/html' }));
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
    <div className="flex h-full bg-[#010409] text-[#c9d1d9] overflow-hidden font-sans">
      
      {/* Left Sidebar - GitHub Dark Mode Style */}
      <div className="w-[320px] bg-[#0d1117] border-r border-[#30363d] flex flex-col shrink-0">
        
        {/* Header */}
        <div className="p-5 border-b border-[#30363d]">
          <h1 className="text-lg font-semibold text-white">Resume Builder</h1>
          <p className="text-xs text-[#8b949e] mt-1">Configure layout & appearance</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          
          {/* Layout Mode */}
          <section className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">PDF Layout Mode</h2>
            <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-md p-1">
              <button 
                onClick={() => setSinglePageMode(false)}
                className={`p-1.5 rounded-sm transition-colors ${!isSinglePageMode ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
                title="Multi-Page Layout"
              >
                <Files size={14} />
              </button>
              <button 
                onClick={() => setSinglePageMode(true)}
                className={`p-1.5 rounded-sm transition-colors ${isSinglePageMode ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
                title="1 Page (Compact) Layout"
              >
                <File size={14} />
              </button>
            </div>
          </section>

          {/* Templates Section */}
          <section>
            <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Templates</h2>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((t) => {
                const isActive = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#161b22] border-[#238636]' 
                        : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] hover:bg-[#161b22]'
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#c9d1d9]'}`}>
                        {t.name}
                      </div>
                      <div className="text-xs text-[#8b949e] mt-0.5">{t.desc}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>



          {/* Sections Management */}
          <section>
            <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Sections Content</h2>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-2.5 rounded-md bg-[#161b22] border border-[#30363d] group"
                >
                  <label className="flex items-center gap-3 text-sm cursor-pointer select-none text-[#c9d1d9] group-hover:text-white transition-colors">
                    <input 
                      type="checkbox" 
                      checked={section.visible} 
                      onChange={() => toggleSection(section.id)} 
                      className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] checked:bg-[#238636] checked:border-[#238636] focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative
                        before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+')] 
                        before:bg-center before:bg-no-repeat before:scale-0 checked:before:scale-[0.6] before:transition-transform"
                    />
                    {section.label}
                  </label>
                  <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0} 
                      className="p-1 rounded hover:bg-[#30363d] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveDown(index)} 
                      disabled={index === sections.length - 1} 
                      className="p-1 rounded hover:bg-[#30363d] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#30363d] bg-[#0d1117] space-y-3">
          <button 
            onClick={handleAiAnalysis}
            className="w-full flex items-center justify-center gap-2 bg-[#161b22] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            <Bot size={16} />
            AI Analysis
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] text-white py-2 px-3 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              <Download size={14} />
              PDF
            </button>
            <button 
              onClick={handleDownloadHtml}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1f6feb] hover:bg-[#388bfd] border border-[rgba(240,246,252,0.1)] text-white py-2 px-3 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              <FileText size={14} />
              HTML
            </button>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:underline text-[#8b949e] hover:text-[#58a6ff] py-1.5 px-4 rounded-md text-xs font-medium transition-colors"
          >
            <FileText size={14} />
            Download Markdown (README)
          </button>
        </div>
      </div>

      {/* Main Content - PDF Viewer */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden relative">
        {/* Top bar for preview */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-white">Live PDF Preview</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e]">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse"></span>
            Real-time rendering
          </div>
        </div>

        {/* Live Container */}
        <div className="flex-1 w-full max-w-[900px] mx-auto bg-[#ffffff] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {previewLoading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-[#8b949e] bg-[#0d1117]">
              <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#238636] rounded-full animate-spin"></div>
              <div className="text-sm">Rendering HTML Template...</div>
            </div>
          ) : htmlUrl ? (
            <iframe 
              src={htmlUrl} 
              className="w-full h-full border-0 bg-white" 
              title="HTML Preview" 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#8b949e] text-sm bg-[#0d1117]">
              Failed to load preview
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
