import { useState } from 'react';
import { useProfile, useAddProject, useUpdateProject, useDeleteProject } from '../../../shared/api/hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus } from 'lucide-react';

export function ProjectsForm() {
  const { data: profile } = useProfile();
  const { mutate: addProject, isPending: isAdding } = useAddProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    techStack: '',
    isVisible: true,
    isFeatured: false,
  });

  const handleEdit = (proj: any) => {
    setFormData({
      name: proj.name || '',
      description: proj.description || '',
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      techStack: proj.techStack || '',
      isVisible: proj.isVisible !== false,
      isFeatured: proj.isFeatured || false,
    });
    setEditingId(proj.id);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      description: '',
      githubUrl: '',
      liveUrl: '',
      techStack: '',
      isVisible: true,
      isFeatured: false,
    });
    setEditingId('new');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === 'new') {
      addProject(formData, {
        onSuccess: () => {
          toast.success('Project added');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to add project'),
      });
    } else if (editingId) {
      updateProject({ id: editingId, payload: formData }, {
        onSuccess: () => {
          toast.success('Project updated');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to update project'),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      deleteProject(id, {
        onSuccess: () => toast.success('Deleted'),
      });
    }
  };

  const inputClass = "w-full rounded-md px-3 py-2 text-sm transition-colors border focus:outline-none";
  const inputStyle = {
    backgroundColor: 'var(--color-bg-primary)',
    borderColor: 'var(--color-border-default)',
    color: 'var(--color-text-primary)'
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
      {editingId && (<div className="flex items-center justify-end mb-4"><button type="button" onClick={() => setEditingId(null)} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-text-muted)' }}>Cancel Edit</button></div>)}

      {!editingId ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20">
          {profile?.projects?.map((proj: any) => (
            <div key={proj.id} className="p-3 rounded-md border flex items-start justify-between" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{proj.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {proj.isVisible ? 'Visible in Resume' : 'Hidden from Resume'}
                  {proj.isFeatured && ' • Featured in Portfolio'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(proj)} className="p-1 hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(proj.id)} className="p-1 hover:text-red-500 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2" variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}>
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Project Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClass} style={inputStyle} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>GitHub URL</label>
            <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Live URL</label>
            <input name="liveUrl" value={formData.liveUrl} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tech Stack</label>
            <input name="techStack" value={formData.techStack} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="React, Node, etc." />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleChange} className="rounded" />
              <label htmlFor="isVisible" className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Show in Resume</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" id="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded" />
              <label htmlFor="isFeatured" className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Featured in Portfolio</label>
            </div>
          </div>
          <div className="pt-4 border-t mt-auto flex justify-end" style={{ borderColor: 'var(--color-border-default)' }}>
            <Button type="submit" disabled={isAdding || isUpdating} className="text-white px-6 font-medium" style={{ backgroundColor: 'var(--color-accent)' }}>
              {isAdding || isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
