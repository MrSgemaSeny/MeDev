import { useState } from 'react';
import { useProfile, useAddLanguage, useUpdateLanguage, useDeleteLanguage } from '../../../shared/api/hooks/useProfile';
import type { LanguageDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Select, Label, Card } from '../../../shared/ui/Form';

const PROFICIENCIES = ['Elementary', 'Limited Working', 'Professional Working', 'Full Professional', 'Native'];

export const LanguagesSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const languages = profile?.languages || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Languages</h2>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add language</Button>
        )}
      </div>
      <div className="space-y-2">
        {languages.map((lang) =>
          editingId === lang.id ? (
            <LanguageForm key={lang.id} initialData={lang}
              onSave={(data) => { updateMutation.mutate({ id: lang.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card key={lang.id} className="p-3 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{lang.name}</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{lang.level}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(lang.id)} className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>Edit</button>
                <button onClick={() => deleteMutation.mutate(lang.id)} className="text-sm hover:underline" style={{ color: 'var(--color-danger)' }}>Delete</button>
              </div>
            </Card>
          )
        )}
        {editingId === 'new' && (
          <LanguageForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        )}
      </div>
    </div>
  );
};

interface LanguageFormProps {
  initialData?: LanguageDto;
  onSave: (data: Omit<LanguageDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const LanguageForm: React.FC<LanguageFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    level: initialData?.proficiency || 'Native',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="name">Language</Label><Input id="name" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. English, Spanish" /></div>
          <div><Label htmlFor="proficiency">Proficiency</Label>
            <Select id="proficiency" name="proficiency" value={formData.proficiency} onChange={handleChange}>
              {PROFICIENCIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};
