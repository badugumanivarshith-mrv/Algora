
export interface ProfileUpdateInput {
  username?: string;
  displayName?: string;
  bio?: string;
  email?: string;
}

export interface ProfileResponse {
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  stats: {
    problemsSolved: number;
    submissions: number;
    successRate: number;
    currentStreak: number;
  };
}
