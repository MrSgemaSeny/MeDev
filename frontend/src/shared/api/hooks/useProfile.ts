import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../axios';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put('/profile', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useReorderSection = (section: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.put(`/profile/${section}/reorder`, { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateSectionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionOrder: string[]) => {
      await api.put('/profile/section-order', { sectionOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// --- CRUD Hooks Factory ---
const createCrudHooks = (sectionName: string) => {
  return {
    useAdd: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (payload: any) => {
          const { data } = await api.post(`/profile/${sectionName}`, payload);
          return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
      });
    },
    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
          const { data } = await api.put(`/profile/${sectionName}/${id}`, payload);
          return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
      });
    },
    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (id: number) => {
          await api.delete(`/profile/${sectionName}/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
      });
    },
  };
};

export const { useAdd: useAddExperience, useUpdate: useUpdateExperience, useDelete: useDeleteExperience } = createCrudHooks('experience');
export const { useAdd: useAddEducation, useUpdate: useUpdateEducation, useDelete: useDeleteEducation } = createCrudHooks('education');
export const { useAdd: useAddSkill, useUpdate: useUpdateSkill, useDelete: useDeleteSkill } = createCrudHooks('skills');
export const { useAdd: useAddLanguage, useUpdate: useUpdateLanguage, useDelete: useDeleteLanguage } = createCrudHooks('languages');
export const { useAdd: useAddProject, useUpdate: useUpdateProject, useDelete: useDeleteProject } = createCrudHooks('projects');
