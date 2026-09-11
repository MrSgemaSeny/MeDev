import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { JobApplicationDto } from '../../../entities/job-tracker/model/types';
import { useTailorResume, useUpdateJobApplication } from '../../../entities/job-tracker/api/hooks';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Label } from '../../../shared/ui/Form';
import { Sparkles, Copy, Check, FileEdit, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AiTailorModalProps {
  app: JobApplicationDto;
  isOpen: boolean;
  onClose: () => void;
}

export const AiTailorModal: React.FC<AiTailorModalProps> = ({ app, isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState<string>(app.jobDescription || '');
  const [tailoredContent, setTailoredContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const tailorMutation = useTailorResume();
  const updateAppMutation = useUpdateJobApplication();

  const handleTailor = () => {
    if (!jobDescription.trim()) return;

    tailorMutation.mutate(
      {
        jobDescription: jobDescription.trim(),
        targetRole: app.role,
      },
      {
        onSuccess: (data) => {
          const content = data.content || data.suggestions || '';
          setTailoredContent(content);
          // If the application doesn't have a job description yet, save it
          if (!app.jobDescription && jobDescription.trim()) {
            updateAppMutation.mutate({
              id: app.id,
              payload: { jobDescription: jobDescription.trim() },
            });
          }
        },
        onError: (err: any) => {
          const status = err.response?.status;
          if (status === 402 || status === 403) {
            toast.error(t('tracker.ai.proRequired', 'Для адаптации резюме требуется подписка PRO.'));
          } else if (status === 429) {
            toast.error(t('tracker.ai.rateLimit', 'Превышен суточный лимит запросов к AI.'));
          } else {
            toast.error(err.response?.data?.message || t('tracker.ai.tailorError', 'Не удалось адаптировать резюме.'));
          }
        },
      }
    );
  };

  const handleCopy = async () => {
    if (!tailoredContent) return;
    try {
      await navigator.clipboard.writeText(tailoredContent);
      setCopied(true);
      toast.success(t('tracker.ai.copied', 'Скопировано в буфер обмена'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('tracker.ai.copyError', 'Не удалось скопировать'));
    }
  };

  const handleOpenResumeBuilder = () => {
    onClose();
    navigate('/resume');
  };

  const handleMarkApplied = () => {
    updateAppMutation.mutate(
      {
        id: app.id,
        payload: { status: 'APPLIED' },
      },
      {
        onSuccess: () => {
          toast.success(t('tracker.ai.statusUpdated', 'Статус обновлен на Applied'));
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('tracker.ai.tailorTitle', 'AI Resume Tailoring')}>
      <div className="space-y-4 pt-2 w-[600px] max-w-[90vw]">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-default)]">
          <div>
            <h3 className="text-sm font-semibold text-primary">{app.role}</h3>
            <p className="text-xs text-secondary">{app.companyName}</p>
          </div>
          {app.status === 'WISHLIST' && tailoredContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkApplied}
              disabled={updateAppMutation.isPending}
              className="text-xs flex items-center gap-1.5"
            >
              {t('tracker.ai.markApplied', 'Перевести в Applied')}
              <ArrowRight size={14} />
            </Button>
          )}
        </div>

        {!tailoredContent ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="tailorJobDescription">
                  {t('tracker.ai.jobDescriptionLabel', 'Описание вакансии')}
                </Label>
                <span className="text-xs text-muted">
                  {jobDescription.length} / 8000
                </span>
              </div>
              <textarea
                id="tailorJobDescription"
                className="w-full h-48 p-3 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] text-[16px] md:text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none resize-none placeholder-muted"
                placeholder={t('tracker.ai.pasteJdPlaceholder', 'Вставьте требования вакансии сюда...')}
                value={jobDescription}
                maxLength={8000}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-secondary mt-1 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--color-accent)]" />
                {t('tracker.ai.ragNotice', 'AI сопоставит ваш подтвержденный профиль с требованиями вакансии.')}
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button
                onClick={handleTailor}
                variant="primary"
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2"
                disabled={tailorMutation.isPending || !jobDescription.trim()}
              >
                <Sparkles size={16} />
                {tailorMutation.isPending
                  ? t('tracker.ai.tailoring', 'Адаптирую под вакансию...')
                  : t('tracker.ai.tailorAction', 'Адаптировать резюме')}
              </Button>
              <Button onClick={onClose} variant="outline" className="min-h-[44px]">
                {t('common.cancel', 'Отмена')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="tailoredResult">
                  {t('tracker.ai.tailoredResultLabel', 'Адаптированные рекомендации и текст резюме')}
                </Label>
                <span className="text-xs text-[var(--color-accent)] font-medium">
                  {t('tracker.ai.ready', 'Готово')}
                </span>
              </div>
              <textarea
                id="tailoredResult"
                className="w-full h-64 p-3 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] text-[16px] md:text-sm text-primary focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none font-sans"
                value={tailoredContent}
                readOnly
              />
            </div>

            <div className="flex flex-wrap gap-2.5 pt-4 border-t border-[var(--color-border-default)]">
              <Button
                onClick={handleCopy}
                variant="primary"
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('common.copied', 'Скопировано!') : t('common.copy', 'Копировать')}
              </Button>
              <Button
                onClick={handleOpenResumeBuilder}
                variant="outline"
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2"
              >
                <FileEdit size={16} />
                {t('tracker.ai.openBuilder', 'Открыть конструктор')}
              </Button>
              <Button
                onClick={() => setTailoredContent('')}
                variant="outline"
                className="min-h-[44px]"
              >
                {t('common.back', 'Назад')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
