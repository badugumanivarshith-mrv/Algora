import React, { useState, useRef, useEffect } from 'react';
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
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuToggle, onNavigate, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 transition-colors duration-200 backdrop-blur-sm shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all"
            aria-label="Toggle Navigation Drawer"
          >
            <MenuIcon />
          </button>
          
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-indigo-650 dark:bg-indigo-600 flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-base tracking-wider">A</span>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
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
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-amber-500 dark:text-indigo-400 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Vertical Divider */}
          <span className="h-5 w-px bg-slate-200 dark:bg-slate-800"></span>

          {/* User Profile Dropdown Ref */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
            >
              {/* Avatar Widget */}
              {user.avatarUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-xs">
                  <span className="text-white font-bold text-xs uppercase">
                    {(user.displayName || user.username).slice(0, 2)}
                  </span>
                </div>
              )}
              
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                  {user.displayName || user.username}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Dropdown Menu block */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl shadow-lg py-1.5 z-50 text-sm">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                  <p className="font-bold text-slate-800 dark:text-white truncate mt-0.5">{user.displayName || user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => { onNavigate('/profile'); setDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-left text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Your Profile
                </button>
                <button
                  onClick={() => { onNavigate('/settings'); setDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-left text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Settings
                </button>

                <div className="border-t border-slate-100 dark:border-slate-850 my-1"></div>

                <button
                  onClick={() => { onLogout(); setDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 font-bold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
