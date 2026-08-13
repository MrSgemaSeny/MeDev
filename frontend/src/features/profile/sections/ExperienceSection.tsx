import { useState } from 'react';
import { useProfile, useAddExperience, useUpdateExperience, useDeleteExperience } from '../../../shared/api/hooks/useProfile';
import type { ExperienceDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label, Card } from '../../../shared/ui/Form';
import { useAiGenerate } from '../../ai/hooks/useAiGenerate';

export const ExperienceSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const experiences = profile?.experience || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Experience</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add experience</Button>
        )}
      </div>

      <div className="space-y-3">
        {experiences.map((exp) =>
          editingId === exp.id ? (
            <ExperienceForm key={exp.id} initialData={exp}
              onSave={(data) => { updateMutation.mutate({ id: exp.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card key={exp.id} className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{exp.position}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-link)' }}>{exp.company}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingId(exp.id)} className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>Edit</button>
                  <button onClick={() => deleteMutation.mutate(exp.id)} className="text-sm hover:underline" style={{ color: 'var(--color-danger)' }}>Delete</button>
                </div>
              </div>
            </Card>
          )
        )}
        {editingId === 'new' && (
          <ExperienceForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        )}
      </div>
    </div>
  );
};

interface ExperienceFormProps {
  initialData?: ExperienceDto;
  onSave: (data: Omit<ExperienceDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    company: initialData?.company || '',
    position: initialData?.position || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    isCurrent: initialData?.current || false,
    description: initialData?.description || '',
  });
  const { generate, isGenerating } = useAiGenerate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  const handleGenerateDescription = async () => {
    setFormData((prev) => ({ ...prev, description: '' }));
    await generate(
      `Сгенерируй описание для моего опыта работы на позиции "${formData.position}" в компании "${formData.company}". Максимум 3-4 предложения. Сделай упор на достижения и обязанности.`,
      (token) => {
        setFormData((prev) => ({ ...prev, description: prev.description + token }));
      }
    );
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="company">Company</Label><Input id="company" required name="company" value={formData.company} onChange={handleChange} /></div>
          <div><Label htmlFor="position">Position</Label><Input id="position" required name="position" value={formData.position} onChange={handleChange} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="month" required name="startDate" value={formData.startDate} onChange={handleChange} /></div>
          <div><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="month" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.current} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} style={{ accentColor: 'var(--color-accent)' }} />
          I currently work here
        </label>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="description" className="mb-0">Description</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !formData.position || !formData.company}
              style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
