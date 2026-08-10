import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AppSidebar = () => {
  const { t } = useTranslation();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full">
      <div className="p-4 font-bold text-xl border-b border-gray-800">
        MeDev
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
          }
        >
          {t('sidebar.dashboard', 'Dashboard')}
        </NavLink>
        <NavLink 
          to="/profile/edit" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
          }
        >
          {t('sidebar.profileEditor', 'Profile Editor')}
        </NavLink>
        <NavLink 
          to="/resume" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
          }
        >
          {t('sidebar.resume', 'Resume')}
        </NavLink>
        <NavLink 
          to="/billing" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
          }
        >
          {t('sidebar.billing', 'Billing')}
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
        {t('sidebar.version', 'MeDev Rebuild')}
      </div>
    </aside>
  );
};
