import React from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { JobApplicationDto, ApplicationStatus } from '../../../entities/job-tracker/model/types';
import { Badge } from '../../../shared/ui/Form';
import { Target, TrendingUp, CheckCircle2, XCircle, Clock, ExternalLink, Wand2, Trash2 } from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; tone: 'default' | 'accent' | 'danger', icon: any }> = {
  WISHLIST: { label: 'Wishlist', tone: 'default', icon: Clock },
  APPLIED: { label: 'Applied', tone: 'accent', icon: Target },
  INTERVIEW: { label: 'Interviewing', tone: 'accent', icon: TrendingUp },
  OFFER: { label: 'Offer', tone: 'accent', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'danger', icon: XCircle },
};

const COLUMNS: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

interface KanbanBoardProps {
  applications: JobApplicationDto[];
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onCoverLetter: (app: JobApplicationDto) => void;
  onDelete: (id: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications, onStatusChange, onCoverLetter, onDelete }) => {
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as number;
    const newStatus = over.id as ApplicationStatus;

    const app = applications.find(a => a.id === appId);
    if (app && app.status !== newStatus) {
      onStatusChange(appId, newStatus);
    }
  };

  const activeApp = React.useMemo(
    () => applications.find(a => a.id === activeId),
    [activeId, applications]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(status => (
          <KanbanColumn 
            key={status} 
            status={status} 
            applications={applications.filter(a => a.status === status)}
            onCoverLetter={onCoverLetter}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? <KanbanCard app={activeApp} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: JobApplicationDto[];
  onCoverLetter: (app: JobApplicationDto) => void;
  onDelete: (id: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, applications, onCoverLetter, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-xl overflow-hidden h-full">
      <div className="p-3 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Icon size={16} className={config.tone === 'accent' ? 'text-[var(--color-accent)]' : config.tone === 'danger' ? 'text-danger' : 'text-secondary'} />
          {config.label}
        </div>
        <Badge tone="default" className="text-xs px-2">{applications.length}</Badge>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-3 overflow-y-auto flex flex-col gap-3 transition-colors ${isOver ? 'bg-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-inset)]'}`}
      >
        {applications.map(app => (
          <KanbanCard key={app.id} app={app} onCoverLetter={() => onCoverLetter(app)} onDelete={() => onDelete(app.id)} />
        ))}
      </div>
    </div>
  );
};

interface KanbanCardProps {
  app: JobApplicationDto;
  isOverlay?: boolean;
  onCoverLetter?: () => void;
  onDelete?: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ app, isOverlay, onCoverLetter, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-transparent border-2 border-dashed border-[var(--color-border-default)] rounded-lg h-24 opacity-50" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing group ${isOverlay ? 'rotate-2 scale-105 shadow-xl ring-2 ring-[var(--color-accent)]' : 'hover:border-[var(--color-accent)] transition-colors'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm text-primary line-clamp-2 leading-tight">{app.role}</h4>
        {app.matchScore != null && (
          <Badge tone={app.matchScore > 75 ? 'accent' : 'default'} className="text-[10px] whitespace-nowrap ml-2">
            {app.matchScore}% Match
          </Badge>
        )}
      </div>
      <div className="text-sm text-secondary mb-3">{app.companyName}</div>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs text-muted">
          {app.appliedDate || 'No date'}
        </div>
        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
            {app.jobUrl && (
              <a href={app.jobUrl} target="_blank" rel="noreferrer" className="p-1 text-secondary hover:text-[var(--color-accent)] rounded" title="View Job Post">
                <ExternalLink size={14} />
              </a>
            )}
            {onCoverLetter && (
              <button onClick={onCoverLetter} className="p-1 text-secondary hover:text-purple-400 rounded" title="AI Cover Letter">
                <Wand2 size={14} />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1 text-secondary hover:text-danger rounded" title="Delete">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
