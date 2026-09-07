import { Link } from 'react-router-dom';
import { Code2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../entities/user/model/store';
import { GithubIcon } from '../../shared/ui/GithubIcon';

export const Header = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#30363d] bg-[#161b22]">
              <Code2 className="h-5 w-5 text-[#2ea043]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#f0f6fc]">MeDev</span>
              <span className="rounded border border-[#30363d] bg-[#21262d] px-1.5 py-0.5 text-[10px] font-medium text-[#8b949e]">
                v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Возможности
            </a>
            <a
              href="#templates"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Шаблоны
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              Тарифы
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
            >
              FAQ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/MrSgemaSeny/MeDev"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#30363d] sm:flex"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          {accessToken ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-md bg-[#238636] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2ea043]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Панель управления</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1 rounded-md bg-[#238636] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2ea043]"
              >
                <span>Начать бесплатно</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
