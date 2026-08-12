import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axios';

interface OnboardingRequest {
  role: string;
  stack: string;
  recentExperience: string;
}

export const useOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingRequest) => {
      const response = await api.post('/ai/onboarding', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
