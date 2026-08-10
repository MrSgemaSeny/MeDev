import { useState } from 'react';
import { useProfile, useAddEducation, useUpdateEducation, useDeleteEducation } from '../../../shared/api/hooks/useProfile';
import type { EducationDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label, Card } from '../../../shared/ui/Form';

export const EducationSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const educationList = profile?.education || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Education</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add education</Button>
        )}
      </div>
      <div className="space-y-3">
        {educationList.map((edu) =>
          editingId === edu.id ? (
            <EducationForm key={edu.id} initialData={edu}
              onSave={(data) => { updateMutation.mutate({ id: edu.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card key={edu.id} className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-link)' }}>{edu.institution}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{edu.startDate} — {edu.current ? 'Present' : edu.endDate}</p>
                  {edu.description && <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{edu.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingId(edu.id)} className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>Edit</button>
                  <button onClick={() => deleteMutation.mutate(edu.id)} className="text-sm hover:underline" style={{ color: 'var(--color-danger)' }}>Delete</button>
                </div>
              </div>
            </Card>
          )
        )}
        {editingId === 'new' && (
          <EducationForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        )}
      </div>
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
    fieldOfStudy: initialData?.fieldOfStudy || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    current: initialData?.current || false,
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="institution">Institution</Label><Input id="institution" required name="institution" value={formData.institution} onChange={handleChange} /></div>
          <div><Label htmlFor="degree">Degree</Label><Input id="degree" required name="degree" value={formData.degree} onChange={handleChange} /></div>
        </div>
        <div><Label htmlFor="fieldOfStudy">Field of Study</Label><Input id="fieldOfStudy" required name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="month" required name="startDate" value={formData.startDate} onChange={handleChange} /></div>
          <div><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="month" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.current} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} style={{ accentColor: 'var(--color-accent)' }} />
          I currently study here
        </label>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} /></div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
