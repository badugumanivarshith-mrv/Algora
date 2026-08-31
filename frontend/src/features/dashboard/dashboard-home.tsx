import React from 'react';
import { UserProfile } from '../auth/auth.service';

interface DashboardHomeProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Header welcome banner */}
      <div className="bg-indigo-50/20 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user.displayName || user.username}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
            You're currently signed in and have access to the Algora AI dashboard shell. Track system health or adjust your settings below.
          </p>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Profile Status Card */}
        <div className="saas-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profile Status</span>
            <span className={`w-2 h-2 rounded-full ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">{user.displayName || user.username}</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Edit details →
            </button>
          </div>
        </div>

        {/* Security Status Card */}
        <div className="saas-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Security Status</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 dark:text-indigo-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Credentials Safe</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">Password hashing using bcrypt.</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/settings')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Update password →
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="saas-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Metadata</span>
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded text-[10px] font-bold border border-indigo-100 dark:border-indigo-900/30">Standard</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">User ID: #{user.id}</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">
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
      <div className="saas-card space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Session Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>Username:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user.username}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>Email Address:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 sm:border-0 sm:pb-0">
            <span>Verification Status:</span>
            <span className={`font-bold ${user.emailVerified ? 'text-emerald-600 dark:text-emerald-450' : 'text-amber-650 dark:text-amber-450'}`}>
              {user.emailVerified ? 'Verified Account' : 'Verification Required'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Registration Timestamp:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
