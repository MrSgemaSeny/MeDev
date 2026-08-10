import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../entities/user/model/store';

export function useAiGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { accessToken } = useAuthStore();

  const generate = useCallback(async (prompt: string, onToken: (token: string) => void) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: prompt }),
      });

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
