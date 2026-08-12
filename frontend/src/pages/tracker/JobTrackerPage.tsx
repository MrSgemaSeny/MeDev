import { useState, useMemo } from 'react';
import { useJobApplications, useAddJobApplication, useUpdateJobApplication, useDeleteJobApplication } from '../../shared/api/hooks/useJobTracker';
import type { ApplicationStatus, JobApplicationDto, CreateJobApplicationRequest } from '../../entities/job-tracker/model/types';
import { DndContext, closestCorners, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../shared/ui/Button';
import { Input, Label, Textarea, Card, Badge } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { Plus, Briefcase, ExternalLink, Calendar, Trash2 } from 'lucide-react';

const COLUMNS: { id: ApplicationStatus; title: string }[] = [
  { id: 'WISHLIST', title: 'Wishlist' },
  { id: 'APPLIED', title: 'Applied' },
  { id: 'INTERVIEW', title: 'Interview' },
  { id: 'OFFER', title: 'Offer' },
  { id: 'REJECTED', title: 'Rejected' },
];

export const JobTrackerPage = () => {
  const { data: applications = [], isLoading } = useJobApplications();
  const updateStatus = useUpdateJobApplication();
  
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as number);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    
    if (!over) return;
    
    const activeApp = applications.find(a => a.id === active.id);
    if (!activeApp) return;

    const overId = over.id;
    let newStatus: ApplicationStatus | null = null;
    
    // Check if dropped directly on a column
    if (COLUMNS.find(c => c.id === overId)) {
      newStatus = overId as ApplicationStatus;
    } else {
      // Dropped on another card
      const overApp = applications.find(a => a.id === overId);
      if (overApp) {
        newStatus = overApp.status;
      }
    }

    if (newStatus && activeApp.status !== newStatus) {
      updateStatus.mutate({ id: activeApp.id, payload: { status: newStatus } });
    }
  };

  const activeApp = useMemo(() => applications.find(a => a.id === activeId), [activeId, applications]);

  if (isLoading) return <div className="p-8 text-secondary">Loading Tracker...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b border-default shrink-0 bg-[var(--color-bg-primary)]">
        <div>
          <h1 className="text-xl font-semibold text-primary">Job Tracker</h1>
          <p className="text-sm text-secondary">Manage your applications and tailor resumes in one place.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Application
        </Button>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar bg-[var(--color-bg-inset)]">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full">
            {COLUMNS.map(col => (
              <Column key={col.id} column={col} applications={applications.filter(a => a.status === col.id)} />
            ))}
          </div>
          
          <DragOverlay>
            {activeApp ? <AppCard application={activeApp} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

const Column = ({ column, applications }: { column: { id: ApplicationStatus, title: string }, applications: JobApplicationDto[] }) => {
  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-[var(--color-bg-secondary)] rounded-xl border border-default max-h-full">
      <div className="p-3 border-b border-default flex justify-between items-center bg-[var(--color-bg-tertiary)] rounded-t-xl">
        <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">{column.title}</h3>
        <Badge tone="default" className="text-xs font-mono">{applications.length}</Badge>
      </div>
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        <SortableContext id={column.id} items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map(app => (
            <SortableAppCard key={app.id} application={app} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const SortableAppCard = ({ application }: { application: JobApplicationDto }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation">
      <AppCard application={application} />
    </div>
  );
};

const AppCard = ({ application, isDragging }: { application: JobApplicationDto, isDragging?: boolean }) => {
  const deleteApp = useDeleteJobApplication();
  
  return (
    <Card className={`p-4 bg-[var(--color-bg-primary)] border border-default shadow-sm hover:border-[var(--color-accent)] transition-colors cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg rotate-2' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm text-primary leading-tight">{application.role}</h4>
        <button 
          onPointerDown={(e) => { e.stopPropagation(); deleteApp.mutate(application.id); }}
          className="text-secondary hover:text-[var(--color-danger)] transition-colors p-1 -mr-2 -mt-2 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-secondary mb-3">
        <Briefcase size={12} />
        <span>{application.companyName}</span>
      </div>
      
      {(application.location || application.salaryRange) && (
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {application.location && <Badge tone="default">{application.location}</Badge>}
          {application.salaryRange && <Badge tone="success">{application.salaryRange}</Badge>}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-default">
        {application.appliedDate ? (
          <div className="flex items-center gap-1.5 text-xs text-secondary">
            <Calendar size={12} />
            <span>{application.appliedDate}</span>
          </div>
        ) : <div />}
        {application.jobUrl && (
          <a 
            href={application.jobUrl} 
            target="_blank" 
            rel="noreferrer"
            onPointerDown={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-[var(--color-link)] hover:underline"
          >
            Job Link <ExternalLink size={10} />
          </a>
        )}
      </div>
    </Card>
  );
};

const AddApplicationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const addApp = useAddJobApplication();
  const [formData, setFormData] = useState<CreateJobApplicationRequest>({
    companyName: '',
    role: '',
    status: 'WISHLIST',
    jobUrl: '',
    location: '',
    salaryRange: '',
    appliedDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addApp.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({ ...formData, companyName: '', role: '', jobUrl: '', location: '', salaryRange: '' });
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Job Application">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="companyName">Company</Label><Input id="companyName" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} /></div>
          <div><Label htmlFor="role">Role</Label><Input id="role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
        </div>
        <div>
          <Label htmlFor="status">Initial Status</Label>
          <select 
            id="status" 
            className="w-full h-10 px-3 rounded-md bg-[var(--color-bg-primary)] border border-default text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-shadow"
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
          >
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div><Label htmlFor="jobUrl">Job URL</Label><Input id="jobUrl" type="url" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="location">Location</Label><Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
          <div><Label htmlFor="salaryRange">Salary Range</Label><Input id="salaryRange" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} /></div>
        </div>
        <div><Label htmlFor="appliedDate">Applied Date</Label><Input id="appliedDate" type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} /></div>
        <div className="flex gap-3 pt-4 border-t border-default">
          <Button type="submit" variant="primary" className="flex-1" disabled={addApp.isPending}>{addApp.isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};
