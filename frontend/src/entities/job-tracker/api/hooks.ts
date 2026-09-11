import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';
import { queryKeys } from '../../../shared/api/queryKeys';
import { toast } from 'sonner';
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
    // Optimistic Update: мгновенно обновляем локальный кэш до ответа бэкенда
    onMutate: async ({ id, payload }) => {
      // Отменяем исходящие запросы refetch, чтобы они не перезаписали наш оптимистичный стейт
      await queryClient.cancelQueries({ queryKey: queryKeys.jobApplications.all });

      // Сохраняем предыдущий снимок состояния кэша для безопасного отката
      const previousApplications = queryClient.getQueryData<JobApplicationDto[]>(queryKeys.jobApplications.all);

      // Оптимистично применяем изменения в кэш
      if (previousApplications) {
        queryClient.setQueryData<JobApplicationDto[]>(
          queryKeys.jobApplications.all,
          (old) => {
            if (!old) return [];
            return old.map((app) => 
              app.id === id 
                ? { ...app, ...payload, updatedAt: new Date().toISOString() } 
                : app
            );
          }
        );
      }

      return { previousApplications };
    },
    // В случае ошибки на сервере откатываемся к сохранённому снимку
    onError: (_err, _variables, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(queryKeys.jobApplications.all, context.previousApplications);
      }
      toast.error('Не удалось обновить статус вакансии');
    },
    // В любом случае (успех или ошибка) синхронизируем данные с сервером
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all });
    },
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tracker/applications/${id}`);
    },
    // Optimistic Delete: мгновенно убираем карточку из UI
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobApplications.all });

      const previousApplications = queryClient.getQueryData<JobApplicationDto[]>(queryKeys.jobApplications.all);

      if (previousApplications) {
        queryClient.setQueryData<JobApplicationDto[]>(
          queryKeys.jobApplications.all,
          (old) => (old ? old.filter((app) => app.id !== id) : [])
        );
      }

      return { previousApplications };
    },
    onError: (_err, _id, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(queryKeys.jobApplications.all, context.previousApplications);
      }
      toast.error('Не удалось удалить вакансию');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all });
    },
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
