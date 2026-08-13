import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          boxShadow: '0 8px 24px var(--color-shadow)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1.5 cursor-pointer hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
