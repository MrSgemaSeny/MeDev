import { Layout } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-secondary text-sm">Manage your application preferences and account settings.</p>
      </div>

      <div className="rounded-2xl border border-default surface-primary p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl surface-tertiary flex items-center justify-center mb-6">
          <Layout className="text-muted" size={32} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Settings Hub</h2>
        <p className="text-secondary max-w-sm mb-6">
          We are currently building out the settings dashboard. Soon you will be able to manage your notifications, security preferences, and UI themes here.
        </p>
      </div>
    </div>
  );
};
