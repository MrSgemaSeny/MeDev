import { useState } from 'react';
import { useProfile, useAddProject, useUpdateProject, useDeleteProject, useReorderSection } from '../../../shared/api/hooks/useProfile';
import type { ProjectDto } from '../../../entities/profile/model/types';
import { Button } from '../../../shared/ui/Button';
import { Input, Textarea, Label, Card } from '../../../shared/ui/Form';
import { Modal } from '../../../shared/ui/Modal';
import { SortableList } from '../../../shared/ui/SortableList';
import { GithubImport, GithubIcon } from '../../github/GithubImport';

import { useAiChatStore } from '../../ai-assistant/model/store';
import { useGenerateProjectDescription } from '../../ai/hooks/useAiGenerate';
import { Bot } from 'lucide-react';

export const ProjectsSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const reorderMutation = useReorderSection('projects');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [showGithubSync, setShowGithubSync] = useState(false);

  const { openWithPrompt } = useAiChatStore();

  const handleAiAnalysis = () => {
    openWithPrompt("Проанализируй мой GitHub профиль: Какие проекты стоит выделить в резюме и почему? Что говорит мой стек о моём уровне?");
  };

  if (isLoading) return <div className="text-secondary">Loading...</div>;
  const projects = profile?.projects || [];

  return (
    <div className="max-w-2xl pl-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Projects</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowGithubSync(true)} className="flex items-center gap-2">
            <GithubIcon />
            Sync GitHub
          </Button>
          {profile?.githubUsername && (
            <Button size="sm" variant="secondary" onClick={handleAiAnalysis} className="flex items-center gap-2" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-muted)', borderColor: 'var(--color-border-accent)' }}>
              <Bot size={16} />
              Analyze GitHub
            </Button>
          )}
        </div>
        {editingId === null && (
          <Button size="sm" variant="secondary" onClick={() => setEditingId('new')}>Add project</Button>
        )}
      </div>

      <Modal isOpen={showGithubSync} onClose={() => setShowGithubSync(false)} title="Import from GitHub">
        <GithubImport />
      </Modal>

      <SortableList
        items={projects}
        onReorder={(newItems) => reorderMutation.mutate(newItems.map(i => i.id))}
        renderItem={(proj) =>
          editingId === proj.id ? (
            <ProjectForm initialData={proj}
              onSave={(data) => { updateMutation.mutate({ id: proj.id, payload: data }); setEditingId(null); }}
              onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <Card className="p-3 bg-card border-default">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{proj.name}</h3>
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-sm hover:underline" style={{ color: 'var(--color-link)' }}>{proj.githubUrl}</a>
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
        }
      />
      {projects.length === 0 && editingId === null && (
        <Card className="p-8 text-center border-dashed border-[var(--color-border-default)]">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">No projects added yet.</p>
          <div className="flex justify-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setShowGithubSync(true)}>Import from GitHub</Button>
            <Button size="sm" variant="primary" onClick={() => setEditingId('new')}>+ Add Project</Button>
          </div>
        </Card>
      )}

      {editingId === 'new' && (
        <div className="mt-4">
          <ProjectForm onSave={(data) => { addMutation.mutate(data); setEditingId(null); }}
            onCancel={() => setEditingId(null)} isPending={addMutation.isPending} />
        </div>
      )}
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
    githubUrl: initialData?.githubUrl || '',
    description: initialData?.description || '',
    sortOrder: initialData?.sortOrder || 0,
  });
  const { generateProjectDescription, isGenerating } = useGenerateProjectDescription();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  const handleGenerateDescription = async () => {
    try {
      const description = await generateProjectDescription(formData.name, 'ru');
      if (description) {
        setFormData((prev) => ({ ...prev, description }));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate description");
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="name">Project Name</Label><Input id="name" required name="name" value={formData.name} onChange={handleChange} /></div>
          <div><Label htmlFor="githubUrl">GitHub URL (Optional)</Label><Input id="githubUrl" type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://" /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="description" className="mb-0">Description</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !formData.name}
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
