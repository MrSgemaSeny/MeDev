import { useState, useMemo } from 'react';
import { useJobApplications, useAddJobApplication, useUpdateJobApplication, useDeleteJobApplication } from '../../shared/api/hooks/useJobTracker';
import type { ApplicationStatus, JobApplicationDto, CreateJobApplicationRequest } from '../../entities/job-tracker/model/types';
import { Button } from '../../shared/ui/Button';
import { Input, Label, Card, Badge } from '../../shared/ui/Form';
import { Modal } from '../../shared/ui/Modal';
import { Plus, Briefcase, ExternalLink, Calendar, Trash2, Search, Filter, TrendingUp, Target, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; tone: 'default' | 'primary' | 'success' | 'danger' | 'warning', icon: any }> = {
  WISHLIST: { label: 'Wishlist', tone: 'default', icon: Clock },
  APPLIED: { label: 'Applied', tone: 'primary', icon: Target },
  INTERVIEW: { label: 'Interviewing', tone: 'warning', icon: TrendingUp },
  OFFER: { label: 'Offer', tone: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'danger', icon: XCircle },
};

export const JobTrackerPage = () => {
  const { data: applications = [], isLoading } = useJobApplications();
  const deleteApp = useDeleteJobApplication();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      <div className="p-6 flex-1 overflow-auto space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]">
            <div className="text-sm font-medium text-secondary mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </Card>
          <Card className="p-5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]">
            <div className="text-sm font-medium text-secondary mb-1">Active Pipeline</div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">{stats.active}</div>
          </Card>
          <Card className="p-5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]">
            <div className="text-sm font-medium text-secondary mb-1">Interviews</div>
            <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{stats.interviews}</div>
          </Card>
          <Card className="p-5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]">
            <div className="text-sm font-medium text-secondary mb-1">Offers</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.offers}</div>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--color-border-default)] flex gap-4 bg-[var(--color-bg-secondary)]">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input 
                type="text" 
                placeholder="Search company or role..." 
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-md focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-shadow"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-secondary" />
              <select 
                className="py-1.5 px-3 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-md outline-none"
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-bg-tertiary)] text-secondary text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-border-default)]">
                <tr>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Salary Range</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default)]">
                {filteredApps.map(app => {
                  const StatusIcon = STATUS_CONFIG[app.status].icon;
                  return (
                    <tr key={app.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-primary">{app.companyName}</div>
                        <div className="text-secondary text-xs mt-0.5">{app.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={STATUS_CONFIG[app.status].tone} className="flex items-center gap-1.5 w-max px-2.5 py-1">
                          <StatusIcon size={12} />
                          {STATUS_CONFIG[app.status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-secondary">{app.location || '—'}</td>
                      <td className="px-6 py-4 font-mono text-[var(--color-success,auto)]">{app.salaryRange || '—'}</td>
                      <td className="px-6 py-4 text-secondary flex items-center gap-1.5">
                        {app.appliedDate ? <><Calendar size={14} /> {app.appliedDate}</> : '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {app.jobUrl && (
                          <a href={app.jobUrl} target="_blank" rel="noreferrer" className="text-[var(--color-link)] hover:underline inline-flex items-center gap-1">
                            Link <ExternalLink size={12} />
                          </a>
                        )}
                        <button onClick={() => deleteApp.mutate(app.id)} className="text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                      No applications found. Adjust filters or add a new one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
