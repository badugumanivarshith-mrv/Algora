import React, { useState } from 'react';
import { Topbar } from '../navigation/topbar';
import { Sidebar } from '../navigation/sidebar';
import { UserProfile } from '../../features/auth/auth.service';

interface MainLayoutProps {
  user: UserProfile;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setDrawerOpen(false);
    onNavigate(path);
  };

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path;
  };

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Topbar header bar */}
      <Topbar user={user} onMenuToggle={() => setDrawerOpen((prev) => !prev)} onNavigate={handleNavigate} />

      {/* Main viewport frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar for Desktop / Tablet */}
        <Sidebar currentPath={currentPath} onNavigate={handleNavigate} onLogout={onLogout} />

        {/* Sliding drawer sidebar for Mobile screens */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Click overlay mask */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              onClick={() => setDrawerOpen(false)}
            ></div>

            {/* Drawer side frame panel */}
            <div className="relative flex-grow flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
              
              {/* Drawer Top Branding banner */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-150 dark:border-slate-800 mb-5">
                <span className="font-extrabold text-base text-slate-800 dark:text-white tracking-wide">
                  Navigation
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  aria-label="Close Navigation Drawer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer list items links */}
              <div className="flex-1 space-y-2.5 flex flex-col">
                {links.map((link) => {
                  const active = isLinkActive(link.path);
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleNavigate(link.path)}
                      className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all ${
                        active
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}

                <div className="flex-grow"></div>

                {/* Clear Session / Logout button */}
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 font-bold mt-auto"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content body wrapper */}
        <main className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
