import { useState } from 'react';
import { useProfile, useAddSkill, useUpdateSkill, useDeleteSkill, useReorderSection } from '../../../entities/profile/api/hooks';
import type { SkillDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Select, Label, Card } from '../../../shared/ui/Form';
import { SortableList } from '../../../shared/ui/SortableList';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const SkillsSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();
  const reorderMutation = useReorderSection('skills');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const skills = profile?.skills || [];

  return (
    <div className="max-w-2xl pl-0 sm:pl-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Skills</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" className="min-h-[44px]" onClick={() => setEditingId('new')}>Add skill</Button>
        )}
      </div>
      <SortableList
        items={skills}
        onReorder={(newItems) => reorderMutation.mutate(newItems.map(i => i.id))}
        renderItem={(skill) =>
          editingId === skill.id ? (
            <SkillForm initialData={skill}
              onSave={(data) => { updateMutation.mutate({ id: skill.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card className="p-3 flex justify-between items-center bg-card border-default">
              <div>
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{skill.name}</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{skill.level}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setEditingId(skill.id)} 
                  className="min-h-[44px] min-w-[44px] px-2 flex items-center justify-center text-sm font-medium hover:underline rounded" 
                  style={{ color: 'var(--color-link)' }}
                  aria-label="Edit skill"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setItemToDelete(skill.id)} 
                  className="min-h-[44px] min-w-[44px] px-2 flex items-center justify-center text-sm font-medium hover:underline rounded" 
                  style={{ color: 'var(--color-danger)' }}
                  aria-label="Delete skill"
                >
                  Delete
                </button>
              </div>
            </Card>
          )
        }
      />
      {editingId === 'new' && (
        <div className="mt-4">
          <SkillForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        </div>
      )}

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete !== null) {
            deleteMutation.mutate(itemToDelete);
          }
        }}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

interface SkillFormProps {
  initialData?: SkillDto;
  onSave: (data: Omit<SkillDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const SkillForm: React.FC<SkillFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    level: initialData?.level || 'Intermediate',
    sortOrder: initialData?.sortOrder || 0,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label htmlFor="name">Skill Name</Label><Input id="name" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. React, Java, Docker" /></div>
          <div><Label htmlFor="level">Level</Label>
            <Select id="level" name="level" value={formData.level} onChange={handleChange}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" className="min-h-[44px]" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" className="min-h-[44px]" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
