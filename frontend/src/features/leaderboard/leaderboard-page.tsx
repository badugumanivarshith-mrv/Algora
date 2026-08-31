import React, { useEffect, useState } from 'react';
import { request } from '../auth/auth.service';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

export const LeaderboardPage: React.FC = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      const res = await request<{ rankings: LeaderboardEntry[] }>('/api/leaderboard');
      if (res.data) {
        setRankings(res.data.rankings);
      }
      setLoading(false);
    };

    fetchRankings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Global Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Top algorithm engineers ranked by problems solved, difficulty accuracy, and submission efficiency.
        </p>
      </div>

      <div className="saas-card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-16 space-y-4">
            <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
            <p className="text-sm text-slate-400">Loading rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No rankings available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-sm font-medium">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4 text-center">Easy</th>
                  <th className="px-6 py-4 text-center">Medium</th>
                  <th className="px-6 py-4 text-center">Hard</th>
                  <th className="px-6 py-4 text-center">Total Solved</th>
                  <th className="px-6 py-4 text-right">Acceptance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {rankings.map((user) => {
                  const getRankBadge = (rank: number) => {
                    if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">1</span>;
                    if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-black text-xs shadow-sm">2</span>;
                    if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-sm">3</span>;
                    return <span className="font-bold text-slate-500 font-mono">#{rank}</span>;
                  };

                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">{getRankBadge(user.rank)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{user.displayName || user.username}</p>
                            <p className="text-2xs text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">{user.easySolved}</td>
                      <td className="px-6 py-4 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">{user.mediumSolved}</td>
                      <td className="px-6 py-4 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">{user.hardSolved}</td>
                      <td className="px-6 py-4 text-center font-extrabold text-slate-900 dark:text-white font-mono">{user.totalSolved}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300 font-bold">{user.acceptanceRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
