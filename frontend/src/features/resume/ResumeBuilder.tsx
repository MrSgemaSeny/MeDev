import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';
import type { Section } from '../../entities/resume/model/resumeEditorStore';
import { useAuthStore } from '../../entities/user/model/store';
import { useProfile, useUpdateSectionOrder } from '../../shared/api/hooks/useProfile';
import { Button } from '../../shared/ui/Button';
import { toast } from 'sonner';
import { GripVertical, Eye, EyeOff, Download, RefreshCw } from 'lucide-react';
import { api } from '../../shared/api/axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function SortableItem({ section }: { section: Section }) {
  const toggleSection = useResumeEditorStore((state) => state.toggleSection);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full flex items-center justify-between px-3 py-2.5 mb-2 bg-[#161b22] border rounded-md transition-colors duration-150 ${
        isDragging ? 'border-[#8b949e] shadow-md ring-1 ring-[#8b949e]' : 'border-[#30363d] hover:border-[#8b949e] hover:bg-[#21262d]'
      } ${!section.visible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-[#8b949e] hover:text-[#c9d1d9] transition-colors bg-transparent p-1 rounded-sm">
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm text-[#c9d1d9]">{section.label}</span>
      </div>
      <button 
        onClick={() => toggleSection(section.id)}
        className="p-1.5 rounded-md hover:bg-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
        title={section.visible ? "Hide section" : "Show section"}
      >
        {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function ResumeBuilder() {
  const { t } = useTranslation();
  const { sections, reorderSections, selectedTemplate, setSections, setTemplate } = useResumeEditorStore();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateSectionOrder } = useUpdateSectionOrder();
  const token = useAuthStore((state) => state.accessToken);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Sync initial order from profile
  useEffect(() => {
    if (profile?.sectionOrder && profile.sectionOrder.length > 0) {
      const order = profile.sectionOrder as string[];
      // sort sections based on order
      const newSections = [...sections].sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      // check if it actually changed to avoid infinite loop
      const isDifferent = newSections.some((s, i) => s.id !== sections[i].id);
      if (isDifferent) {
        setSections(newSections);
      }
    }
  }, [profile?.sectionOrder]); // Only run when profile order changes

  // Fetch PDF securely
  const fetchPdf = async () => {
    if (!token) return;
    setIsPdfLoading(true);
    try {
      const response = await api.get(`/resume/generate/${selectedTemplate}`, {
        responseType: 'blob'
      });
      const objectUrl = URL.createObjectURL(response.data);
      setPdfUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (e: any) {
      console.error("Failed to fetch PDF", e);
      if (e.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      }
    } finally {
      setIsPdfLoading(false);
    }
  };

  useEffect(() => {
    fetchPdf();
    
    return () => {
      setPdfUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [selectedTemplate, token]); // Only re-fetch on template change or login

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      reorderSections(oldIndex, newIndex);
      
      // Compute new order and save to backend
      const newSections = [...sections];
      const [moved] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, moved);
      const order = newSections.map(s => s.id);
      updateSectionOrder(order);
    }
  }

  const handleDownload = async () => {
    if (!token) return;
    toast.info("Downloading PDF...");
    try {
      const response = await api.get(`/resume/generate/${selectedTemplate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Download failed. Limit reached or server error.");
    }
  };

  if (isLoading) return (
    <div className="flex h-full items-center justify-center bg-[#0d1117]">
      <div className="w-8 h-8 border-4 border-[#30363d] border-t-[#58a6ff] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0d1117] text-[#c9d1d9]">
      {/* Editor Panel (Sidebar) */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col h-full bg-[#0d1117] border-r border-[#30363d] p-5">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#c9d1d9]">{t('builder.title')}</h2>
            <p className="text-xs text-[#8b949e] mt-1">{t('builder.subtitle')}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#58a6ff] hover:bg-[#30363d] transition-colors w-full cursor-pointer"
            >
              <option value="classic">Classic Template</option>
              <option value="minimal">Minimal Template</option>
              <option value="modern">Modern Template</option>
            </select>
            
            <div className="flex gap-2 w-full">
              <label className="cursor-pointer flex-1">
                <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  toast.info("Uploading and parsing PDF...");
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    await api.post('/ai/parse-resume', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    toast.success(t('builder.uploadSuccess'));
                    window.location.reload();
                  } catch (error) {
                    toast.error(t('builder.uploadError'));
                  }
                }} />
                <div className="flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#f0f6fc1a] text-[#c9d1d9] px-3 py-1.5 text-sm rounded-md transition-colors w-full h-full font-medium">
                   <span>{t('builder.uploadPdf')}</span>
                </div>
              </label>

              <Button size="sm" onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white border border-[#f0f6fc1a] rounded-md px-3 py-1.5 font-medium transition-colors shadow-sm">
                <Download className="w-4 h-4" /> <span>{t('builder.exportPdf')}</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#30363d]">
          <div className="text-xs font-semibold text-[#8b949e] mb-3 uppercase tracking-wider">Sections</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableItem key={section.id} section={section} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-[#010409] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button 
            size="sm" 
            onClick={fetchPdf} 
            disabled={isPdfLoading}
            className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-xs px-3 h-8 rounded-md text-[#c9d1d9] flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            {isPdfLoading ? <div className="w-3 h-3 border-2 border-[#8b949e] border-t-white rounded-full animate-spin"></div> : <RefreshCw className="w-3 h-3" />}
            {t('builder.updatePreview', 'Update Preview')}
          </Button>
        </div>
        
        {/* Iframe wrapper */}
        <div className="w-full max-w-[210mm] h-[297mm] max-h-full bg-white shadow-sm overflow-hidden rounded-md border border-[#30363d] transition-transform hover:scale-[1.01] duration-300">
           {pdfUrl && (
             <iframe 
                className="w-full h-full bg-white"
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Resume Preview"
             />
           )}
        </div>
      </div>
    </div>
  );
}
