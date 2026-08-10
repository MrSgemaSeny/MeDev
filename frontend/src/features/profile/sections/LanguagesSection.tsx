import {  useState  } from 'react';
import { useProfile, useAddLanguage, useUpdateLanguage, useDeleteLanguage } from '../../../shared/api/hooks/useProfile';
import type { LanguageDto } from '../../../entities/profile/model/types';

export const LanguagesSection = () => {
  const { data: profile, isLoading } = useProfile();
  const addMutation = useAddLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const languages = profile?.languages || [];

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Languages</h2>
        {editingId === null && (
          <button 
            onClick={() => setEditingId('new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            + Add Language
          </button>
        )}
      </div>

      <div className="space-y-4">
        {languages.map((lang: any) => (
          editingId === lang.id ? (
            <LanguageForm 
              key={lang.id} 
              initialData={lang} 
              onSave={(data) => {
                updateMutation.mutate({ id: lang.id, payload: data });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <div key={lang.id} className="bg-gray-900 border border-gray-800 p-4 rounded-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">{lang.name}</h3>
                <p className="text-sm text-gray-500">{lang.proficiency}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditingId(lang.id)}
                  className="text-gray-400 hover:text-white"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(lang.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        ))}

        {editingId === 'new' && (
          <LanguageForm 
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

interface LanguageFormProps {
  initialData?: LanguageDto;
  onSave: (data: Omit<LanguageDto, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

const LanguageForm: React.FC<LanguageFormProps> = ({ initialData, onSave, onCancel, isPending }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    proficiency: initialData?.proficiency || 'Native',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
          <input 
            required
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="e.g. English, Spanish"
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Proficiency</label>
          <select 
            name="proficiency" 
            value={formData.proficiency} 
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="Elementary">Elementary</option>
            <option value="Limited Working">Limited Working</option>
            <option value="Professional Working">Professional Working</option>
            <option value="Full Professional">Full Professional</option>
            <option value="Native">Native</option>
          </select>
        </div>
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
