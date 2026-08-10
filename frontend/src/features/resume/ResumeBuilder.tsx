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
import { GripVertical, Eye, EyeOff, Download } from 'lucide-react';
import { api } from '../../shared/api/axios';
import { useEffect, useState } from 'react';

function SortableItem({ section }: { section: Section }) {
  const toggleSection = useResumeEditorStore((state) => state.toggleSection);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 mb-3 bg-white dark:bg-slate-800/80 border rounded-2xl shadow-sm transition-all duration-200 ${
        isDragging ? 'border-slate-500 shadow-md ring-2 ring-slate-500/20 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow'
      } ${!section.visible ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-slate-900 dark:hover:text-white text-slate-400 dark:text-slate-500 transition-colors bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
          <GripVertical className="w-5 h-5" />
        </div>
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{section.label}</span>
      </div>
      <button 
        onClick={() => toggleSection(section.id)}
        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        title={section.visible ? "Hide section" : "Show section"}
      >
        {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

export function ResumeBuilder() {
  const { t } = useTranslation();
  const { sections, reorderSections, selectedTemplate, setSections, setTemplate } = useResumeEditorStore();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateSectionOrder } = useUpdateSectionOrder();
  const token = useAuthStore((state) => state.accessToken);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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
  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const fetchPdf = async () => {
      if (!token) return;
      try {
        const response = await api.get(`/resume/generate/${selectedTemplate}`, {
          responseType: 'blob'
        });
        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setPdfUrl(objectUrl);
        }
      } catch (e) {
        console.error("Failed to fetch PDF", e);
      }
    };
    
    fetchPdf();
    
    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedTemplate, token, profile]); // re-render when profile changes

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
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[700px]">
      {/* Editor Panel */}
      <div className="col-span-1 xl:col-span-4 flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 lg:p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 dark:bg-slate-400" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('builder.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('builder.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="modern">Modern</option>
            </select>
            
            <label className="cursor-pointer">
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
                  window.location.reload(); // simple way to refresh profile
                } catch (error) {
                  toast.error(t('builder.uploadError'));
                }
              }} />
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 text-sm rounded-xl transition-colors">
                 <span className="hidden sm:inline">{t('builder.uploadPdf')}</span>
              </div>
            </label>

            <Button size="sm" onClick={handleDownload} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl shadow-md shadow-slate-900/20 dark:shadow-white/20 border-0">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('builder.exportPdf')}</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-3 -mr-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
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
      <div className="col-span-1 xl:col-span-8 bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl flex flex-col items-center justify-center p-6 lg:p-10 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative ring-1 ring-slate-900/5 dark:ring-white/5">
        <div className="absolute top-6 right-6 z-10 flex gap-3">
          <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-xs px-4 py-2 rounded-xl font-semibold shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
            Live Preview
          </span>
          <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-xs px-4 py-2 rounded-xl font-semibold shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 capitalize">
            Template: {selectedTemplate || 'classic'}
          </span>
        </div>
        
        {/* Iframe wrapper */}
        <div className="w-full max-w-[210mm] h-[297mm] max-h-full bg-white shadow-2xl shadow-slate-900/10 dark:shadow-black/50 overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-slate-900/5 transition-transform hover:scale-[1.005] duration-500">
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
