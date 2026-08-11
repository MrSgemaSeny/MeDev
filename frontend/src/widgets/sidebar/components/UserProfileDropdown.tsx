import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bell, Globe, Mail, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../../entities/user/model/store';
import { useTranslation } from 'react-i18next';

interface Props {
  isSidebarExpanded: boolean;
}

export const UserProfileDropdown: React.FC<Props> = ({ isSidebarExpanded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);
  const { i18n } = useTranslation();
  
  // Theme state
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!username) return null;

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center px-3 py-2 border-t transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        style={{
          borderColor: 'var(--color-border-default)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
          {username.charAt(0).toUpperCase()}
        </div>
        
        <span 
          className="ml-3 text-sm font-medium truncate transition-opacity duration-150"
          style={{ opacity: isSidebarExpanded ? 1 : 0 }}
        >
          {username}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute left-full bottom-0 ml-2 w-72 rounded-xl shadow-lg border z-50 flex flex-col py-2"
          style={{ 
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-default)',
            boxShadow: '0 10px 25px -5px var(--color-shadow)'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-muted flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-[15px] truncate text-primary">{username}</span>
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full w-max mt-0.5 font-medium">
                Администратор
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 flex flex-col">
            
            {/* Theme Toggle (Bonus) */}
            <div className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center gap-3 text-secondary">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium">Тема</span>
              </div>
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-semibold">
                <div className={`px-2.5 py-1 rounded-full transition-colors ${!isDark ? 'bg-white shadow-sm text-green-700 dark:text-green-400' : 'text-muted'}`}>Светлая</div>
                <div className={`px-2.5 py-1 rounded-full transition-colors ${isDark ? 'bg-white dark:bg-[#238636] shadow-sm text-white' : 'text-muted'}`}>Темная</div>
              </div>
            </div>

            {/* Notifications */}
            <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left">
              <div className="flex items-center gap-3 text-secondary">
                <Bell size={18} />
                <span className="text-sm font-medium">Уведомления</span>
              </div>
              <div className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center">
                3
              </div>
            </button>

            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }}></div>

            {/* Language */}
            <div className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 text-secondary">
                <Globe size={18} />
                <span className="text-sm font-medium">Язык</span>
              </div>
              
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-bold">
                <button 
                  onClick={() => toggleLanguage('ru')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('ru') ? 'bg-[#006633] text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  RU
                </button>
                <button 
                  onClick={() => toggleLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('en') ? 'bg-[#006633] text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }}></div>

            {/* Support */}
            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left">
              <Mail size={18} />
              <span className="text-sm font-medium">Поддержка</span>
            </button>

            {/* Logout */}
            <button 
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left mt-1"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
