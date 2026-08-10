import { useState } from 'react';
import { useProfile, useAddExperience, useUpdateExperience, useDeleteExperience } from '../../../shared/api/hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus } from 'lucide-react';

export function ExperienceForm({ onClose }: { onClose: () => void }) {
  const { data: profile } = useProfile();
  const { mutate: addExperience, isPending: isAdding } = useAddExperience();
  const { mutate: updateExperience, isPending: isUpdating } = useUpdateExperience();
  const { mutate: deleteExperience } = useDeleteExperience();
  
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    techStack: '',
  });

  const handleEdit = (exp: any) => {
    setFormData({
      position: exp.position || '',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
      techStack: exp.techStack || '',
    });
    setEditingId(exp.id);
  };

  const handleAddNew = () => {
    setFormData({
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      techStack: '',
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
      addExperience(formData, {
        onSuccess: () => {
          toast.success('Experience added');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to add experience'),
      });
    } else if (editingId) {
      updateExperience({ id: editingId, payload: formData }, {
        onSuccess: () => {
          toast.success('Experience updated');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to update experience'),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      deleteExperience(id, {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Experience</h3>
        <button onClick={editingId ? () => setEditingId(null) : onClose} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-text-muted)' }}>
          {editingId ? 'Cancel' : 'Back'}
        </button>
      </div>

      {!editingId ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20">
          {profile?.experience?.map((exp: any) => (
            <div key={exp.id} className="p-3 rounded-md border flex items-start justify-between" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{exp.position}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{exp.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(exp)} className="p-1 hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-1 hover:text-red-500 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2" variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}>
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Position</label>
            <input name="position" value={formData.position} onChange={handleChange} className={inputClass} style={inputStyle} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Company</label>
            <input name="company" value={formData.company} onChange={handleChange} className={inputClass} style={inputStyle} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Start Date</label>
              <input type="month" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} style={inputStyle} required />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>End Date</label>
              <input type="month" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass} style={inputStyle} disabled={formData.isCurrent} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isCurrent" id="isCurrent" checked={formData.isCurrent} onChange={handleChange} className="rounded" />
            <label htmlFor="isCurrent" className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>I currently work here</label>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tech Stack</label>
            <input name="techStack" value={formData.techStack} onChange={handleChange} className={inputClass} style={inputStyle} placeholder="React, Node.js, etc." />
          </div>
          <div className="pt-4 border-t mt-auto" style={{ borderColor: 'var(--color-border-default)' }}>
            <Button type="submit" disabled={isAdding || isUpdating} className="w-full text-white font-medium" style={{ backgroundColor: 'var(--color-accent)' }}>
              {isAdding || isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
