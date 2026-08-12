import { useState, useMemo } from 'react';
import { useJobApplications, useAddJobApplication, useDeleteJobApplication, useGenerateCoverLetter } from '../../shared/api/hooks/useJobTracker';
import type { ApplicationStatus, JobApplicationDto, CreateJobApplicationRequest } from '../../entities/job-tracker/model/types';
import { Button } from '../../shared/ui/Button';
import { Input, Label, Badge } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { Plus, Briefcase, ExternalLink, Calendar, Trash2, Search, Filter, TrendingUp, Target, CheckCircle2, XCircle, Clock, Wand2 } from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; tone: 'default' | 'accent' | 'danger', icon: any }> = {
  WISHLIST: { label: 'Wishlist', tone: 'default', icon: Clock },
  APPLIED: { label: 'Applied', tone: 'accent', icon: Target },
  INTERVIEW: { label: 'Interviewing', tone: 'accent', icon: TrendingUp },
  OFFER: { label: 'Offer', tone: 'accent', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'danger', icon: XCircle },
};

export const JobTrackerPage = () => {
  const { data: applications = [], isLoading } = useJobApplications();
  const deleteApp = useDeleteJobApplication();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetterModalApp, setCoverLetterModalApp] = useState<JobApplicationDto | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.companyName.toLowerCase().includes(search.toLowerCase()) || app.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime());
  }, [applications, search, statusFilter]);

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter(a => ['APPLIED', 'INTERVIEW'].includes(a.status)).length;
    const interviews = applications.filter(a => a.status === 'INTERVIEW').length;
    const offers = applications.filter(a => a.status === 'OFFER').length;
    return { total, active, interviews, offers };
  }, [applications]);

  if (isLoading) return <div className="p-8 text-secondary">Loading CRM...</div>;

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-inset)]">
      <header className="px-6 py-5 flex justify-between items-center border-b border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
        <div>
          <h1 className="text-xl font-bold text-primary">Job Tracker CRM</h1>
          <p className="text-sm text-secondary mt-1">Enterprise-grade pipeline management for your career.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Application
        </Button>
      </header>

      <div className="p-6 flex-1 overflow-auto max-w-6xl mx-auto w-full">
        {/* Compact Stats Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shadow-sm">
            <Briefcase size={14} className="text-secondary" />
            <span className="text-secondary font-medium">Total</span>
            <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-inset)] text-primary text-xs">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shadow-sm">
            <Target size={14} className="text-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] font-medium">Active</span>
            <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-inset)] text-primary text-xs">{stats.active}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shadow-sm">
            <TrendingUp size={14} className="text-yellow-500" />
            <span className="text-yellow-500 font-medium">Interviews</span>
            <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-inset)] text-primary text-xs">{stats.interviews}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shadow-sm">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-green-500 font-medium">Offers</span>
            <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-inset)] text-primary text-xs">{stats.offers}</span>
          </div>
        </div>

        {/* GitHub Issues Style List */}
        <div className="border border-[var(--color-border-default)] rounded-xl bg-[var(--color-bg-primary)] overflow-hidden shadow-sm">
          {/* Header Bar */}
          <div className="p-3 border-b border-[var(--color-border-default)] flex flex-col sm:flex-row gap-3 bg-[var(--color-bg-secondary)] items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input 
                type="text" 
                placeholder="Search company or role..." 
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-md focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-shadow text-primary placeholder-muted"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-secondary" />
              <select 
                className="py-1.5 px-3 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-md outline-none text-primary hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-[var(--color-border-default)]">
            {filteredApps.map(app => {
              const StatusIcon = STATUS_CONFIG[app.status].icon;
              return (
                <div key={app.id} className="p-4 hover:bg-[var(--color-bg-secondary)] transition-colors group flex items-start gap-3">
                  {/* Left Icon */}
                  <div className="mt-1">
                    <StatusIcon size={18} className={`
                      ${app.status === 'OFFER' ? 'text-green-500' : ''}
                      ${app.status === 'INTERVIEW' ? 'text-yellow-500' : ''}
                      ${app.status === 'REJECTED' ? 'text-red-500' : ''}
                      ${app.status === 'APPLIED' ? 'text-[var(--color-accent)]' : ''}
                      ${app.status === 'WISHLIST' ? 'text-secondary' : ''}
                    `} />
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-primary">{app.role}</h3>
                      <span className="text-secondary">at</span>
                      <span className="text-base font-semibold text-primary">{app.companyName}</span>
                      
                      <Badge tone={STATUS_CONFIG[app.status].tone} className="ml-2 text-[10px] px-2 py-0.5">
                        {STATUS_CONFIG[app.status].label}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary mt-1.5">
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <Target size={12} /> {app.location}
                        </span>
                      )}
                      {app.salaryRange && (
                        <span className="flex items-center gap-1 font-mono text-[var(--color-success,auto)]">
                          $ {app.salaryRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {app.appliedDate || 'No date'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noreferrer" className="p-1.5 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors" title="View Job Post">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button onClick={() => setCoverLetterModalApp(app)} className="p-1.5 text-secondary hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors" title="AI Cover Letter">
                      <Wand2 size={16} />
                    </button>
                    <button onClick={() => deleteApp.mutate(app.id)} className="p-1.5 text-secondary hover:text-danger hover:bg-red-500/10 rounded-md transition-colors" title="Delete Application">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredApps.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-inset)] border border-[var(--color-border-default)] flex items-center justify-center mb-4">
                  <Briefcase size={24} className="text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">No applications found</h3>
                <p className="text-secondary text-sm max-w-sm mb-6">
                  You haven't tracked any applications matching this criteria yet.
                </p>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Add your first application
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {coverLetterModalApp && (
        <AiCoverLetterModal 
          app={coverLetterModalApp} 
          isOpen={!!coverLetterModalApp} 
          onClose={() => setCoverLetterModalApp(null)} 
        />
      )}
    </div>
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
          <Label htmlFor="status">Pipeline Status</Label>
          <select 
            id="status" 
            className="w-full h-10 px-3 rounded-md bg-[var(--color-bg-primary)] border border-default text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div><Label htmlFor="jobUrl">Job URL</Label><Input id="jobUrl" type="url" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="location">Location</Label><Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
          <div><Label htmlFor="salaryRange">Salary Range</Label><Input id="salaryRange" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} /></div>
        </div>
        <div><Label htmlFor="appliedDate">Applied Date</Label><Input id="appliedDate" type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} /></div>
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border-default)]">
          <Button type="submit" variant="primary" className="flex-1" disabled={addApp.isPending}>{addApp.isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

const AiCoverLetterModal = ({ app, isOpen, onClose }: { app: JobApplicationDto; isOpen: boolean; onClose: () => void }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const generate = useGenerateCoverLetter();

  const handleGenerate = () => {
    if (!jobDescription.trim()) return;
    generate.mutate(
      { jobDescription, targetRole: app.role },
      {
        onSuccess: (data: any) => {
          setCoverLetter(data.coverLetter);
        },
        onError: (err: any) => {
          console.error(err);
          alert('Failed to generate cover letter. ' + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Cover Letter Generator">
      <div className="space-y-4 pt-2 w-[500px] max-w-[90vw]">
        {!coverLetter ? (
          <>
            <div>
              <Label>Job Description</Label>
              <textarea 
                className="w-full h-40 p-3 mt-1 rounded-md bg-[var(--color-bg-primary)] border border-default text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none resize-none"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <Wand2 size={12} /> AI will use vector search to match your projects to this JD.
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button onClick={handleGenerate} variant="primary" className="flex-1" disabled={generate.isPending || !jobDescription.trim()}>
                {generate.isPending ? 'Generating (RAG)...' : 'Generate with AI'}
              </Button>
              <Button onClick={onClose} variant="outline">Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Generated Cover Letter</Label>
              <textarea 
                className="w-full h-64 p-3 mt-1 rounded-md bg-[var(--color-bg-primary)] border border-default text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button onClick={() => navigator.clipboard.writeText(coverLetter)} variant="primary" className="flex-1">
                Copy to Clipboard
              </Button>
              <Button onClick={() => setCoverLetter('')} variant="outline">Back</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
