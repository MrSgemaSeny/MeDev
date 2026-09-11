import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';
import { queryKeys } from '../../../shared/api/queryKeys';
import type { 
  JobApplicationDto, 
  CreateJobApplicationRequest, 
  UpdateJobApplicationRequest,
  AiTailorRequest,
  AiTailorResponse,
  AiMatchResponse,
  AiApplicationResponse
} from '../../job-tracker/model/types';

export const useJobApplications = () => {
  return useQuery<JobApplicationDto[]>({
    queryKey: queryKeys.jobApplications.all,
    queryFn: async () => {
      const { data } = await api.get('/tracker/applications');
      return data;
    },
  });
};

export const useAddJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateJobApplicationRequest) => {
      const { data } = await api.post('/tracker/applications', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all }),
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateJobApplicationRequest }) => {
      const { data } = await api.put(`/tracker/applications/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all }),
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tracker/applications/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all }),
  });
};

export const useGenerateCoverLetter = () => {
  return useMutation({
    mutationFn: async ({ jobDescription, targetRole }: { jobDescription: string; targetRole?: string }) => {
      const { data } = await api.post<AiApplicationResponse>('/ai/cover-letter', { jobDescription, targetRole });
      return data;
    },
  });
};

export const useTailorResume = () => {
  return useMutation({
    mutationFn: async ({ jobDescription, targetRole }: AiTailorRequest) => {
      const { data } = await api.post<AiTailorResponse>('/ai/tailor', { jobDescription, targetRole });
      return data;
    },
  });
};

export const useScrapeJob = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await api.get('/tracker/applications/scrape', { params: { url } });
      return data as CreateJobApplicationRequest;
    },
  });
};

export const useMatchJob = () => {
  return useMutation({
    mutationFn: async (jobDescription: string) => {
      const { data } = await api.post<AiMatchResponse>('/ai/match-job', { jobDescription });
      return data;
    },
  });
};

