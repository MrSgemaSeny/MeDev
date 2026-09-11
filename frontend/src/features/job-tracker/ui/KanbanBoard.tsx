import React from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { JobApplicationDto, ApplicationStatus } from '../../../entities/job-tracker/model/types';
import { sanitizeUrl } from '../../../shared/lib/utils';
import { ExternalLink, Wand2, Trash2, Sparkles } from 'lucide-react';

const COLUMN_TITLES: Record<ApplicationStatus, string> = {
  WISHLIST: 'В планах',
  APPLIED: 'Отправлено',
  INTERVIEW: 'Собеседование',
  OFFER: 'Оффер',
  REJECTED: 'Отказ',
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
      <div className="flex gap-4 p-4 sm:p-6 overflow-x-auto min-w-0 items-stretch h-full w-full select-none">
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
  const title = t(`tracker.status.${status.toLowerCase()}`, COLUMN_TITLES[status]);

  return (
    <div className="flex-1 min-w-[240px] flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-[8px] overflow-hidden h-full max-h-full">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-tertiary)]">
        <h3 className="text-primary font-semibold text-sm tracking-tight">
          {title}
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-secondary border border-[var(--color-border-default)] font-medium">
          {applications.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-3 overflow-y-auto flex flex-col gap-3 transition-colors min-h-0 ${
          isOver ? 'bg-[var(--color-bg-secondary)]/70 ring-1 ring-[var(--color-accent)] ring-inset' : 'bg-[var(--color-bg-inset)]'
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
          <div className="h-28 border border-dashed border-[var(--color-border-default)] rounded-[8px] flex flex-col items-center justify-center text-center p-3 text-secondary text-xs">
            <span>{t('tracker.emptyColumn', 'Нет вакансий')}</span>
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
        className="bg-[var(--color-bg-secondary)]/50 border-2 border-dashed border-[var(--color-accent)] rounded-[8px] h-28 opacity-60" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-[8px] p-4 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-150 flex flex-col ${
        isOverlay 
          ? 'rotate-1 scale-105 shadow-2xl ring-2 ring-[var(--color-accent)] z-50 bg-[var(--color-bg-secondary)]' 
          : 'hover:border-[var(--color-border-muted)]'
      }`}
    >
      {/* Role Title */}
      <h4 className="font-semibold text-[15px] text-primary leading-snug mb-1">
        {app.role}
      </h4>

      {/* Company + Location */}
      <p className="text-[13px] text-secondary mb-3">
        {app.companyName}{app.location ? ` • ${app.location}` : ''}
      </p>

      {/* Badges row: Match / Salary */}
      {(app.matchScore != null || app.salaryRange) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {app.matchScore != null && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
              {app.matchScore}% Match
            </span>
          )}
          {app.salaryRange && (
            <span className="text-[13px] text-secondary font-mono">
              {app.salaryRange}
            </span>
          )}
        </div>
      )}
      
      {/* Footer: Date & Action buttons */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-default)] mt-auto">
        <span className="text-[12px] text-secondary">
          {app.appliedDate || 'No date'}
        </span>

        {!isOverlay && (
          <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
            {app.jobUrl && (
              <a 
                href={sanitizeUrl(app.jobUrl)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                title="Ссылка на вакансию"
                aria-label="Ссылка на вакансию"
              >
                <ExternalLink size={14} />
              </a>
            )}
            {onTailor && (
              <button 
                onClick={onTailor} 
                aria-label="AI Адаптация"
                className="p-1.5 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                title="AI Адаптация"
              >
                <Sparkles size={14} aria-hidden="true" />
              </button>
            )}
            {onCoverLetter && (
              <button 
                onClick={onCoverLetter} 
                aria-label="Cover Letter"
                className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                title="Cover Letter"
              >
                <Wand2 size={14} aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete} 
                aria-label="Удалить вакансию"
                className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                title="Удалить"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
