import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobApplications, useAddJobApplication, useDeleteJobApplication, useUpdateJobApplication, useGenerateCoverLetter, useScrapeJob, useMatchJob } from '../../entities/job-tracker/api/hooks';
import { KanbanBoard } from '../../features/job-tracker/ui/KanbanBoard';
import { AiTailorModal } from '../../features/job-tracker/ui/AiTailorModal';
import type { ApplicationStatus, JobApplicationDto, CreateJobApplicationRequest } from '../../entities/job-tracker/model/types';
import { Button } from '../../shared/ui/Button';
import { Input, Label, Badge } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { 
  Plus, 
  Briefcase, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wand2, 
  Sparkles, 
  LayoutGrid, 
  List as ListIcon, 
  MapPin, 
  DollarSign,
  X
} from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; tone: 'default' | 'accent' | 'danger'; colorClass: string; icon: any }> = {
  WISHLIST: { label: 'Wishlist', tone: 'default', colorClass: 'text-secondary', icon: Clock },
  APPLIED: { label: 'Applied', tone: 'accent', colorClass: 'text-blue-400', icon: Target },
  INTERVIEW: { label: 'Interviewing', tone: 'accent', colorClass: 'text-amber-400', icon: TrendingUp },
  OFFER: { label: 'Offer', tone: 'accent', colorClass: 'text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'danger', colorClass: 'text-red-400', icon: XCircle },
};

export const JobTrackerPage = () => {
  const { t } = useTranslation();
  const { data: applications = [], isLoading } = useJobApplications();
  const deleteApp = useDeleteJobApplication();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetterModalApp, setCoverLetterModalApp] = useState<JobApplicationDto | null>(null);
  const [tailorModalApp, setTailorModalApp] = useState<JobApplicationDto | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const updateApp = useUpdateJobApplication();

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.companyName.toLowerCase().includes(search.toLowerCase()) || 
                            app.role.toLowerCase().includes(search.toLowerCase()) ||
                            (app.location && app.location.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime());
  }, [applications, search, statusFilter]);

  const stats = useMemo(() => {
    const total = applications.length;
    const wishlist = applications.filter(a => a.status === 'WISHLIST').length;
    const applied = applications.filter(a => a.status === 'APPLIED').length;
    const interview = applications.filter(a => a.status === 'INTERVIEW').length;
    const offer = applications.filter(a => a.status === 'OFFER').length;
    const rejected = applications.filter(a => a.status === 'REJECTED').length;
    return { total, wishlist, applied, interview, offer, rejected };
  }, [applications]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg-inset)]">
        <div className="flex flex-col items-center gap-2 text-secondary text-sm">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <span>{t('tracker.loading', 'Loading CRM...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-inset)] min-w-0 overflow-hidden">
      {/* Top Header & Action Bar */}
      <header className="px-4 py-3 sm:px-6 border-b border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-primary tracking-tight">{t('tracker.title', 'Job Tracker CRM')}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-secondary border border-[var(--color-border-default)]">
                {stats.total}
              </span>
            </div>
            <p className="text-xs text-secondary hidden sm:block mt-0.5">
              {t('tracker.subtitle', 'Enterprise-grade pipeline management for your career.')}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder={t('tracker.searchPlaceholder', 'Search company or role...')} 
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-md focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all text-primary placeholder-muted"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center border border-[var(--color-border-default)] rounded-md bg-[var(--color-bg-secondary)] p-0.5">
            <button 
              onClick={() => setViewMode('kanban')} 
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-[var(--color-bg-primary)] text-primary font-medium shadow-xs' 
                  : 'text-secondary hover:text-primary'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">{t('tracker.board', 'Board')}</span>
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[var(--color-bg-primary)] text-primary font-medium shadow-xs' 
                  : 'text-secondary hover:text-primary'
              }`}
              title="List View"
            >
              <ListIcon size={13} />
              <span className="hidden sm:inline">{t('tracker.list', 'List')}</span>
            </button>
          </div>

          {/* Status Filter (List View) */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-secondary" />
              <select 
                className="py-1.5 px-2.5 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-md outline-none text-primary hover:border-[var(--color-border-muted,#484f58)] transition-colors cursor-pointer"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
              >
                <option value="ALL">{t('tracker.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{t(`tracker.status.${k.toLowerCase()}`, v.label)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Add Application Button */}
          <Button 
            variant="primary" 
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={14} />
            <span>{t('tracker.newApplication', 'New Application')}</span>
          </Button>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="px-4 py-2 sm:px-6 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-default)] flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
        <button 
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'ALL'
              ? 'border-[var(--color-accent)] bg-[var(--color-bg-primary)] text-primary font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <Briefcase size={12} className="text-secondary" />
          <span>{t('tracker.stats.total', 'Total')}:</span>
          <span className="font-semibold text-primary">{stats.total}</span>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'WISHLIST' ? 'ALL' : 'WISHLIST')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'WISHLIST'
              ? 'border-gray-400 bg-[var(--color-bg-primary)] text-primary font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <Clock size={12} className="text-secondary" />
          <span>{t('tracker.status.wishlist', 'Wishlist')}:</span>
          <span className="font-semibold text-primary">{stats.wishlist}</span>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'APPLIED' ? 'ALL' : 'APPLIED')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'APPLIED'
              ? 'border-blue-500 bg-[var(--color-bg-primary)] text-blue-400 font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <Target size={12} className="text-blue-400" />
          <span>{t('tracker.status.applied', 'Applied')}:</span>
          <span className="font-semibold text-primary">{stats.applied}</span>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'INTERVIEW' ? 'ALL' : 'INTERVIEW')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'INTERVIEW'
              ? 'border-amber-500 bg-[var(--color-bg-primary)] text-amber-400 font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <TrendingUp size={12} className="text-amber-400" />
          <span>{t('tracker.status.interview', 'Interview')}:</span>
          <span className="font-semibold text-primary">{stats.interview}</span>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'OFFER' ? 'ALL' : 'OFFER')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'OFFER'
              ? 'border-emerald-500 bg-[var(--color-bg-primary)] text-emerald-400 font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>{t('tracker.status.offer', 'Offer')}:</span>
          <span className="font-semibold text-primary">{stats.offer}</span>
        </button>

        <button 
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
            statusFilter === 'REJECTED'
              ? 'border-red-500 bg-[var(--color-bg-primary)] text-red-400 font-medium'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-secondary hover:text-primary'
          }`}
        >
          <XCircle size={12} className="text-red-400" />
          <span>{t('tracker.status.rejected', 'Rejected')}:</span>
          <span className="font-semibold text-primary">{stats.rejected}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-[var(--color-bg-inset)]">
          <KanbanBoard 
            applications={filteredApps} 
            onStatusChange={(id, status) => updateApp.mutate({ id, payload: { status } })}
            onTailor={setTailorModalApp}
            onCoverLetter={setCoverLetterModalApp}
            onDelete={(id) => deleteApp.mutate(id)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[var(--color-bg-inset)]">
          <div className="max-w-6xl mx-auto border border-[var(--color-border-default)] rounded-xl bg-[var(--color-bg-primary)] overflow-hidden shadow-sm divide-y divide-[var(--color-border-default)]">
            {filteredApps.map(app => {
              const statusCfg = STATUS_CONFIG[app.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div key={app.id} className="p-4 hover:bg-[var(--color-bg-secondary)] transition-colors group flex items-start gap-3">
                  {/* Left Icon */}
                  <div className="mt-1">
                    <StatusIcon size={18} className={statusCfg.colorClass} />
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-primary">{app.role}</h3>
                      <span className="text-secondary text-sm">at</span>
                      <span className="text-base font-semibold text-primary">{app.companyName}</span>
                      
                      <Badge tone={statusCfg.tone} className="ml-2 text-[10px] px-2 py-0.5">
                        {statusCfg.label}
                      </Badge>
                      {app.matchScore != null && (
                        <Badge tone={app.matchScore > 75 ? 'accent' : 'default'} className="text-[10px] px-2 py-0.5">
                          {app.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary mt-1.5">
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {app.location}
                        </span>
                      )}
                      {app.salaryRange && (
                        <span className="flex items-center gap-0.5 font-mono text-emerald-400">
                          <DollarSign size={12} /> {app.salaryRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-muted">
                        <Calendar size={12} /> {app.appliedDate || 'No date'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    {app.jobUrl && (
                      <a 
                        href={app.jobUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors" 
                        title="View Job Post"
                        aria-label="View Job Post"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button 
                      onClick={() => setTailorModalApp(app)} 
                      className="p-2 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors" 
                      title="AI Resume Tailoring"
                      aria-label="AI Resume Tailoring"
                    >
                      <Sparkles size={15} />
                    </button>
                    <button 
                      onClick={() => setCoverLetterModalApp(app)} 
                      className="p-2 text-secondary hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors" 
                      title="AI Cover Letter"
                      aria-label="AI Cover Letter"
                    >
                      <Wand2 size={15} />
                    </button>
                    <button 
                      onClick={() => deleteApp.mutate(app.id)} 
                      className="p-2 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" 
                      title="Delete Application"
                      aria-label="Delete Application"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredApps.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-bg-inset)] border border-[var(--color-border-default)] flex items-center justify-center mb-3">
                  <Briefcase size={22} className="text-muted" />
                </div>
                <h3 className="text-base font-semibold text-primary mb-1">
                  {t('tracker.emptyTitle', 'No applications found')}
                </h3>
                <p className="text-secondary text-xs max-w-sm mb-5">
                  {t('tracker.emptyDesc', "You haven't tracked any applications matching this criteria yet.")}
                </p>
                <Button variant="primary" className="text-xs" onClick={() => setIsModalOpen(true)}>
                  <Plus size={14} className="mr-1" /> {t('tracker.newApplication', 'New Application')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {tailorModalApp && (
        <AiTailorModal 
          app={tailorModalApp} 
          isOpen={!!tailorModalApp} 
          onClose={() => setTailorModalApp(null)} 
        />
      )}
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
  const scrapeJob = useScrapeJob();
  const matchJob = useMatchJob();

  const [importUrl, setImportUrl] = useState('');
  
  const [formData, setFormData] = useState<CreateJobApplicationRequest>({
    companyName: '',
    role: '',
    status: 'WISHLIST',
    jobUrl: '',
    location: '',
    salaryRange: '',
    jobDescription: '',
    matchScore: undefined,
    matchFeedback: '',
    appliedDate: new Date().toISOString().split('T')[0],
  });

  const handleImport = () => {
    if (!importUrl) return;
    scrapeJob.mutate(importUrl, {
      onSuccess: (data) => {
        setFormData(prev => ({
          ...prev,
          ...data,
          jobUrl: importUrl,
        }));
        
        // After scraping, if there's a job description, trigger match
        if (data.jobDescription) {
          matchJob.mutate(data.jobDescription, {
            onSuccess: (matchData) => {
              setFormData(prev => ({
                ...prev,
                matchScore: matchData.score,
                matchFeedback: matchData.feedback
              }));
            }
          });
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addApp.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({ 
          companyName: '', role: '', status: 'WISHLIST', jobUrl: '', location: '', salaryRange: '', jobDescription: '', matchScore: undefined, matchFeedback: '', appliedDate: new Date().toISOString().split('T')[0] 
        });
        setImportUrl('');
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Job Application">
      <div className="space-y-4 pt-2">
        {/* Import section */}
        <div className="flex gap-2 items-end border-b border-[var(--color-border-default)] pb-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="importUrl">Import from URL (HH.kz, LinkedIn)</Label>
            <Input id="importUrl" placeholder="https://hh.kz/vacancy/..." value={importUrl} onChange={e => setImportUrl(e.target.value)} />
          </div>
          <Button type="button" variant="primary" onClick={handleImport} disabled={scrapeJob.isPending || !importUrl}>
            {scrapeJob.isPending ? 'Scraping...' : 'Import'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label htmlFor="companyName">Company</Label><Input id="companyName" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} /></div>
            <div><Label htmlFor="role">Role</Label><Input id="role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
          </div>
          <div>
            <Label htmlFor="status">Pipeline Status</Label>
            <select 
              id="status" 
              className="w-full h-10 px-3 rounded-md bg-[var(--color-bg-primary)] border border-default text-[16px] md:text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div><Label htmlFor="jobUrl">Job URL</Label><Input id="jobUrl" type="url" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label htmlFor="location">Location</Label><Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            <div><Label htmlFor="salaryRange">Salary Range</Label><Input id="salaryRange" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} /></div>
          </div>
          
          {formData.jobDescription && (
            <div>
              <Label>Job Description (Auto-extracted)</Label>
              <div className="text-xs text-secondary max-h-24 overflow-y-auto bg-[var(--color-bg-inset)] p-2 rounded border border-[var(--color-border-default)]">
                {formData.jobDescription}
              </div>
            </div>
          )}

          {formData.matchScore != null && (
            <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-primary">AI Profile Match</span>
                <Badge tone={formData.matchScore > 75 ? 'accent' : 'default'} className="text-xs">{formData.matchScore}%</Badge>
              </div>
              <p className="text-xs text-secondary mt-1">{formData.matchFeedback}</p>
            </div>
          )}
          {matchJob.isPending && (
            <div className="text-xs text-[var(--color-accent)] flex items-center gap-1 animate-pulse">
              <Wand2 size={12} /> Analyzing match with your profile...
            </div>
          )}

          <div><Label htmlFor="appliedDate">Applied Date</Label><Input id="appliedDate" type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} /></div>
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border-default)]">
            <Button type="submit" variant="primary" className="flex-1" disabled={addApp.isPending}>{addApp.isPending ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const AiCoverLetterModal = ({ app, isOpen, onClose }: { app: JobApplicationDto; isOpen: boolean; onClose: () => void }) => {
  const [jobDescription, setJobDescription] = useState(app.jobDescription || '');
  const [coverLetter, setCoverLetter] = useState('');
  const generate = useGenerateCoverLetter();

  const handleGenerate = () => {
    if (!jobDescription.trim()) return;
    generate.mutate(
      { jobDescription: jobDescription.trim(), targetRole: app.role },
      {
        onSuccess: (data: any) => {
          setCoverLetter(data.content || data.coverLetter || '');
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
                className="w-full h-40 p-3 mt-1 rounded-md bg-[var(--color-bg-primary)] border border-default text-[16px] md:text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none resize-none"
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
                className="w-full h-64 p-3 mt-1 rounded-md bg-[var(--color-bg-primary)] border border-default text-[16px] md:text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
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
