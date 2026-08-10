import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
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

function SectionItem({ section, isDragging, dragOverlay, listeners, attributes, setNodeRef, style }: any) {
  const toggleSection = useResumeEditorStore((state) => state.toggleSection);
  
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--color-bg-secondary)',
        border: `1px solid ${isDragging || dragOverlay ? 'var(--color-text-muted)' : 'var(--color-border-default)'}`,
        opacity: isDragging && !dragOverlay ? 0.3 : (section.visible ? 1 : 0.5),
        boxShadow: dragOverlay ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)' : 'none',
        cursor: dragOverlay ? 'grabbing' : 'default',
      }}
      className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-md transition-colors duration-150"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className={`p-1 rounded-sm transition-colors ${dragOverlay ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>{section.label}</span>
      </div>
      <button
        onClick={() => toggleSection(section.id)}
        className="p-1.5 rounded-md transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        title={section.visible ? "Hide section" : "Show section"}
        disabled={dragOverlay}
      >
        {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

function SortableItem({ section }: { section: Section }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <SectionItem
      section={section}
      isDragging={isDragging}
      listeners={listeners}
      attributes={attributes}
      setNodeRef={setNodeRef}
      style={style}
    />
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync initial order from profile
  useEffect(() => {
    if (profile?.sectionOrder && profile.sectionOrder.length > 0) {
      const order = profile.sectionOrder as string[];
      const newSections = [...sections].sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      const isDifferent = newSections.some((s, i) => s.id !== sections[i].id);
      if (isDifferent) {
        setSections(newSections);
      }
    }
  }, [profile?.sectionOrder]);

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
  }, [selectedTemplate, token]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: any) {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      
      // If found in array
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);

        const newSections = [...sections];
        const [moved] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, moved);
        const order = newSections.map(s => s.id);
        updateSectionOrder(order);
      }
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
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '4px solid var(--color-border-default)', borderTopColor: 'var(--color-link)' }}
      />
    </div>
  );

  return (
    <div
      className="flex flex-col lg:flex-row h-full w-full"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)' }}
    >
      {/* Editor Panel (Sidebar) */}
      <div
        className="w-full lg:w-[350px] shrink-0 flex flex-col h-full p-5"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRight: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{t('builder.title')}</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('builder.subtitle')}</p>
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setTemplate(e.target.value)}
              className="text-sm rounded-md px-3 py-1.5 focus:outline-none transition-colors w-full cursor-pointer"
              style={{
                backgroundColor: 'var(--color-btn-bg)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
              }}
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
                <div
                  className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors w-full h-full font-medium"
                  style={{
                    backgroundColor: 'var(--color-btn-bg)',
                    border: '1px solid var(--color-btn-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                   <span>{t('builder.uploadPdf')}</span>
                </div>
              </label>

              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 text-white rounded-md px-3 py-1.5 font-medium transition-colors shadow-sm"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  border: '1px solid var(--color-btn-border)',
                }}
              >
                <Download className="w-4 h-4" /> <span>{t('builder.exportPdf')}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 relative">
          <div className="text-xs font-semibold mb-3 uppercase tracking-wider sticky top-0 bg-opacity-90 pb-1 z-10" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-primary)' }}>Sections</div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableItem key={section.id} section={section} />
              ))}
            </SortableContext>
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
              }}
            >
              {activeId ? (
                <SectionItem
                  section={sections.find(s => s.id === activeId)!}
                  dragOverlay={true}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Preview Panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-preview-bg)' }}
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="sm"
            onClick={fetchPdf}
            disabled={isPdfLoading}
            className="text-xs px-3 h-8 rounded-md flex items-center gap-2 font-medium transition-colors shadow-sm"
            style={{
              backgroundColor: 'var(--color-btn-bg)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {isPdfLoading ? (
              <div
                className="w-3 h-3 rounded-full animate-spin"
                style={{ border: '2px solid var(--color-text-muted)', borderTopColor: 'white' }}
              />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {t('builder.updatePreview', 'Update Preview')}
          </Button>
        </div>

        {/* Iframe wrapper */}
        <div
          className="w-full max-w-[210mm] h-[297mm] max-h-full bg-white shadow-sm overflow-hidden rounded-md transition-transform hover:scale-[1.01] duration-300"
          style={{ border: '1px solid var(--color-border-default)' }}
        >
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
