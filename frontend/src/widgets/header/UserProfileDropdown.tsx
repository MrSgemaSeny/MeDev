import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bell, Globe, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '../../entities/user/model/store';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../shared/api/hooks/useProfile';

interface UserProfileDropdownProps {
  variant?: 'sidebar' | 'header';
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const username = useAuthStore((s) => s.username);
  const role = (useAuthStore as any)((s: any) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const { i18n } = useTranslation();
  const { data: profile } = useProfile();
  
  const avatarUrl = profile?.githubUsername ? `https://github.com/${profile.githubUsername}.png` : `https://github.com/${username}.png`;

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
      <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
        <div
          className="h-9 w-9 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        />
      </div>
    );
  }

  const toggleLanguage = (lang: string) => i18n.changeLanguage(lang);

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
        aria-label="Профиль пользователя и настройки"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          isHeader
            ? 'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none'
            : 'w-full flex items-center justify-between gap-2 py-1.5 px-2 min-h-[44px] rounded-md hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none'
        }
      >
        {isHeader ? (
          <img
            src={avatarUrl}
            alt={`${username || 'User'} — фото профиля`}
            className="w-9 h-9 rounded-full object-cover hover:ring-2 transition-all"
            style={{ '--tw-ring-color': 'var(--color-border-default)' } as React.CSSProperties}
          />
        ) : (
          <div className="flex items-center gap-2">
            <img src={avatarUrl} alt={`${username || 'User'} — фото профиля`} className="w-7 h-7 shrink-0 rounded-full object-cover shadow-sm border border-default" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
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
          className={`absolute w-64 rounded-xl shadow-2xl border border-[#30363d] bg-[#161b22] z-50 flex flex-col py-2 ${
            isHeader ? 'right-0 top-full mt-2' : 'left-0 bottom-full mb-2'
          }`}
          style={{
            boxShadow: '0 10px 25px -5px rgba(1, 4, 9, 0.8)',
          }}
        >
          <div className="px-4 py-3 border-b border-[#30363d] flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={`${username || 'User'} — фото профиля`}
              className="w-10 h-10 rounded-full object-cover border border-[#30363d] shrink-0 bg-[#21262d]"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-[15px] truncate text-white">{username}</span>
            </div>
          </div>

          <div className="py-2 flex flex-col">
            <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left cursor-pointer">
              <div className="flex items-center gap-3 text-[#8b949e] hover:text-[#c9d1d9]">
                <Bell size={18} />
                <span className="text-sm font-medium">Уведомления</span>
              </div>
            </button>

            {role === 'ADMIN' && (
              <button 
                onClick={() => { setIsOpen(false); window.location.href = '/admin/dashboard'; }}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 text-[#2ea043]">
                  <Shield size={18} />
                  <span className="text-sm font-medium">Админ-панель</span>
                </div>
              </button>
            )}

            <div className="h-px bg-[#30363d] my-1 mx-4" />

            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#8b949e]">
                <Globe size={18} />
                <span className="text-sm font-medium">Язык</span>
              </div>
              <div className="flex bg-[#0d1117] border border-[#30363d] rounded-full p-0.5 text-xs font-bold">
                <button
                  onClick={() => toggleLanguage('ru')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    i18n.language?.startsWith('ru')
                      ? 'bg-[#238636] text-white shadow-sm'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => toggleLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    i18n.language?.startsWith('en')
                      ? 'bg-[#238636] text-white shadow-sm'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="h-px bg-[#30363d] my-1 mx-4" />

            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-white/5 transition-colors text-left cursor-pointer">
              <Mail size={18} />
              <span className="text-sm font-medium">Поддержка</span>
            </button>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-[#f85149] hover:bg-[#f85149]/10 transition-colors text-left mt-1 cursor-pointer"
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
