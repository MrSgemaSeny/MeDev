import { ResumeBuilder } from '../../widgets/resume-builder/ResumeBuilder';

export const ResumePage = () => {
  return (
    <div className="h-full" style={{ color: 'var(--color-text-primary)' }}>
      <ResumeBuilder />
    </div>
  );
};
