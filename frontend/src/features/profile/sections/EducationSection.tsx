import { useState } from 'react';
import { useProfile, useAddEducation, useUpdateEducation, useDeleteEducation, useReorderSection } from '../../../shared/api/hooks/useProfile';
import type { EducationDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Label, Card } from '../../../shared/ui/Form';
import { SortableList } from '../../../shared/ui/SortableList';

export const EducationSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();
  const reorderMutation = useReorderSection('education');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const educationList = profile?.education || [];

  return (
    <div className="max-w-2xl pl-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Education</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add education</Button>
        )}
      </div>
      <SortableList
        items={educationList}
        onReorder={(newItems) => reorderMutation.mutate(newItems.map(i => i.id))}
        renderItem={(edu) =>
          editingId === edu.id ? (
            <EducationForm initialData={edu}
              onSave={(data) => { updateMutation.mutate({ id: edu.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card className="p-3 bg-card border-default">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-link)' }}>{edu.institution}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingId(edu.id)} className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>Edit</button>
                  <button onClick={() => deleteMutation.mutate(edu.id)} className="text-sm hover:underline" style={{ color: 'var(--color-danger)' }}>Delete</button>
                </div>
              </div>
            </Card>
          )
        }
      />
      {editingId === 'new' && (
        <div className="mt-4">
          <EducationForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        </div>
      )}
    </div>
  );
};

interface EducationFormProps {
  initialData?: EducationDto;
  onSave: (data: Omit<EducationDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const EducationForm: React.FC<EducationFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    institution: initialData?.institution || '',
    degree: initialData?.degree || '',
    field: initialData?.field || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    isCurrent: initialData?.isCurrent || false,
    sortOrder: initialData?.sortOrder || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!formData.institution || !formData.degree || !formData.startDate) {
      alert('Institution, degree and start date are required.');
      return;
    }
    const payload = { ...formData };
    if (!payload.endDate) {
      delete (payload as any).endDate;
    }
    onSave(payload); 
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="institution">Institution</Label><Input id="institution" required name="institution" value={formData.institution} onChange={handleChange} /></div>
          <div><Label htmlFor="degree">Degree</Label><Input id="degree" required name="degree" value={formData.degree} onChange={handleChange} /></div>
        </div>
        <div><Label htmlFor="field">Field of Study (Optional)</Label><Input id="field" name="field" value={formData.field} onChange={handleChange} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" required name="startDate" value={formData.startDate} onChange={handleChange} /></div>
          <div><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.isCurrent} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isCurrent" name="isCurrent" checked={formData.isCurrent} onChange={(e) => setFormData(p => ({ ...p, isCurrent: e.target.checked, endDate: e.target.checked ? '' : p.endDate }))} className="rounded border-default text-accent focus:ring-accent" />
          <Label htmlFor="isCurrent" className="mb-0">I currently study here</Label>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
