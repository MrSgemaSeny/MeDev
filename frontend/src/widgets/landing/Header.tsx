import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-default surface">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">MeDev</span>
          </Link>
        </div>
        <div className="flex flex-1 justify-end items-center gap-x-6">
          <Link to="/auth/login" className="text-sm font-semibold leading-6 text-primary hover:text-secondary">
            Log in
          </Link>
          <Link
            to="/auth/login"
            className="rounded-md bg-[#238636] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2ea043]"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
};
