import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="surface-secondary py-12 border-t border-default">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Code2 className="h-6 w-6 text-secondary" />
          <span className="text-sm font-semibold text-secondary">MeDev © {new Date().getFullYear()}</span>
        </div>
        <div className="flex space-x-6 text-sm text-secondary">
          <Link to="/legal/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/legal/terms" className="hover:text-primary">Terms</Link>
          <a href="https://github.com/MrSgemaSeny/MeDev" target="_blank" rel="noreferrer" className="hover:text-primary">GitHub</a>
        </div>
      </div>
    </footer>
  );
};
