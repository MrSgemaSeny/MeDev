import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../axios';
import type { JobApplicationDto, CreateJobApplicationRequest, UpdateJobApplicationRequest } from '../../../entities/job-tracker/model/types';

const QUERY_KEY = ['job-applications'];

export const useJobApplications = () => {
  return useQuery<JobApplicationDto[]>({
    queryKey: QUERY_KEY,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateJobApplicationRequest }) => {
      const { data } = await api.put(`/tracker/applications/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tracker/applications/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
