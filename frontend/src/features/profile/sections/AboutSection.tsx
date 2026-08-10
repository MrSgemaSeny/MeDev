import {  useEffect, useState  } from 'react';
import { useProfile, useUpdateProfile } from '../../../shared/api/hooks/useProfile';

export const AboutSection = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    summary: '',
    location: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        location: profile.location || '',
        website: profile.website || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
      });
    }
  }, [profile]);

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white">About You</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
          <input 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Headline</label>
          <input 
            name="headline" 
            value={formData.headline} 
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Senior Full-Stack Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Summary</label>
          <textarea 
            name="summary" 
            value={formData.summary} 
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
            <input 
              name="location" 
              value={formData.location} 
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
            <input 
              name="website" 
              value={formData.website} 
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
            <input 
              name="githubUrl" 
              value={formData.githubUrl} 
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
            <input 
              name="linkedinUrl" 
              value={formData.linkedinUrl} 
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
