import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../entities/user/model/store';
import { api } from '../../../shared/api/axios';

interface QuotaResponse {
  remainingRequests: number;
  dailyLimit: number;
}

export const useQuota = () => {
  const { accessToken } = useAuthStore();

  return useQuery<QuotaResponse>({
    queryKey: ['quota'],
    queryFn: async () => {
      const res = await api.get<QuotaResponse>('/v1/ai/quota');
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 60000, // 1 minute
  });
};
