import { useState, useRef } from 'react';
import { useParseResume } from '../../entities/profile/api/hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ImportResumePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseStage, setParseStage] = useState<'reading' | 'extracting' | 'syncing'>('reading');
  const { mutate: parseResume, isPending: isParsing } = useParseResume();
  const navigate = useNavigate();

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Пожалуйста, загрузите резюме в формате PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимальный размер: 10 МБ.');
      return;
    }

    setParseStage('reading');
    const timer1 = setTimeout(() => setParseStage('extracting'), 1500);
    const timer2 = setTimeout(() => setParseStage('syncing'), 4500);

    parseResume(file, {
      onSuccess: () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        toast.success('Резюме успешно проанализировано и добавлено в профиль!');
        navigate('/profile/edit');
      },
      onError: (err: any) => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        console.error(err);
        const message = err.response?.data?.error || err.response?.data?.message || 'Не удалось распознать резюме. Убедитесь, что файл содержит текстовый слой.';
        toast.error(message);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[var(--color-bg-inset)]">
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-tight">
          Автоматический импорт <span className="text-[var(--color-accent)]">PDF резюме</span>
        </h1>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <div 
          role="button"
          tabIndex={0}
          aria-label="Загрузить резюме в формате PDF (до 10 МБ)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative border-2 border-dashed rounded-2xl p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-sm ${
            isDragging
              ? 'border-[var(--color-accent)] bg-[var(--color-bg-secondary)] scale-[1.01] shadow-[0_0_25px_rgba(35,134,54,0.15)]'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)]'
          } focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="application/pdf,.pdf"
            onChange={handleFileUpload}
          />
          {isParsing ? (
            <div className="flex flex-col items-center max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] flex items-center justify-center mb-5 animate-pulse">
                <FileText size={32} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">AI анализирует ваше резюме...</h3>
              <p className="text-xs sm:text-sm text-secondary mb-6">
                Выделение навыков, проектов и хронологии опыта.
              </p>

              {/* Multi-step progress list */}
              <div className="w-full space-y-2.5 text-left text-xs bg-[var(--color-bg-inset)] p-3.5 rounded-xl border border-[var(--color-border-default)]">
                <div className={`flex items-center gap-2.5 ${parseStage === 'reading' ? 'text-[var(--color-accent)] font-semibold' : 'text-secondary'}`}>
                  <CheckCircle2 size={14} className={parseStage !== 'reading' ? 'text-[var(--color-accent)]' : 'text-secondary'} />
                  <span>1. Извлечение текста и безопасное маскирование PII</span>
                </div>
                <div className={`flex items-center gap-2.5 ${parseStage === 'extracting' ? 'text-[var(--color-accent)] font-semibold' : 'text-secondary'}`}>
                  <CheckCircle2 size={14} className={parseStage === 'syncing' ? 'text-[var(--color-accent)]' : 'text-secondary'} />
                  <span>2. Структурирование стека и хронологии опыта via LLM</span>
                </div>
                <div className={`flex items-center gap-2.5 ${parseStage === 'syncing' ? 'text-[var(--color-accent)] font-semibold' : 'text-secondary'}`}>
                  <CheckCircle2 size={14} className="text-secondary" />
                  <span>3. Бесшовный Smart Merge в базу данных профиля</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-inset)] border border-[var(--color-border-default)] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-[var(--color-accent)] transition-all duration-300">
                <UploadCloud size={34} className="text-secondary group-hover:text-[var(--color-accent)] transition-colors" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                Перетащите PDF резюме сюда или нажмите для выбора
              </h3>
              <p className="text-xs sm:text-sm text-secondary mb-6 max-w-sm">
                Поддерживаются любые PDF-файлы до 10 МБ.
              </p>
              <Button variant="primary" size="lg" type="button" className="pointer-events-none rounded-xl px-5 sm:px-8 text-xs sm:text-sm shadow-md">
                Выбрать PDF-файл
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
