import {  useState  } from 'react';
import { useProfile, useAddEducation, useUpdateEducation, useDeleteEducation } from '../../../shared/api/hooks/useProfile';
import type { EducationDto } from '../../../entities/profile/model/types';

export const EducationSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const educationList = profile?.education || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Education</h2>
        {editingId === null && (
          <button 
            onClick={() => setEditingId('new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            + Add Education
          </button>
        )}
      </div>

      <div className="space-y-6">
        {educationList.map((edu: any) => (
          editingId === edu.id ? (
            <EducationForm 
              key={edu.id} 
              initialData={edu} 
              onSave={(data) => {
                updateMutation.mutate({ id: edu.id, payload: data });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <div key={edu.id} className="bg-gray-900 border border-gray-800 p-4 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-emerald-400">{edu.institution}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingId(edu.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(edu.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {edu.description && (
                <p className="mt-3 text-gray-300 whitespace-pre-wrap">{edu.description}</p>
              )}
            </div>
          )
        ))}

        {editingId === 'new' && (
          <EducationForm 
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
          <label className="block text-sm font-medium text-gray-400 mb-1">Institution</label>
          <input 
            required
            name="institution" 
            value={formData.institution} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Degree</label>
          <input 
            required
            name="degree" 
            value={formData.degree} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Field of Study</label>
        <input 
          required
          name="fieldOfStudy" 
          value={formData.fieldOfStudy} 
          onChange={handleChange}
          className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
        />
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
        <label htmlFor="current" className="text-sm text-gray-300">I currently study here</label>
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
