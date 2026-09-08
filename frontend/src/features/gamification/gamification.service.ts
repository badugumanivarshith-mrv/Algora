import { request } from '../auth/auth.service';

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface UserXpProgress {
  totalXp: number;
  level: number;
  rank: string;
}

export interface SolvedBreakdown {
  easy: number;
  totalEasy: number;
  medium: number;
  totalMedium: number;
  hard: number;
  totalHard: number;
  total: number;
  totalProblems: number;
}

export interface UserStatsSummary {
  totalSubmissions: number;
  acceptedSubmissions: number;
  accuracyRate: number;
}

export interface TagDistribution {
  tagName: string;
  count: number;
}

export interface UserProfileAnalytics {
  xp: number;
  level: number;
  rank: string;
  streak: UserStreak;
  solved: SolvedBreakdown;
  stats: UserStatsSummary;
  tagsDistribution: TagDistribution[];
}

export interface AchievementItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface LeaderboardUser {
  rank: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  rankTitle: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalSubmissions: number;
  accuracyRate: number;
}

export interface LeaderboardResponse {
  rankings: LeaderboardUser[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UserActivityItem {
  id: number;
  userId: number;
  problemId: number | null;
  action: string;
  metadata: any;
  createdAt: string;
}

export const gamificationService = {
  getProfileAnalytics: async () => {
    const res = await request<{ success: boolean; data: UserProfileAnalytics }>('/api/analytics/profile');
    return res.data?.data || null;
  },
  getLeaderboard: async (page = 1, limit = 10, search = '') => {
    const res = await request<{ success: boolean; data: LeaderboardResponse }>(
      `/api/analytics/leaderboard?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    return res.data?.data || { rankings: [], pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 } };
  },
  getAchievements: async () => {
    const res = await request<{ success: boolean; data: AchievementItem[] }>('/api/analytics/achievements');
    return res.data?.data || [];
  },
  getActivity: async (limit = 20) => {
    const res = await request<{ success: boolean; data: UserActivityItem[] }>(`/api/analytics/activity?limit=${limit}`);
    return res.data?.data || [];
  },
  getProgress: async () => {
    const res = await request<{ success: boolean; data: { streak: UserStreak; xp: UserXpProgress } }>('/api/progress');
    return res.data?.data || null;
  },
};
