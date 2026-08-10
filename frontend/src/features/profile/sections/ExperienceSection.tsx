import {  useState  } from 'react';
import { useProfile, useAddExperience, useUpdateExperience, useDeleteExperience } from '../../../shared/api/hooks/useProfile';
import type { ExperienceDto } from '../../../entities/profile/model/types';

export const ExperienceSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const experiences = profile?.experience || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Experience</h2>
        {editingId === null && (
          <button 
            onClick={() => setEditingId('new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            + Add Experience
          </button>
        )}
      </div>

      <div className="space-y-6">
        {experiences.map((exp: any) => (
          editingId === exp.id ? (
            <ExperienceForm 
              key={exp.id} 
              initialData={exp} 
              onSave={(data) => {
                updateMutation.mutate({ id: exp.id, payload: data });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <div key={exp.id} className="bg-gray-900 border border-gray-800 p-4 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                  <p className="text-emerald-400">{exp.company}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingId(exp.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(exp.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {exp.description && (
                <p className="mt-3 text-gray-300 whitespace-pre-wrap">{exp.description}</p>
              )}
            </div>
          )
        ))}

        {editingId === 'new' && (
          <ExperienceForm 
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
    current: initialData?.current || false,
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
          <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
          <input 
            required
            name="company" 
            value={formData.company} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
          <input 
            required
            name="position" 
            value={formData.position} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
          <input 
            required
            type="month"
            name="startDate" 
            value={formData.startDate} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
          <input 
            type="month"
            name="endDate" 
            value={formData.endDate} 
            onChange={handleChange}
            disabled={formData.current}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center mt-2">
        <input 
          type="checkbox" 
          id="current" 
          name="current"
          checked={formData.current}
          onChange={handleChange}
          className="mr-2 rounded border-gray-700 text-emerald-500 focus:ring-emerald-500 bg-gray-950"
        />
        <label htmlFor="current" className="text-sm text-gray-300">I currently work here</label>
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
