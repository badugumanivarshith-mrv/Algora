import React from 'react';
import { useTheme } from '../../features/theme/theme.context';
import { UserProfile } from '../../features/auth/auth.service';

// Icons
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

interface TopbarProps {
  user: UserProfile;
  onMenuToggle: () => void;
  onNavigate: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuToggle, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/60 backdrop-blur-md sticky top-0 z-40 bg-white/80 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-105 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 active:scale-95 transition-all"
            aria-label="Toggle Navigation Drawer"
          >
            <MenuIcon />
          </button>
          
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('/dashboard')}>
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-black text-lg tracking-wider">A</span>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                ALGORA AI
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side: Theme Toggle & Profile Info */}
        <div className="flex items-center space-x-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 dark:text-indigo-400 active:scale-95 transition-all"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Vertical Divider */}
          <span className="h-5 w-px bg-slate-200 dark:bg-slate-800"></span>

          {/* User info details */}
          <div 
            onClick={() => onNavigate('/profile')}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          >
            {/* Simulated Avatar Widget */}
            {user.avatarUrl ? (
              <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-150">
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-indigo-650 to-violet-650 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs uppercase">
                  {(user.displayName || user.username).slice(0, 2)}
                </span>
              </div>
            )}
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-755 dark:text-slate-200 tracking-tight">
                {user.displayName || user.username}
              </span>
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
