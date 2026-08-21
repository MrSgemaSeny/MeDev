import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { useAiChatStore } from '../model/store';
import { useAuthStore } from '../../../entities/user/model/store';
import { useUpsellStore } from '../../../entities/user/model/upsellStore';
import { BASE_URL, api } from '../../../shared/api/axios';

export const AiChatWidget = () => {
  const { isOpen, messages, isLoading, pendingPrompt, toggleChat, addMessage, updateLastMessage, setLoading, clearChat, clearPendingPrompt } = useAiChatStore();
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
    if (isOpen && messages.length === 0 && !pendingPrompt) {
      handleSend("Привет! Поздоровайся и расскажи чем можешь помочь коротко.", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle pending prompts triggered from external buttons
  useEffect(() => {
    if (pendingPrompt && !isLoading) {
      handleSend(pendingPrompt);
      clearPendingPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, isLoading]);

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
      
      let response = await fetch(`${BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ prompt: text, history: historyToSend })
      });

      if (response.status === 401) {
        try {
          await api.get('/ai/quota'); // this will trigger the axios interceptor to refresh the token
          const newToken = useAuthStore.getState().accessToken;
          response = await fetch(`${BASE_URL}/ai/chat/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({ prompt: text, history: historyToSend })
          });
        } catch {
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
      }

      if (response.status === 429) {
        useUpsellStore.getState().openUpsell();
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
        className="fixed bottom-6 right-6 p-3.5 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 bg-[#238636] hover:bg-[#2ea043] text-white border border-[#30363d] flex items-center justify-center z-50 group"
        aria-label="Open AI Assistant"
      >
        <Bot size={22} className="group-hover:rotate-12 transition-transform duration-200" />
      </button>
    );
  }

  const QUICK_PROMPTS = [
    { label: "Анализ резюме", text: "Проанализируй моё резюме: насколько оно привлекательно для работодателей? Чего не хватает?" },
    { label: "Оценка GitHub", text: "Проанализируй мой стек и репозитории: как лучше презентовать этот опыт в резюме?" },
    { label: "Подготовка к интервью", text: "Задай мне 3 сложных технических вопроса по моему основному стеку для тренировки." }
  ];

  return (
    <div className="fixed bottom-6 right-6 w-[440px] h-[580px] max-h-[85vh] flex flex-col bg-[#161b22] rounded-2xl shadow-2xl border border-[#30363d] overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-[#0d1117] border-b border-[#30363d] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#238636]">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#e6edf3]">MeDev Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#7d8590]">Llama 3.3 70B · SSE Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button 
              onClick={clearChat} 
              className="text-[11px] px-2 py-1 rounded text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
            >
              Clear
            </button>
          )}
          <button 
            onClick={toggleChat} 
            className="p-1.5 rounded-lg text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0d1117]/60">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#1f6feb]/20 border border-[#388bfd]/30 text-white rounded-br-sm' 
                  : 'bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-bl-sm shadow-sm'
              }`}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2 text-xs text-[#7d8590]">
              <Loader2 size={14} className="animate-spin text-[#238636]" />
              <span>Генерирую ответ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-[#0d1117]/80 border-t border-[#21262d] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(qp.text)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#161b22] hover:bg-[#21262d] text-[#7d8590] hover:text-[#e6edf3] border border-[#30363d] whitespace-nowrap transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-[#0d1117] border-t border-[#30363d]">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-end bg-[#161b22] border border-[#30363d] rounded-xl p-1.5 focus-within:border-[#238636] focus-within:ring-1 focus-within:ring-[#238636] transition-all"
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
            placeholder="Спроси о резюме или подготовке к интервью..."
            className="w-full bg-transparent px-3 py-1.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none resize-none max-h-28 min-h-[38px] leading-relaxed"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white disabled:opacity-30 disabled:hover:bg-[#238636] transition-all shrink-0 ml-1"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
