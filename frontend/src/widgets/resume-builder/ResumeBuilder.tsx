import React from 'react';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';
import { Button } from '../../shared/ui/Button';
import { api } from '../../shared/api/axios';
import { useAiChatStore } from '../../features/ai-assistant/model/store';
import { Bot } from 'lucide-react';

const TEMPLATES = [
  { id: 'github', name: 'GitHub', bg: '#0d1117', color: '#e6edf3', accent: '#238636' },
  { id: 'milky-soft', name: 'Milky Soft', bg: '#fdfbf7', color: '#4a443b', accent: '#d4b7a1' },
  { id: 'apple-modern', name: 'Apple', bg: '#ffffff', color: '#1d1d1f', accent: '#0071e3' },
  { id: 'groq-monolith', name: 'Groq', bg: '#000000', color: '#ffffff', accent: '#f55036' },
  { id: 'phub-orange', name: 'PH Orange', bg: '#1b1b1b', color: '#ffffff', accent: '#f90' }
];

export const ResumeBuilder = () => {
  const { sections, selectedTemplate, setTemplate, toggleSection, reorderSections } = useResumeEditorStore();
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
      const { data } = await api.get(`/resume/generate/${selectedTemplate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = window.document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      window.alert('PDF export failed.');
    }
  };

  const moveUp = (index: number) => { if (index > 0) reorderSections(index, index - 1); };
  const moveDown = (index: number) => { if (index < sections.length - 1) reorderSections(index, index + 1); };

  const [previewMode, setPreviewMode] = React.useState<'pdf'>('pdf');
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = React.useState(false);

  React.useEffect(() => {
    if (previewMode === 'pdf') {
      let active = true;
      const loadPdf = async () => {
        setPdfLoading(true);
        try {
          const { data } = await api.get(`/resume/generate/${selectedTemplate}?preview=true`, { responseType: 'blob' });
          if (active) {
            const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
            setPdfUrl(url);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setPdfLoading(false);
        }
      };
      loadPdf();
      return () => {
        active = false;
        if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      };
    }
  }, [previewMode, selectedTemplate]);

  return (
    <div className="flex h-full" style={{ color: 'var(--color-text-primary)' }}>
      <div
        className="w-72 border-r p-4 flex flex-col gap-6 overflow-y-auto shrink-0"
        style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Preview Mode</h2>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1">Live PDF Preview</Button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Templates</h2>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className="p-2 rounded-md transition-colors duration-100 flex items-center justify-center relative overflow-hidden"
                style={{ 
                  border: selectedTemplate === t.id ? `2px solid ${t.accent}` : '1px solid var(--color-border-default)' 
                }}
              >
                <div 
                  className="w-full h-10 rounded flex items-center justify-center text-xs relative overflow-hidden" 
                  style={{ backgroundColor: t.bg, color: t.color, border: '1px solid var(--color-border-default)' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: t.accent }} />
                  {t.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Sections</h2>
          <div className="space-y-1.5">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-2 rounded-md"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}
              >
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <input type="checkbox" checked={section.visible} onChange={() => toggleSection(section.id)} style={{ accentColor: 'var(--color-accent)' }} />
                  {section.label}
                </label>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="px-1 disabled:opacity-30" style={{ color: 'var(--color-text-muted)' }}>&#8593;</button>
                  <button onClick={() => moveDown(index)} disabled={index === sections.length - 1} className="px-1 disabled:opacity-30" style={{ color: 'var(--color-text-muted)' }}>&#8595;</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t space-y-3" style={{ borderColor: 'var(--color-border-default)' }}>
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={handleAiAnalysis}>
            <Bot size={16} />
            Analyze Resume
          </Button>
          <Button variant="primary" className="w-full" onClick={handleDownloadPdf}>Export PDF</Button>
          <Button variant="outline" className="w-full" onClick={handleDownload}>Export README</Button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto p-8 flex justify-center"
        style={{ backgroundColor: 'var(--color-preview-bg)' }}
      >
        <div className="origin-top w-full max-w-[800px] h-full">
            <div className="w-full h-[800px] bg-white rounded shadow-lg overflow-hidden flex items-center justify-center">
              {pdfLoading ? (
                <div className="text-gray-500">Generating PDF...</div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
              ) : (
                <div className="text-gray-500">Failed to load PDF</div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
