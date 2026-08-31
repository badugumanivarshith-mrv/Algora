import React from 'react';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onLogout }) => {
  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path;
  };

  return (
    <aside className="w-20 lg:w-64 hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 transition-all duration-200">
      
      {/* Navigation Links Area */}
      <div className="flex-1 px-3 py-6 space-y-2 flex flex-col items-stretch">
        {links.map((link) => {
          const active = isLinkActive(link.path);
          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 ${
                active
                  ? 'bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500/80'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
              }`}
            >
              <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${active ? 'text-indigo-550 dark:text-indigo-400' : ''}`}>
                {link.icon}
              </span>
              <span className="text-sm font-semibold tracking-tight hidden lg:inline">
                {link.label}
              </span>
            </button>
          );
        })}

        {/* Separator / Spacer */}
        <div className="flex-1"></div>

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:bg-rose-500/10 font-bold mt-auto"
        >
          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
            <LogoutIcon />
          </span>
          <span className="text-sm font-semibold tracking-tight hidden lg:inline">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};
