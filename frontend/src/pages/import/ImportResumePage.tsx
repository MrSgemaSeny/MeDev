import { useRef } from 'react';
import { useParseResume } from '../../shared/api/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { UploadCloud, FileText } from 'lucide-react';

export const ImportResumePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: parseResume, isPending: isParsing } = useParseResume();
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseResume(file, {
        onSuccess: () => navigate('/profile/edit'),
        onError: (err) => {
          console.error(err);
          alert('Failed to parse resume.');
        }
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[var(--color-bg-inset)]">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success,auto)] shadow-[0_0_8px_var(--color-success,auto)] animate-pulse"></span>
          <span className="text-xs font-semibold text-secondary tracking-wide uppercase">Zero-Input Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-primary leading-tight">
          Update profile via <span className="text-[var(--color-success,auto)]">PDF Upload</span>.
        </h1>
        <p className="text-base text-secondary max-w-xl mx-auto">
          Upload your existing resume and let our AI instantly extract and merge your experience, skills, and education into your profile.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <div 
          className="group relative border-2 border-dashed border-[var(--color-border-default)] rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-success,auto)] transition-all duration-300 shadow-sm hover:shadow-[0_0_30px_rgba(35,134,54,0.1)]"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
          {isParsing ? (
            <div className="text-[var(--color-success,auto)] animate-pulse flex flex-col items-center">
              <FileText size={64} className="mb-6 opacity-90" />
              <h3 className="text-xl font-bold mb-2">AI is analyzing your resume...</h3>
              <p className="text-sm opacity-80">Extracting skills, experience, and projects. Please wait.</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-inset)] border border-[var(--color-border-default)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[var(--color-success,auto)] transition-all duration-300">
                <UploadCloud size={32} className="text-secondary group-hover:text-[var(--color-success,auto)] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Upload Resume or LinkedIn Export</h3>
              <p className="text-sm text-secondary mb-6 max-w-sm">
                We support PDF, DOC, and DOCX files up to 5MB. Your data is processed securely.
              </p>
              <Button variant="primary" size="lg" type="button" className="pointer-events-none rounded-xl px-8 shadow-md">
                Select File
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
