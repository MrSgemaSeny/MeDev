import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useAiChatStore } from '../model/store';
import { useAuthStore } from '../../../entities/user/model/store';

export const AiChatWidget = () => {
  const { isOpen, messages, isLoading, toggleChat, addMessage, updateLastMessage, setLoading, clearChat } = useAiChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleSend("Привет! Поздоровайся и расскажи чем можешь помочь коротко.", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = async (text: string = input, isHidden: boolean = false) => {
    if (!text.trim() || isLoading) return;

    if (!isHidden) {
      addMessage({ id: Date.now().toString(), role: 'user', content: text });
      setInput('');
    }

    setLoading(true);
    addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: '' });

    try {
      const historyToSend = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      
      let response = await fetch('http://localhost:8080/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ prompt: text, history: historyToSend })
      });

      if (response.status === 401) {
        try {
          const { api } = await import('../../../shared/api/axios');
          await api.get('/v1/ai/quota'); // this will trigger the axios interceptor to refresh the token
          const newToken = useAuthStore.getState().accessToken;
          response = await fetch('http://localhost:8080/api/v1/ai/chat/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({ prompt: text, history: historyToSend })
          });
        } catch (refreshErr) {
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
      }

      if (response.status === 429) {
        import('../../../entities/user/model/upsellStore').then(({ useUpsellStore }) => {
          useUpsellStore.getState().openUpsell();
        });
        throw new Error('Лимит запросов исчерпан');
      }

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // SSE responses from SseEmitter usually look like: "data:chunktext\n\n"
        // Since Groq chunks are small, we might get multiple data lines in one read.
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataText = line.substring(5); // The SseEmitter might add space, e.g. "data: " or just "data:"
            // Because SseEmitter sends exactly what we give it, if Groq sent " Hello", it will be "data: Hello" or "data:Hello".
            // Spring adds "data:" without space by default if sending raw object, but usually "data:"
            // Actually, SseEmitter sends `data:chunk\n\n`.
            updateLastMessage(dataText);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching chat:', error);
      updateLastMessage(`\n\n**Ошибка подключения к ИИ: ${error.message || 'Неизвестная ошибка'}**`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 surface-secondary border-default text-primary flex items-center justify-center"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[550px] flex flex-col surface rounded-xl shadow-2xl border-default overflow-hidden z-50">
      {/* Header */}
      <div className="surface-secondary border-b border-default p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Bot size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">MeDev Assistant</h3>
            <p className="text-xs text-muted">Powered by Groq</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-xs text-muted hover:text-primary transition-colors">
              Clear
            </button>
          )}
          <button onClick={toggleChat} className="p-1 hover:bg-gray-800 rounded transition-colors text-muted hover:text-primary">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 surface-inset">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'surface-secondary border-default text-primary rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <div className="flex justify-start">
            <div className="surface-secondary border-default rounded-2xl rounded-bl-none px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 surface border-t border-default">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Спроси о чём-нибудь..."
            className="w-full bg-transparent border border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none max-h-32 min-h-[40px]"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
