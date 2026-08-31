import React, { useState } from 'react';
import { request, UserProfile } from '../auth/auth.service';

interface ProfileDashboardProps {
  user: UserProfile;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Nala',
];

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user, onUpdateSuccess }) => {
  const [username, setUsername] = useState(user.username || '');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Validate form inputs
  const validateForm = () => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long.';
    }
    if (username.length > 30) {
      return 'Username must not exceed 30 characters.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }
    if (displayName && displayName.length > 100) {
      return 'Display name must not exceed 100 characters.';
    }
    if (avatarUrl && avatarUrl.length > 512) {
      return 'Avatar URL must not exceed 512 characters.';
    }
    return null;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await request<{ user: UserProfile; message?: string }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        username,
        displayName: displayName || null,
        bio: bio || null,
      }),
    });
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.data) {
      onUpdateSuccess(result.data.user);
      setSuccessMessage(result.message || 'Profile updated successfully.');
    }
  };

  const handleAvatarPresetSelect = async (url: string) => {
    setAvatarUrl(url);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await request<{ user: UserProfile }>('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl: url }),
    });

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.data) {
      onUpdateSuccess(result.data.user);
      setSuccessMessage('Avatar updated successfully.');
    }
  };

  const handleAvatarUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (avatarUrl && avatarUrl.length > 512) {
      setErrorMessage('Avatar URL must not exceed 512 characters.');
      return;
    }

    const result = await request<{ user: UserProfile }>('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl: avatarUrl || null }),
    });

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.data) {
      onUpdateSuccess(result.data.user);
      setSuccessMessage('Avatar URL updated successfully.');
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);
    const result = await request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    });
    setIsResending(false);

    if (result.error) {
      setResendMessage(`Error: ${result.error}`);
    } else {
      setResendMessage('Verification link resent. Please check your console.');
    }
  };

  // Get Initials for Avatar Fallback
  const getInitials = () => {
    const name = displayName || username || 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Workspace</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal public info, customize your avatar profile presets, and track platform metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Info & Preset Select Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main profile form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Profile Information</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update your username, screen name, and bio.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                  {successMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                    placeholder="e.g. johndoe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                  placeholder="Tell other students about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all duration-150 shadow-sm"
                >
                  {isSubmitting ? 'Saving changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Avatar preset selection card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Avatar Workspace</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose a preset avatar style or input a custom image URL.</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Preset Avatars
                </span>
                <div className="flex flex-wrap gap-4">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAvatarPresetSelect(url)}
                      className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-150 hover:scale-105 ${
                        user.avatarUrl === url
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAvatarUrlSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Custom Avatar URL
                  </label>
                  <div className="mt-1 flex gap-3">
                    <input
                      type="url"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                      placeholder="https://example.com/avatar.png"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Columns - Details & Stats */}
        <div className="space-y-8">
          
          {/* Avatar & Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 text-center transition-colors duration-200">
            <div className="flex justify-center mb-4">
              {user.avatarUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-2xl border border-indigo-400 shadow-sm">
                  {getInitials()}
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {user.displayName || user.username}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
            {user.bio && (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic px-4">
                "{user.bio}"
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Verification</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                    Pending
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Join Date</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Login</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })
                    : 'First login session'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">#{user.id}</span>
              </div>
            </div>
          </div>

          {/* Email Unverified Warning Alert */}
          {!user.emailVerified && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5 transition-colors duration-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Email Unverified</h4>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-500 leading-normal">
                    Some advanced features are restricted. Please verify your email to unlock all capabilities.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm focus:outline-none transition-all duration-150 disabled:opacity-50"
                    >
                      {isResending ? 'Resending...' : 'Resend Code'}
                    </button>
                    {resendMessage && (
                      <p className="mt-2 text-2xs text-amber-600 dark:text-amber-450 font-medium">{resendMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Placeholder Metrics Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 tracking-tight uppercase">
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-lg text-center">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Solved</span>
                <span className="text-2xl font-bold text-slate-950 dark:text-white mt-1 block">42</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-lg text-center">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Submissions</span>
                <span className="text-2xl font-bold text-slate-950 dark:text-white mt-1 block">128</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-lg text-center">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Success Rate</span>
                <span className="text-2xl font-bold text-slate-950 dark:text-white mt-1 block">78.5%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-lg text-center">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Current Streak</span>
                <span className="text-2xl font-bold text-slate-950 dark:text-white mt-1 block">5 days</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
