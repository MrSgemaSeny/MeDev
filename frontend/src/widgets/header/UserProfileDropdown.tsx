import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bell, Globe, Mail, Moon, Sun, Shield } from 'lucide-react';
import { useAuthStore } from '../../entities/user/model/store';
import { useTranslation } from 'react-i18next';
// import removed

interface UserProfileDropdownProps {
  variant?: 'sidebar' | 'header';
}

import { toggleTheme } from '../../shared/lib/theme';

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const username = useAuthStore((s) => s.username);
  const role = (useAuthStore as any)((s: any) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const { i18n } = useTranslation();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!username) {
    return (
      <div
        className="h-9 w-9 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      />
    );
  }

  const toggleLanguage = (lang: string) => i18n.changeLanguage(lang);

  const handleToggleTheme = () => {
    toggleTheme(setIsDark);
  };

  const formatterTime = new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isHeader = variant === 'header';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Триггер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isHeader
            ? 'h-9 w-9 rounded-full overflow-hidden shrink-0 hover:ring-2 transition-all'
            : 'w-full flex items-center justify-between gap-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors'
        }
        style={isHeader ? ({ '--tw-ring-color': 'var(--color-border-default)' } as React.CSSProperties) : undefined}
      >
        {isHeader ? (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-primary)] text-xs font-bold" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[var(--color-text-primary)] text-xs font-bold shadow-sm" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[13px] font-medium text-primary">{username}</span>
              <span className="text-[10px] text-muted">{formatterTime.format(currentTime)}</span>
            </div>
          </div>
        )}
      </button>

      {/* Меню — открывается вниз и от правого края в хедере, вверх и от левого в сайдбаре */}
      {isOpen && (
        <div
          className={`absolute w-64 rounded-xl shadow-lg border z-50 flex flex-col py-2 ${
            isHeader ? 'right-0 top-full mt-2' : 'left-0 bottom-full mb-2'
          }`}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-default)',
            boxShadow: '0 10px 25px -5px var(--color-shadow)',
          }}
        >
          <div className="px-4 py-3 border-b border-muted flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-primary)] text-lg font-bold shrink-0" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-[15px] truncate text-primary">{username}</span>
            </div>
          </div>

          <div className="py-2 flex flex-col">
            <div
              className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              onClick={handleToggleTheme}
            >
              <div className="flex items-center gap-3 text-secondary">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium">Тема</span>
              </div>
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-semibold">
                <div className={`px-2.5 py-1 rounded-full transition-colors ${!isDark ? 'bg-white shadow-sm text-accent' : 'text-muted'}`}>
                  Светлая
                </div>
                <div className={`px-2.5 py-1 rounded-full transition-colors ${isDark ? 'shadow-sm text-white' : 'text-muted'}`} style={isDark ? { backgroundColor: 'var(--color-accent)' } : undefined}>
                  Тёмная
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3 text-secondary">
                <Bell size={18} />
                <span className="text-sm font-medium">Уведомления</span>
              </div>
            </button>

            {role === 'ADMIN' && (
              <button 
                onClick={() => { setIsOpen(false); window.location.href = '/admin/dashboard'; }}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-accent" style={{ color: 'var(--color-accent)' }}>
                  <Shield size={18} />
                  <span className="text-sm font-medium">Админ-панель</span>
                </div>
              </button>
            )}


            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }} />

            <div className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 text-secondary">
                <Globe size={18} />
                <span className="text-sm font-medium">Язык</span>
              </div>
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-bold">
                <button
                  onClick={() => toggleLanguage('ru')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('ru') ? 'text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                  style={i18n.language?.startsWith('ru') ? { backgroundColor: 'var(--color-accent)' } : undefined}
                >
                  RU
                </button>
                <button
                  onClick={() => toggleLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('en') ? 'text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                  style={i18n.language?.startsWith('en') ? { backgroundColor: 'var(--color-accent)' } : undefined}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }} />

            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
              <Mail size={18} />
              <span className="text-sm font-medium">Поддержка</span>
            </button>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left mt-1"
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
