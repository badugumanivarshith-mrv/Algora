import React, { useEffect, useState } from 'react';
import { UserProfile } from '../auth/auth.service';
import { 
  gamificationService, 
  UserProfileAnalytics, 
  AchievementItem, 
  LeaderboardUser, 
  UserActivityItem 
} from './gamification.service';

interface ProgressDashboardProps {
  user: UserProfile;
  onNavigate?: (path: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [analytics, setAnalytics] = useState<UserProfileAnalytics | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, achData, actData, lbData] = await Promise.all([
        gamificationService.getProfileAnalytics(),
        gamificationService.getAchievements(),
        gamificationService.getActivity(15),
        gamificationService.getLeaderboard(leaderboardPage, 10, searchQuery)
      ]);

      if (profileData) setAnalytics(profileData);
      if (achData) setAchievements(achData);
      if (actData) setActivities(actData);
      if (lbData) {
        setLeaderboard(lbData.rankings);
        setTotalPages(lbData.pagination.totalPages);
      }
    } catch (e: any) {
      console.error('Failed to load dashboard data:', e);
      setError('Failed to load progress data. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [leaderboardPage, searchQuery]);

  if (loading && !analytics) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your progress profile...</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="saas-card bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-center py-10 space-y-4">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        <button onClick={loadDashboardData} className="btn-secondary text-xs px-4 py-2">Retry</button>
      </div>
    );
  }

  // Calculate XP progress to next level
  const currentLevel = analytics?.level || 1;
  const xpForCurrentLevel = (currentLevel - 1) ** 2 * 100;
  const xpForNextLevel = currentLevel ** 2 * 100;
  const currentXp = analytics?.xp || 0;
  const xpProgress = Math.max(0, currentXp - xpForCurrentLevel);
  const xpNeeded = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  return (
    <div className="space-y-8">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Progress Analytics & Gamification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your XP level, problem solving accuracy, streak, achievements, and global rank.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('/problems')}
              className="btn-secondary py-2 px-3 text-xs font-bold"
            >
              Solve Problems
            </button>
          )}

          <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'achievements'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Hero Grid: Level, Streak, Accuracy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level & XP Card */}
            <div className="md:col-span-2 saas-card bg-gradient-to-br from-indigo-500/10 via-white to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border-indigo-200/50 dark:border-indigo-800/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Current Level</p>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{analytics?.level || 1}</span>
                    <span className="text-lg font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {analytics?.rank || 'Novice'}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total XP Earned</p>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.xp || 0} XP</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Level {currentLevel} ({xpForCurrentLevel} XP)</span>
                  <span>Level {currentLevel + 1} ({xpForNextLevel} XP)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {xpNeeded - xpProgress} XP needed for Level {currentLevel + 1}
                </div>
              </div>
            </div>

            {/* Streak Widget */}
            <div className="saas-card flex flex-col justify-between bg-gradient-to-br from-amber-500/10 via-white to-orange-50/20 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 border-amber-200/50 dark:border-amber-800/50 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Active Streak</p>
                <span className="text-3xl">🔥</span>
              </div>
              <div className="my-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-amber-600 dark:text-amber-400">{analytics?.streak.currentStreak || 0}</span>
                  <span className="text-base font-bold text-slate-600 dark:text-slate-300">Days</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Longest Record:</span>
                <span className="text-slate-900 dark:text-white font-bold">{analytics?.streak.longestStreak || 0} Days</span>
              </div>
            </div>
          </div>

          {/* Solved Breakdown & Accuracy Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solved by Difficulty */}
            <div className="saas-card space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Solved Problems Breakdown</span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {analytics?.solved.total || 0} / {analytics?.solved.totalProblems || 0} Total
                </span>
              </h3>

              <div className="space-y-4">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {analytics?.solved.easy || 0} / {analytics?.solved.totalEasy || 0}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics?.solved.totalEasy ? (analytics.solved.easy / analytics.solved.totalEasy) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-600 dark:text-amber-400">Medium</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {analytics?.solved.medium || 0} / {analytics?.solved.totalMedium || 0}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics?.solved.totalMedium ? (analytics.solved.medium / analytics.solved.totalMedium) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-600 dark:text-rose-400">Hard</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {analytics?.solved.hard || 0} / {analytics?.solved.totalHard || 0}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics?.solved.totalHard ? (analytics.solved.hard / analytics.solved.totalHard) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accuracy & Tags Distribution */}
            <div className="saas-card space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submissions & Accuracy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{analytics?.stats.totalSubmissions || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accuracy Rate</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{analytics?.stats.accuracyRate || 0}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Top Solved Tags</p>
                <div className="flex flex-wrap gap-2">
                  {analytics?.tagsDistribution && analytics.tagsDistribution.length > 0 ? (
                    analytics.tagsDistribution.map((t) => (
                      <span key={t.tagName} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-100 dark:border-indigo-900/40">
                        {t.tagName} ({t.count})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No tag data available yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="saas-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Recent Activity Feed
            </h3>
            
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium text-sm">
                No recent activity found. Start solving problems to earn XP!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {activity.action === 'submission_accepted' && '✅'}
                        {activity.action === 'submission_accepted_repeat' && '🔄'}
                        {activity.action === 'submission_attempted' && '⏳'}
                        {activity.action === 'login' && '👋'}
                        {activity.action === 'achievement_unlocked' && '🏆'}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {activity.action === 'submission_accepted' && `Accepted solution for ${activity.metadata?.problemTitle || 'a problem'} (+XP)`}
                          {activity.action === 'submission_accepted_repeat' && `Accepted re-submission for ${activity.metadata?.problemTitle || 'a problem'}`}
                          {activity.action === 'submission_attempted' && `Attempted solution for ${activity.metadata?.problemTitle || 'a problem'} (${activity.metadata?.status})`}
                          {activity.action === 'login' && 'User logged in'}
                          {activity.action === 'achievement_unlocked' && `Unlocked achievement: ${activity.metadata?.name || 'Milestone'}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Achievements Gallery</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unlocked {achievements.filter(a => a.unlocked).length} of {achievements.length} Badges
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {ach.category}
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-1">
                      {ach.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {ach.description}
                    </p>
                    {ach.unlocked && (
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                        <span>✓ Unlocked</span>
                        {ach.unlockedAt && <span>on {new Date(ach.unlockedAt).toLocaleDateString()}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Platform Leaderboard</h3>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search coder by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="saas-card overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3">Coder</th>
                    <th className="px-4 py-3 text-center">Level & Rank</th>
                    <th className="px-4 py-3 text-center">XP</th>
                    <th className="px-4 py-3 text-center">Solved (E/M/H)</th>
                    <th className="px-4 py-3 text-center">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No coders found matching search.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((item) => (
                      <tr
                        key={item.userId}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                          item.userId === user.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center font-bold">
                          {item.rank === 1 && '🥇'}
                          {item.rank === 2 && '🥈'}
                          {item.rank === 3 && '🥉'}
                          {item.rank > 3 && `#${item.rank}`}
                        </td>
                        <td className="px-4 py-3 flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                            {item.username.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {item.username} {item.userId === user.id && <span className="text-[10px] text-indigo-500 font-extrabold">(You)</span>}
                            </p>
                            {item.displayName && <p className="text-[10px] text-slate-400">{item.displayName}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-slate-900 dark:text-white">Lvl {item.level}</span>
                          <span className="text-[10px] block text-slate-400">{item.rankTitle}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                          {item.xp} XP
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-slate-900 dark:text-white">{item.totalSolved}</span>
                          <span className="text-[10px] text-slate-400 block">
                            ({item.easySolved}/{item.mediumSolved}/{item.hardSolved})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {item.accuracyRate}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs font-semibold">
              <button
                disabled={leaderboardPage === 1}
                onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                className="btn-secondary px-3 py-1.5 disabled:opacity-40"
              >
                Previous Page
              </button>
              <span className="text-slate-500">
                Page {leaderboardPage} of {totalPages}
              </span>
              <button
                disabled={leaderboardPage === totalPages}
                onClick={() => setLeaderboardPage(p => Math.min(totalPages, p + 1))}
                className="btn-secondary px-3 py-1.5 disabled:opacity-40"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
