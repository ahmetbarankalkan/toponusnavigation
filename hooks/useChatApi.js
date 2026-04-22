import { useCallback, useState } from 'react';

/**
 * Chat API Hook
 * Handles communication with OpenAI API with retry mechanism
 */
export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (messages, functions) => {
      setIsLoading(true);
      const maxRetries = 3;
      let lastError = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages,
              functions,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 502, 503, 504 hatalarında retry yap
            if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
              console.warn(`⚠️ API hatası ${response.status}, ${attempt}. deneme başarısız. ${attempt + 1}. deneme yapılıyor...`);
              lastError = new Error(`API error: ${response.status}`);
              
              // Exponential backoff: 1s, 2s, 4s
              const delay = Math.pow(2, attempt - 1) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            console.error('Chat API error:', response.status, errorData);
            throw new Error(
              errorData.error || `Chat API error: ${response.status}`
            );
          }

          const data = await response.json();
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response:', data);
            throw new Error('Invalid API response structure');
          }

          return data;
        } catch (error) {
          lastError = error;
          
          // Network hatası veya timeout ise retry yap
          if (attempt < maxRetries && (error.message.includes('fetch') || error.message.includes('timeout'))) {
            console.warn(`⚠️ Ağ hatası, ${attempt}. deneme başarısız. ${attempt + 1}. deneme yapılıyor...`);
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          console.error('Chat API hatası:', error);
        }
      }

      setIsLoading(false);
      throw lastError || new Error('Chat API request failed after retries');
    },
    []
  );

  return { sendMessage, isLoading };
};
