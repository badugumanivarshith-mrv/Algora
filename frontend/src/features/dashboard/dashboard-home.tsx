import React, { useEffect, useState } from 'react';
import { UserProfile, request } from '../auth/auth.service';

interface DashboardHomeProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

interface UserProgress {
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  totalSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onNavigate }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const res = await request<{ progress: UserProgress }>('/api/leaderboard/progress');
      if (res.data) {
        setProgress(res.data.progress);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header welcome banner */}
      <div className="bg-indigo-50/20 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user.displayName || user.username}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
            Solve algorithms challenges, test solution runtimes, and climb the global rankings leaderboard.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => onNavigate('/problems')} className="btn-primary py-2 px-4 text-xs font-bold">
            Coding Problems →
          </button>
          <button onClick={() => onNavigate('/leaderboard')} className="btn-secondary py-2 px-4 text-xs font-bold">
            Leaderboard
          </button>
        </div>
      </div>

      {/* User Progress Stats Grid */}
      {progress && (
        <div className="saas-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Coding Progress & Solved Problems</h3>
            <span className="text-xs font-bold text-slate-400">Acceptance Rate: {progress.acceptanceRate}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-2xs font-bold text-slate-400 uppercase">Total Solved</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{progress.totalSolved}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                <span className="text-slate-700 dark:text-slate-300">{progress.easySolved} / {progress.totalEasy}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress.totalEasy > 0 ? (progress.easySolved / progress.totalEasy) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400">Medium</span>
                <span className="text-slate-700 dark:text-slate-300">{progress.mediumSolved} / {progress.totalMedium}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${progress.totalMedium > 0 ? (progress.mediumSolved / progress.totalMedium) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-600 dark:text-rose-400">Hard</span>
                <span className="text-slate-700 dark:text-slate-300">{progress.hardSolved} / {progress.totalHard}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${progress.totalHard > 0 ? (progress.hardSolved / progress.totalHard) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};
