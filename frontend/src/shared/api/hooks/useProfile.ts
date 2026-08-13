import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../axios';
import type { ProfileDto } from '../../../entities/profile/model/types';

export const useProfile = () => {
  return useQuery<ProfileDto>({
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
    mutationFn: async (payload: Partial<ProfileDto>) => {
      const { data } = await api.put('/profile', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useParseResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/ai/parse-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useGenerateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai/generate-profile');
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
const createCrudHooks = <T,>(sectionName: string) => {
  return {
    useAdd: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (payload: Omit<T, 'id' | 'orderIndex'>) => {
          const { data } = await api.post(`/profile/${sectionName}`, payload);
          return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
      });
    },
    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<T> }) => {
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

import type { ExperienceDto, EducationDto, SkillDto, LanguageDto, ProjectDto } from '../../../entities/profile/model/types';

export const { useAdd: useAddExperience, useUpdate: useUpdateExperience, useDelete: useDeleteExperience } = createCrudHooks<ExperienceDto>('experience');
export const { useAdd: useAddEducation, useUpdate: useUpdateEducation, useDelete: useDeleteEducation } = createCrudHooks<EducationDto>('education');
export const { useAdd: useAddSkill, useUpdate: useUpdateSkill, useDelete: useDeleteSkill } = createCrudHooks<SkillDto>('skills');
export const { useAdd: useAddLanguage, useUpdate: useUpdateLanguage, useDelete: useDeleteLanguage } = createCrudHooks<LanguageDto>('languages');
export const { useAdd: useAddProject, useUpdate: useUpdateProject, useDelete: useDeleteProject } = createCrudHooks<ProjectDto>('projects');
