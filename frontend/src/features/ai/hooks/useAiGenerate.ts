import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../entities/user/model/store';
import { useUpsellStore } from '../../../entities/user/model/upsellStore';
import { api } from '../../../shared/api/axios';

export function useAiGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { accessToken } = useAuthStore();

  const generate = useCallback(async (prompt: string, onToken: (token: string) => void) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (response.status === 429) {
        useUpsellStore.getState().openUpsell();
        return;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6);
            if (token !== '[DONE]') {
              onToken(token);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating AI text:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [accessToken]);

  return { generate, isGenerating };
}

export function useGenerateSummary() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = useCallback(async (language: string = 'en') => {
    setIsGenerating(true);
    try {
      const response = await api.post('/v1/ai/generate/summary', { language });
      const data = response.data;
      return data.summary || data.content || JSON.stringify(data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        useUpsellStore.getState().openUpsell();
        throw new Error('Quota exceeded');
      }
      throw new Error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateSummary, isGenerating };
}

export function useGenerateProjectDescription() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProjectDescription = useCallback(async (projectName: string, language: string = 'en') => {
    setIsGenerating(true);
    try {
      const response = await api.post('/v1/ai/generate/project-description', { projectName, language });
      const data = response.data;
      return data.description || data.content || JSON.stringify(data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        useUpsellStore.getState().openUpsell();
        throw new Error('Quota exceeded');
      }
      throw new Error('Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateProjectDescription, isGenerating };
}
