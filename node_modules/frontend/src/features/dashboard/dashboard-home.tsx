import React from 'react';
import { UserProfile } from '../auth/auth.service';

interface DashboardHomeProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header welcome banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">{user.username}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            You're currently signed in and have access to the Algora AI dashboard shell. Track system health or adjust your settings below.
          </p>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Profile Status Card */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profile Status</span>
            <span className={`w-2.5 h-2.5 rounded-full ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 truncate">{user.username}</h3>
            <p className="text-xs text-slate-505 dark:text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Edit details →
            </button>
          </div>
        </div>

        {/* Security Status Card */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Security Status</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Credentials Safe</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Password hashing using bcrypt.</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Update password →
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Metadata</span>
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold">Standard</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">User ID: #{user.id}</h3>
            <p className="text-xs text-slate-505 dark:text-slate-400">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Status: {user.emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

      </div>

      {/* Account metadata breakdown table */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Session Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span>Username:</span>
            <span className="text-slate-805 dark:text-slate-200 font-bold">{user.username}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span>Email Address:</span>
            <span className="text-slate-805 dark:text-slate-200 font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2 sm:border-0 sm:pb-0">
            <span>Verification Status:</span>
            <span className={`font-bold ${user.emailVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
              {user.emailVerified ? 'Verified Account' : 'Verification Required'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Registration Timestamp:</span>
            <span className="text-slate-805 dark:text-slate-200 font-bold">
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
