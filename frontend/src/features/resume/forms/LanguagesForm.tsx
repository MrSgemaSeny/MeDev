import { useState } from 'react';
import { useProfile, useAddLanguage, useUpdateLanguage, useDeleteLanguage } from '../../../shared/api/hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus } from 'lucide-react';

export function LanguagesForm({ onClose }: { onClose: () => void }) {
  const { data: profile } = useProfile();
  const { mutate: addLanguage, isPending: isAdding } = useAddLanguage();
  const { mutate: updateLanguage, isPending: isUpdating } = useUpdateLanguage();
  const { mutate: deleteLanguage } = useDeleteLanguage();
  
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    level: '',
  });

  const handleEdit = (lang: any) => {
    setFormData({
      name: lang.name || '',
      level: lang.level || '',
    });
    setEditingId(lang.id);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      level: '',
    });
    setEditingId('new');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === 'new') {
      addLanguage(formData, {
        onSuccess: () => {
          toast.success('Language added');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to add language'),
      });
    } else if (editingId) {
      updateLanguage({ id: editingId, payload: formData }, {
        onSuccess: () => {
          toast.success('Language updated');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to update language'),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      deleteLanguage(id, {
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
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Languages</h3>
        <button onClick={editingId ? () => setEditingId(null) : onClose} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-text-muted)' }}>
          {editingId ? 'Cancel' : 'Back'}
        </button>
      </div>

      {!editingId ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20">
          {profile?.languages?.map((lang: any) => (
            <div key={lang.id} className="p-3 rounded-md border flex items-center justify-between" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{lang.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{lang.level}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(lang)} className="p-1 hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(lang.id)} className="p-1 hover:text-red-500 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2" variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}>
            <Plus className="w-4 h-4" /> Add Language
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Language</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClass} style={inputStyle} required placeholder="English" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Proficiency Level</label>
            <select name="level" value={formData.level} onChange={handleChange} className={inputClass} style={inputStyle}>
              <option value="">Select Level (Optional)</option>
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Basic">Basic</option>
            </select>
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
