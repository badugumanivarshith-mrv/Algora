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
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile Workspace</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal public info, customize your avatar profile presets, and track platform metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Info & Preset Select Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main profile form */}
          <div className="saas-card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-850">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Information</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-450">Update your username, screen name, and bio.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-lg text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input mt-1.5"
                    placeholder="e.g. johndoe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="form-input mt-1.5"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-input mt-1.5 resize-none"
                  placeholder="Tell other students about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Saving changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Avatar preset selection card */}
          <div className="saas-card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-850">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Avatar Workspace</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-450">Choose a preset avatar style or input a custom image URL.</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="block text-xs font-semibold text-slate-750 dark:text-slate-350 mb-3">
                  Preset Avatars
                </span>
                <div className="flex flex-wrap gap-4">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAvatarPresetSelect(url)}
                      className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-150 hover:scale-105 cursor-pointer ${
                        user.avatarUrl === url
                          ? 'border-indigo-650 ring-2 ring-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAvatarUrlSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <label htmlFor="avatarUrl" className="block text-xs font-semibold text-slate-700 dark:text-slate-305">
                    Custom Avatar URL
                  </label>
                  <div className="mt-1.5 flex gap-3">
                    <input
                      type="url"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/avatar.png"
                    />
                    <button
                      type="submit"
                      className="btn-secondary whitespace-nowrap"
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
        <div className="space-y-6">
          
          {/* Avatar & Profile Card */}
          <div className="saas-card text-center">
            <div className="flex justify-center mb-4">
              {user.avatarUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xl border border-indigo-500 shadow-xs">
                  {getInitials()}
                </div>
              )}
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {user.displayName || user.username}
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500">@{user.username}</p>
            {user.bio && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 italic px-4 leading-relaxed">
                "{user.bio}"
              </p>
            )}

            <div className="mt-6 pt-5 border-t border-slate-150 dark:border-slate-850 text-left space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-450 border border-green-200 dark:border-green-900/30">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500">Verification</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 border border-blue-200 dark:border-blue-900/30">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-705 dark:text-amber-450 border border-amber-200 dark:border-amber-900/30 animate-pulse">
                    Pending
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Join Date</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Last Login</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
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
                <span className="text-slate-400 dark:text-slate-500">Account ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">#{user.id}</span>
              </div>
            </div>
          </div>

          {/* Email Unverified Warning Alert */}
          {!user.emailVerified && (
            <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/20 rounded-2xl p-5 transition-colors duration-200">
              <div className="flex">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3 space-y-2">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-450">Email Unverified</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                    Some advanced features are restricted. Please verify your email to unlock all capabilities.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {isResending ? 'Resending...' : 'Resend Code'}
                    </button>
                    {resendMessage && (
                      <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{resendMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Placeholder Metrics Card */}
          <div className="saas-card">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 tracking-wider uppercase">
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solved</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">42</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submissions</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">128</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Success Rate</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">78.5%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Streak</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">5 days</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
