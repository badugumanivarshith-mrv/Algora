import React from 'react';
import { useTheme } from '../theme/theme.context';
import { UserProfile } from '../auth/auth.service';

interface SettingsPageProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Adjust theme preferences, examine account configuration, and view active security properties.
        </p>
      </div>

      {/* Theme Card Toggle */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2.5"></span>
          Theme System
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch the platform interface styles between Dark Mode and Light Mode. Your selection is persisted automatically.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Light Mode
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Dark Mode
          </button>
        </div>
      </div>

      {/* Account Details card */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 mr-2.5"></span>
          Account Details
        </h3>
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/45 rounded-xl space-y-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Username:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Email:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Joined Date:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Security Properties */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5"></span>
          Security Information
        </h3>
        <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            Your account credentials are encrypted in our database using standard salted **bcrypt hashing** (strength factor 10) to guard against rainbow table intrusions.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/45 rounded-xl space-y-2">
            <span className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Required Password Strengths:</span>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Minimum length of 8 characters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Contains at least 1 uppercase letter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Contains at least 1 lowercase letter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Contains at least 1 numeric character</span>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              Update Password or Email Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
