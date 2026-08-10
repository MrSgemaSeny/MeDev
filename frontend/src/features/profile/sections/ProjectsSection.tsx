import {  useState  } from 'react';
import { useProfile, useAddProject, useUpdateProject, useDeleteProject } from '../../../shared/api/hooks/useProfile';
import type { ProjectDto } from '../../../entities/profile/model/types';

export const ProjectsSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const projects = profile?.projects || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Projects</h2>
        {editingId === null && (
          <button 
            onClick={() => setEditingId('new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            + Add Project
          </button>
        )}
      </div>

      <div className="space-y-6">
        {projects.map((proj: any) => (
          editingId === proj.id ? (
            <ProjectForm 
              key={proj.id} 
              initialData={proj} 
              onSave={(data) => {
                updateMutation.mutate({ id: proj.id, payload: data });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <div key={proj.id} className="bg-gray-900 border border-gray-800 p-4 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{proj.name}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline text-sm block mb-1">
                      {proj.url}
                    </a>
                  )}
                  {(proj.startDate || proj.endDate) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingId(proj.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(proj.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {proj.description && (
                <p className="mt-3 text-gray-300 whitespace-pre-wrap">{proj.description}</p>
              )}
            </div>
          )
        ))}

        {editingId === 'new' && (
          <ProjectForm 
            onSave={(data) => {
              addMutation.mutate(data);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
            isPending={addMutation.isPending}
          />
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 p-4 rounded-md space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
          <input 
            required
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">URL (Optional)</label>
          <input 
            name="url" 
            type="url"
            value={formData.url} 
            onChange={handleChange}
            placeholder="https://"
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Start Date (Optional)</label>
          <input 
            type="month"
            name="startDate" 
            value={formData.startDate} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">End Date (Optional)</label>
          <input 
            type="month"
            name="endDate" 
            value={formData.endDate} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          rows={4}
          className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex space-x-3 pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
