import React from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { JobApplicationDto, ApplicationStatus } from '../../../entities/job-tracker/model/types';
import { Badge } from '../../../shared/ui/Form';
import { sanitizeUrl } from '../../../shared/lib/utils';
import { Target, TrendingUp, CheckCircle2, XCircle, Clock, ExternalLink, Wand2, Trash2, Sparkles, MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; tone: 'default' | 'accent' | 'danger'; colorClass: string; borderClass: string; icon: any }> = {
  WISHLIST: { label: 'Wishlist', tone: 'default', colorClass: 'text-secondary', borderClass: 'border-t-gray-500', icon: Clock },
  APPLIED: { label: 'Applied', tone: 'accent', colorClass: 'text-blue-400', borderClass: 'border-t-blue-500', icon: Target },
  INTERVIEW: { label: 'Interviewing', tone: 'accent', colorClass: 'text-amber-400', borderClass: 'border-t-amber-500', icon: TrendingUp },
  OFFER: { label: 'Offer', tone: 'accent', colorClass: 'text-emerald-400', borderClass: 'border-t-emerald-500', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'danger', colorClass: 'text-red-400', borderClass: 'border-t-red-500', icon: XCircle },
};

const COLUMNS: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

interface KanbanBoardProps {
  applications: JobApplicationDto[];
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onTailor: (app: JobApplicationDto) => void;
  onCoverLetter: (app: JobApplicationDto) => void;
  onDelete: (id: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications, onStatusChange, onTailor, onCoverLetter, onDelete }) => {
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
      <div className="flex gap-4 p-4 sm:p-6 overflow-x-auto min-w-0 items-stretch h-full select-none">
        {COLUMNS.map(status => (
          <KanbanColumn 
            key={status} 
            status={status} 
            applications={applications.filter(a => a.status === status)}
            onTailor={onTailor}
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
  onTailor: (app: JobApplicationDto) => void;
  onCoverLetter: (app: JobApplicationDto) => void;
  onDelete: (id: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ status, applications, onTailor, onCoverLetter, onDelete }) => {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col shrink-0 w-72 sm:w-80 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] border-t-2 ${config.borderClass} rounded-xl overflow-hidden h-full max-h-full shadow-sm`}>
      {/* Column Header */}
      <div className="px-3.5 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Icon size={16} className={config.colorClass} />
          <span>{t(`tracker.status.${status.toLowerCase()}`, config.label)}</span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-bg-inset)] text-secondary border border-[var(--color-border-default)] font-semibold">
          {applications.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-2.5 overflow-y-auto flex flex-col gap-2.5 transition-colors min-h-0 ${
          isOver ? 'bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-accent)] ring-inset' : 'bg-[var(--color-bg-inset)]'
        }`}
      >
        {applications.map(app => (
          <KanbanCard 
            key={app.id} 
            app={app} 
            onTailor={() => onTailor(app)} 
            onCoverLetter={() => onCoverLetter(app)} 
            onDelete={() => onDelete(app.id)} 
          />
        ))}

        {applications.length === 0 && (
          <div className="h-28 border border-dashed border-[var(--color-border-default)] rounded-lg flex flex-col items-center justify-center text-center p-3 text-muted text-xs">
            <span>{t('tracker.emptyColumn', 'No applications')}</span>
          </div>
        )}
      </div>
    </div>
  );
});

interface KanbanCardProps {
  app: JobApplicationDto;
  isOverlay?: boolean;
  onTailor?: () => void;
  onCoverLetter?: () => void;
  onDelete?: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = React.memo(({ app, isOverlay, onTailor, onCoverLetter, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-[var(--color-bg-primary)]/40 border-2 border-dashed border-[var(--color-accent)] rounded-lg h-24 opacity-60" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg p-3.5 shadow-xs cursor-grab active:cursor-grabbing group select-none transition-all duration-150 ${
        isOverlay 
          ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-[var(--color-accent)] z-50 bg-[var(--color-bg-secondary)]' 
          : 'hover:border-[var(--color-border-muted,#484f58)] hover:shadow-md'
      }`}
    >
      {/* Top row: Company & AI Match Badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 size={13} className="text-secondary shrink-0" />
          <span className="text-xs font-semibold text-secondary truncate tracking-tight uppercase">
            {app.companyName}
          </span>
        </div>
        {app.matchScore != null && (
          <Badge tone={app.matchScore > 75 ? 'accent' : 'default'} className="text-[10px] px-1.5 py-0.5 shrink-0">
            {app.matchScore}% Match
          </Badge>
        )}
      </div>

      {/* Role Title */}
      <h4 className="font-semibold text-sm text-primary line-clamp-2 leading-snug mb-2.5">
        {app.role}
      </h4>

      {/* Meta Chips: Salary / Location */}
      {(app.location || app.salaryRange) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary mb-3">
          {app.location && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[11px] text-secondary">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate max-w-[120px]">{app.location}</span>
            </span>
          )}
          {app.salaryRange && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[11px] text-emerald-400 font-mono font-medium">
              <DollarSign size={11} className="shrink-0" />
              <span>{app.salaryRange}</span>
            </span>
          )}
        </div>
      )}
      
      {/* Footer: Date & Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-default)] mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
          <Calendar size={11} />
          <span>{app.appliedDate || 'No date'}</span>
        </div>

        {!isOverlay && (
          <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
            {app.jobUrl && (
              <a 
                href={sanitizeUrl(app.jobUrl)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] rounded transition-colors" 
                title="View Job Post"
                aria-label="View Job Post"
              >
                <ExternalLink size={13} />
              </a>
            )}
            {onTailor && (
              <button 
                onClick={onTailor} 
                aria-label="AI Resume Tailoring"
                className="p-1.5 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] rounded transition-colors focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" 
                title="AI Resume Tailoring"
              >
                <Sparkles size={13} aria-hidden="true" />
              </button>
            )}
            {onCoverLetter && (
              <button 
                onClick={onCoverLetter} 
                aria-label="AI Cover Letter"
                className="p-1.5 text-secondary hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:outline-none" 
                title="AI Cover Letter"
              >
                <Wand2 size={13} aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete} 
                aria-label="Delete job application"
                className="p-1.5 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:outline-none" 
                title="Delete"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

