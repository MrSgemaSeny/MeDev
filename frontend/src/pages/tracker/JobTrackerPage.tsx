import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobApplications, useAddJobApplication, useDeleteJobApplication, useUpdateJobApplication, useGenerateCoverLetter, useScrapeJob, useMatchJob } from '../../entities/job-tracker/api/hooks';
import { KanbanBoard } from '../../features/job-tracker/ui/KanbanBoard';
import { AiTailorModal } from '../../features/job-tracker/ui/AiTailorModal';
import type { ApplicationStatus, JobApplicationDto, CreateJobApplicationRequest } from '../../entities/job-tracker/model/types';
import { Button } from '../../shared/ui/Button';
import { Input, Label, Badge } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { toast } from 'sonner';
import { 
  Plus, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  Search, 
  Wand2, 
  Sparkles, 
  LayoutGrid, 
  List as ListIcon, 
  MapPin, 
  DollarSign
} from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string }> = {
  WISHLIST: { label: 'В планах' },
  APPLIED: { label: 'Отправлено' },
  INTERVIEW: { label: 'Собеседование' },
  OFFER: { label: 'Оффер' },
  REJECTED: { label: 'Отказ' },
};

export const JobTrackerPage = () => {
  const { t } = useTranslation();
  const { data: applications = [], isLoading } = useJobApplications();
  const deleteApp = useDeleteJobApplication();
  const scrapeJob = useScrapeJob();
  const addApp = useAddJobApplication();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetterModalApp, setCoverLetterModalApp] = useState<JobApplicationDto | null>(null);
  const [tailorModalApp, setTailorModalApp] = useState<JobApplicationDto | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [quickUrl, setQuickUrl] = useState('');
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

  const handleQuickImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    const targetUrl = quickUrl.trim();
    scrapeJob.mutate(targetUrl, {
      onSuccess: (data) => {
        addApp.mutate({
          companyName: data.companyName && data.companyName !== 'Failed to scrape' ? data.companyName : 'Новая вакансия',
          role: data.role && data.role !== 'Manual Entry Required' ? data.role : 'Разработчик',
          status: 'WISHLIST',
          jobUrl: targetUrl,
          location: data.location || '',
          salaryRange: data.salaryRange || '',
          jobDescription: data.jobDescription || '',
          appliedDate: new Date().toISOString().split('T')[0],
        }, {
          onSuccess: () => {
            setQuickUrl('');
            toast.success(t('tracker.importSuccess', 'Вакансия успешно импортирована'));
          },
          onError: () => {
            toast.error(t('tracker.importError', 'Не удалось сохранить вакансию'));
          }
        });
      },
      onError: () => {
        // Fallback: create an entry with the URL so the user does not lose progress
        addApp.mutate({
          companyName: 'Новая вакансия',
          role: 'Разработчик',
          status: 'WISHLIST',
          jobUrl: targetUrl,
          appliedDate: new Date().toISOString().split('T')[0],
        }, {
          onSuccess: () => {
            setQuickUrl('');
            toast.info(t('tracker.manualImportFallback', 'Ссылка сохранена. Заполните описание вручную.'));
          },
          onError: () => {
            toast.error(t('tracker.importError', 'Не удалось добавить вакансию'));
          }
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg-inset)]">
        <div className="flex flex-col items-center gap-2 text-secondary text-sm">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-inset)] min-w-0 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="px-4 py-3.5 sm:px-6 border-b border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base sm:text-lg font-semibold text-primary tracking-tight">
            Отслеживание вакансий
          </h1>
          {applications.length > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-secondary border border-[var(--color-border-default)] font-medium">
              {stats.total}
            </span>
          )}
        </div>

        {/* Toolbar Controls - Visible only when applications exist */}
        {applications.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-[var(--color-border-default)] rounded-[6px] bg-[var(--color-bg-secondary)] p-0.5">
              <button 
                onClick={() => setViewMode('kanban')} 
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[4px] transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-[var(--color-bg-tertiary)] text-primary font-medium' 
                    : 'text-secondary hover:text-primary'
                }`}
                title="Канбан-доска"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Доска</span>
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[4px] transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[var(--color-bg-tertiary)] text-primary font-medium' 
                    : 'text-secondary hover:text-primary'
                }`}
                title="Список"
              >
                <ListIcon size={13} />
                <span className="hidden sm:inline">Список</span>
              </button>
            </div>

            {/* Add Application Button */}
            <button 
              type="button"
              className="flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold rounded-[6px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer" 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={14} />
              <span>+ Новый отклик</span>
            </button>
          </div>
        )}
      </header>

      {/* Segmented Status Tabs - Visible only when applications exist */}
      {applications.length > 0 && (
        <nav className="px-4 sm:px-6 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-default)] flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 text-xs py-1">
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'ALL'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>Все</span>
            <span className="text-[11px] font-mono opacity-70">({stats.total})</span>
          </button>

          <button 
            onClick={() => setStatusFilter('WISHLIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'WISHLIST'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>В планах</span>
            <span className="text-[11px] font-mono opacity-70">({stats.wishlist})</span>
          </button>

          <button 
            onClick={() => setStatusFilter('APPLIED')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'APPLIED'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>Отправлено</span>
            <span className="text-[11px] font-mono opacity-70">({stats.applied})</span>
          </button>

          <button 
            onClick={() => setStatusFilter('INTERVIEW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'INTERVIEW'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>Собеседование</span>
            <span className="text-[11px] font-mono opacity-70">({stats.interview})</span>
          </button>

          <button 
            onClick={() => setStatusFilter('OFFER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'OFFER'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>Оффер</span>
            <span className="text-[11px] font-mono opacity-70">({stats.offer})</span>
          </button>

          <button 
            onClick={() => setStatusFilter('REJECTED')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors shrink-0 font-medium ${
              statusFilter === 'REJECTED'
                ? 'bg-[var(--color-bg-tertiary)] text-primary border border-[var(--color-border-default)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <span>Отказ</span>
            <span className="text-[11px] font-mono opacity-70">({stats.rejected})</span>
          </button>
        </nav>
      )}

      {/* Main Workspace Area */}
      {applications.length === 0 ? (
        /* СОСТОЯНИЕ 1 — EMPTY STATE (нет откликов) */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-inset)]">
          <div className="w-full max-w-[540px] flex flex-col items-center">
            {/* Заголовок */}
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight mb-3">
              Добавьте первую вакансию
            </h2>

            {/* Подзаголовок */}
            <p className="text-sm sm:text-base text-secondary max-w-[480px] text-center leading-relaxed mb-8">
              Вставьте ссылку с hh.kz или LinkedIn — мы автоматически извлечём роль, компанию, требования и зарплату
            </p>

            {/* Инпут + кнопка в одну строку */}
            <form onSubmit={handleQuickImport} className="w-full mb-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input 
                  type="url"
                  placeholder="https://hh.kz/vacancy/... или LinkedIn URL"
                  className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-[6px] px-4 py-3 text-sm text-primary placeholder:text-secondary focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                  value={quickUrl}
                  onChange={e => setQuickUrl(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={scrapeJob.isPending || !quickUrl.trim()}
                  className="h-11 sm:h-auto px-6 py-3 bg-[var(--color-accent)] text-white font-semibold text-sm rounded-[6px] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {scrapeJob.isPending ? 'Импортирование...' : 'Импортировать'}
                </button>
              </div>
            </form>

            {/* Ссылка под инпутом */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-secondary hover:text-primary hover:underline text-sm transition-colors cursor-pointer"
            >
              или заполнить вручную →
            </button>
          </div>
        </div>
      ) : filteredApps.length === 0 ? (
        /* Filter/Search Zero Results */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-inset)]">
          <Search size={32} className="text-secondary mb-3" />
          <h3 className="text-base font-semibold text-primary mb-1">
            Вакансии не найдены
          </h3>
          <p className="text-secondary text-xs max-w-sm mb-4">
            Попробуйте сбросить поисковый запрос или выбрать другой статус.
          </p>
          <button 
            type="button"
            className="text-xs px-4 py-2 rounded-[6px] border border-[var(--color-border-default)] text-primary hover:bg-[var(--color-bg-secondary)] transition-colors" 
            onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* СОСТОЯНИЕ 2 — КАНБАН (есть данные) */
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
        /* Список (List View) */
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[var(--color-bg-inset)]">
          <div className="border border-[var(--color-border-default)] rounded-[8px] bg-[var(--color-bg-primary)] overflow-hidden divide-y divide-[var(--color-border-default)]">
            {filteredApps.map(app => {
              const statusCfg = STATUS_CONFIG[app.status];
              return (
                <div key={app.id} className="p-4 hover:bg-[var(--color-bg-secondary)] transition-colors group flex items-start sm:items-center justify-between gap-4">
                  {/* Left: Role / Company */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-primary truncate">{app.role}</h3>
                      <span className="text-secondary text-xs">в</span>
                      <span className="text-sm font-medium text-secondary truncate">{app.companyName}</span>
                      
                      <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[var(--color-bg-secondary)] text-secondary border border-[var(--color-border-default)] shrink-0">
                        {statusCfg.label}
                      </span>
                      {app.matchScore != null && (
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium shrink-0">
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary mt-1.5">
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {app.location}
                        </span>
                      )}
                      {app.salaryRange && (
                        <span className="flex items-center gap-0.5 font-mono text-secondary">
                          <DollarSign size={12} /> {app.salaryRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-secondary text-[11px]">
                        <Calendar size={12} /> {app.appliedDate || 'No date'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {app.jobUrl && (
                      <a 
                        href={app.jobUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                        title="Ссылка на вакансию"
                        aria-label="Ссылка на вакансию"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button 
                      onClick={() => setTailorModalApp(app)} 
                      className="p-1.5 text-secondary hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                      title="AI Адаптация"
                      aria-label="AI Адаптация"
                    >
                      <Sparkles size={14} />
                    </button>
                    <button 
                      onClick={() => setCoverLetterModalApp(app)} 
                      className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                      title="Cover Letter"
                      aria-label="Cover Letter"
                    >
                      <Wand2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteApp.mutate(app.id)} 
                      className="p-1.5 text-secondary hover:text-primary hover:bg-[var(--color-bg-tertiary)] rounded-[6px] transition-colors" 
                      title="Удалить"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
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
  const { t } = useTranslation();
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
      },
      onError: () => {
        setFormData(prev => ({
          ...prev,
          jobUrl: importUrl,
        }));
        toast.error(t('tracker.scrapeFailedNotice', 'Не удалось автоматически распарсить страницу. Заполните поля вручную.'));
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add Job Application" maxWidth="max-w-3xl">
      <div className="space-y-5 pt-1">
        {/* Quick URL Import Bar */}
        <div className="p-3.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]">
          <Label htmlFor="importUrl" className="text-xs font-semibold mb-2 block text-primary">
            Import from URL (HH.kz, LinkedIn)
          </Label>
          <div className="flex gap-2">
            <Input 
              id="importUrl" 
              placeholder="https://hh.kz/vacancy/... or LinkedIn URL" 
              value={importUrl} 
              onChange={e => setImportUrl(e.target.value)} 
              className="flex-1 bg-[var(--color-bg-primary)] h-10 text-xs"
            />
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleImport} 
              disabled={scrapeJob.isPending || !importUrl.trim()}
              className="h-10 px-5 text-xs font-medium shrink-0"
            >
              {scrapeJob.isPending ? 'Scraping...' : 'Import'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="h-10" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Pipeline Status</Label>
              <select 
                id="status" 
                className="w-full h-10 px-3 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="appliedDate">Applied Date</Label>
              <Input id="appliedDate" type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Almaty, Remote" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-10" />
            </div>
            <div>
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input id="salaryRange" placeholder="e.g. $3,000 - $4,500" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="h-10" />
            </div>
          </div>

          <div>
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input id="jobUrl" type="url" placeholder="https://..." value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} className="h-10" />
          </div>
          
          {formData.jobDescription && (
            <div>
              <Label>Job Description (Auto-extracted)</Label>
              <div className="text-xs text-secondary max-h-32 overflow-y-auto bg-[var(--color-bg-secondary)] p-3 rounded-md border border-[var(--color-border-default)] leading-relaxed whitespace-pre-wrap">
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
            <div className="text-xs text-[var(--color-accent)]">
              Analyzing match with your profile...
            </div>
          )}

          <div className="flex gap-3 pt-3 border-t border-[var(--color-border-default)]">
            <Button type="submit" variant="primary" className="flex-1 h-10" disabled={addApp.isPending}>
              {addApp.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" className="px-6 h-10" onClick={onClose}>
              Cancel
            </Button>
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
