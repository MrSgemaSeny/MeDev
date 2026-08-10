import { useState } from 'react';
import { useProfile, useAddProject, useUpdateProject, useDeleteProject } from '../../../shared/api/hooks/useProfile';
import type { ProjectDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label, Card } from '../../../shared/ui/Form';

export const ProjectsSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const projects = profile?.projects || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Projects</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add project</Button>
        )}
      </div>
      <div className="space-y-3">
        {projects.map((proj) =>
          editingId === proj.id ? (
            <ProjectForm key={proj.id} initialData={proj}
              onSave={(data) => { updateMutation.mutate({ id: proj.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card key={proj.id} className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{proj.name}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>{proj.url}</a>
                  )}
                  {(proj.startDate || proj.endDate) && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{proj.startDate} {proj.endDate ? `— ${proj.endDate}` : ''}</p>
                  )}
                  {proj.description && <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{proj.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingId(proj.id)} className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>Edit</button>
                  <button onClick={() => deleteMutation.mutate(proj.id)} className="text-sm hover:underline" style={{ color: 'var(--color-danger)' }}>Delete</button>
                </div>
              </div>
            </Card>
          )
        )}
        {editingId === 'new' && (
          <ProjectForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        )}
      </div>
    </div>
  );
};

interface ProjectFormProps {
  initialData?: ProjectDto;
  onSave: (data: Omit<ProjectDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    description: initialData?.description || '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="name">Project Name</Label><Input id="name" required name="name" value={formData.name} onChange={handleChange} /></div>
          <div><Label htmlFor="url">URL (Optional)</Label><Input id="url" type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="startDate">Start Date (Optional)</Label><Input id="startDate" type="month" name="startDate" value={formData.startDate} onChange={handleChange} /></div>
          <div><Label htmlFor="endDate">End Date (Optional)</Label><Input id="endDate" type="month" name="endDate" value={formData.endDate} onChange={handleChange} /></div>
        </div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} /></div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
