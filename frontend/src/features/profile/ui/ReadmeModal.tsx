import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../../shared/api/axios';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TemplateType = 'full' | 'minimal' | 'creative';

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  const [template, setTemplate] = useState<TemplateType>('full');
  const [copied, setCopied] = useState(false);

  const { data: readmeContent, isLoading, isError } = useQuery({
    queryKey: ['readme', template],
    queryFn: async () => {
      const res = await api.get(`/profile/export/readme?template=${template}`);
      return res.data;
    },
    enabled: isOpen,
  });

  const handleCopy = async () => {
    if (!readmeContent) return;
    await navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    toast.success('GitHub Profile README copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!readmeContent) return;
    const blob = new Blob([readmeContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('README.md downloaded!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GitHub Profile README Generator">
      <div className="space-y-6">
        {/* Template Selector */}
        <div className="flex gap-2 p-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
          <button
            type="button"
            onClick={() => setTemplate('full')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors ${
              template === 'full'
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            🌟 Full & Stats
          </button>
          <button
            type="button"
            onClick={() => setTemplate('minimal')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors ${
              template === 'minimal'
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            ⚡ Minimal
          </button>
          <button
            type="button"
            onClick={() => setTemplate('creative')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors ${
              template === 'creative'
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            👾 Creative ASCII
          </button>
        </div>

        {/* Content Preview */}
        <div className="relative">
          {isLoading ? (
            <div className="h-64 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)] flex items-center justify-center">
              <span className="inline-block animate-spin rounded-full w-6 h-6 border-2 border-[var(--color-border-default)] border-t-[var(--color-text-primary)]" />
            </div>
          ) : isError ? (
            <div className="h-64 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
              Failed to generate README. Please make sure profile data is saved.
            </div>
          ) : (
            <textarea
              readOnly
              value={readmeContent}
              className="w-full h-72 p-4 text-xs font-mono rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] resize-none focus:outline-none select-all"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--color-text-muted)]">
            💡 Paste this directly into your GitHub special profile repo.
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleDownload} disabled={!readmeContent || isLoading}>
              ⬇️ Download .md
            </Button>
            <Button variant="primary" size="sm" onClick={handleCopy} disabled={!readmeContent || isLoading}>
              {copied ? '✓ Copied' : '📋 Copy Markdown'}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] text-xs space-y-2 text-[var(--color-text-secondary)]">
          <div className="font-semibold text-[var(--color-text-primary)]">📌 How to use on GitHub:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a new public repository with the exact same name as your GitHub username.</li>
            <li>Initialize it with a <code className="px-1 py-0.5 rounded bg-[var(--color-bg-tertiary)]">README.md</code> file.</li>
            <li>Click <strong>Copy Markdown</strong> above and paste it into that README file!</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};