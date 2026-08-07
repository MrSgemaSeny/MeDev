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
import { useProfile } from '../../shared/api/hooks/useProfile';
import { Button } from '../../shared/ui/Button';
import { toast } from 'sonner';

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
      className={`flex items-center justify-between p-4 mb-2 bg-white border rounded-xl shadow-sm ${
        isDragging ? 'border-zinc-900 shadow-md ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
      } ${!section.visible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-zinc-900 text-zinc-400">
          [::]
        </div>
        <span className="font-medium text-sm text-zinc-700">{section.label}</span>
      </div>
      <button 
        onClick={() => toggleSection(section.id)}
        className="p-2 rounded-md hover:bg-[var(--accent-bg)] text-[var(--text)] hover:text-[var(--accent)]"
      >
        {section.visible ? '[Hide]' : '[Show]'}
      </button>
    </div>
  );
}

export function ResumeBuilder() {
  const { sections, reorderSections, selectedTemplate } = useResumeEditorStore();
  const { data: _profile, isLoading } = useProfile();
  const token = useAuthStore((state) => state.accessToken);

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
    }
  }

  const handleDownload = () => {
    toast.info("Downloading PDF...");
    // Ideally trigger a download from the API
    window.open(`http://localhost:8080/v1/resume/generate/${selectedTemplate}?token=${token}`, '_blank');
  };

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-zinc-200 rounded"></div></div></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[700px]">
      {/* Editor Panel */}
      <div className="col-span-1 lg:col-span-4 flex flex-col h-full bg-zinc-50/50 rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Builder</h2>
          <Button size="sm" onClick={handleDownload}>Export PDF</Button>
        </div>
        
        <p className="text-sm text-zinc-500 mb-4">Drag to reorder sections. Toggle visibility with the eye icon.</p>
        
        <div className="flex-1 overflow-y-auto pr-2">
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
      <div className="col-span-1 lg:col-span-8 bg-zinc-200 rounded-2xl flex items-center justify-center p-8 border border-zinc-200 overflow-hidden relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Template Switcher would go here */}
          <span className="bg-white/80 backdrop-blur text-xs px-3 py-1.5 rounded-full font-medium shadow-sm border border-black/5">
            Template: Classic
          </span>
        </div>
        
        {/* We use an iframe pointing to our API to render the PDF preview directly */}
        <div className="w-full max-w-[210mm] h-[297mm] max-h-full bg-white shadow-2xl overflow-hidden rounded-md border border-zinc-300">
           {token && (
             <iframe 
                className="w-full h-full"
                src={`http://localhost:8080/v1/resume/generate/${selectedTemplate}?token=${token}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Resume Preview"
             />
           )}
        </div>
      </div>
    </div>
  );
}
