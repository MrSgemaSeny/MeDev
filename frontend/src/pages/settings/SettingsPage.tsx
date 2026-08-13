import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../entities/user/model/store';
import { LogOut, User, Globe, Moon, ShieldAlert, Trash2 } from 'lucide-react';

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { username, plan, logout } = useAuthStore();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-primary">{t('settings.title', 'Settings')}</h1>
        <p className="text-secondary text-sm">
          {t('settings.subtitle', 'Manage your account settings and application preferences.')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="rounded-2xl border border-default surface-primary overflow-hidden">
          <div className="px-6 py-4 border-b border-default surface-secondary flex items-center gap-2">
            <User size={18} className="text-muted" />
            <h2 className="font-semibold text-primary">{t('settings.account', 'Account')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-primary mb-1">Username</div>
                <div className="text-sm text-secondary">@{username || 'Guest'}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-primary mb-1">Current Plan</div>
                <div className="text-sm text-secondary capitalize">{plan || 'Free'} Plan</div>
              </div>
            </div>

            <div className="pt-4 border-t border-default flex justify-start">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:surface-tertiary text-secondary hover:text-primary"
              >
                <LogOut size={16} />
                {t('settings.logout', 'Sign Out')}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="rounded-2xl border border-default surface-primary overflow-hidden">
          <div className="px-6 py-4 border-b border-default surface-secondary flex items-center gap-2">
            <Globe size={18} className="text-muted" />
            <h2 className="font-semibold text-primary">{t('settings.preferences', 'Preferences')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-primary mb-1">{t('settings.language', 'Language')}</div>
                <div className="text-sm text-secondary">{t('settings.languageDesc', 'Choose your preferred language')}</div>
              </div>
              <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-lg border border-default">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    i18n.language?.startsWith('en')
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('ru')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    i18n.language?.startsWith('ru')
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Русский
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-primary mb-1">{t('settings.theme', 'Theme')}</div>
                <div className="text-sm text-secondary">{t('settings.themeDesc', 'Application color theme')}</div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-default bg-[var(--color-bg-secondary)] opacity-70 cursor-not-allowed">
                <Moon size={16} className="text-[var(--color-accent)]" />
                <span className="text-sm font-medium">Dark Mode (Enforced)</span>
              </div>
            </div>
            <p className="text-xs text-muted max-w-lg">
              * Note: We enforce a strict GitHub Dark Mode design system for premium aesthetics. Light mode is not supported.
            </p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl border border-red-900/30 surface-primary overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/30 bg-red-950/10 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" />
            <h2 className="font-semibold text-red-500">{t('settings.dangerZone', 'Danger Zone')}</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-primary mb-1">{t('settings.deleteAccount', 'Delete Account')}</div>
                <div className="text-sm text-secondary max-w-md">
                  {t('settings.deleteAccountDesc', 'Permanently delete your account and all associated data. This action cannot be undone.')}
                </div>
              </div>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500/10 text-red-500 border border-red-500/20 opacity-50 cursor-not-allowed"
                title="Please contact support to delete your account"
              >
                <Trash2 size={16} />
                {t('settings.deleteBtn', 'Delete Account')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
