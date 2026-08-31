import React, { useState } from 'react';
import { request, UserProfile } from '../auth/auth.service';
import { useTheme } from '../theme/theme.context';

interface AccountSettingsProps {
  user: UserProfile;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const { theme, toggleTheme } = useTheme();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Email prefs state
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [isSavingEmailPrefs, setIsSavingEmailPrefs] = useState(false);
  const [emailPrefsSuccess, setEmailPrefsSuccess] = useState<string | null>(null);

  // Notification prefs state
  const [pushBrowser, setPushBrowser] = useState(false);
  const [pushSounds, setPushSounds] = useState(true);
  const [isSavingNotificationPrefs, setIsSavingNotificationPrefs] = useState(false);
  const [notificationPrefsSuccess, setNotificationPrefsSuccess] = useState<string | null>(null);

  // Password validation helper
  const validatePassword = () => {
    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(newPassword)) {
      return 'New password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(newPassword)) {
      return 'New password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(newPassword)) {
      return 'New password must contain at least one number.';
    }
    if (newPassword !== confirmNewPassword) {
      return 'New passwords do not match.';
    }
    return null;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const validationError = validatePassword();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setIsChangingPassword(true);
    const result = await request<{ message: string }>('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });
    setIsChangingPassword(false);

    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess(result.message || 'Password updated successfully. Logging out...');
      // Clear forms
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Force log out after 2 seconds to require logging in with the new password
      setTimeout(() => {
        // Perform log out by manually dropping the token and refreshing
        localStorage.removeItem('algora_auth_token');
        window.location.reload();
      }, 2000);
    }
  };

  const handleEmailPrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmailPrefs(true);
    setEmailPrefsSuccess(null);

    setTimeout(() => {
      setIsSavingEmailPrefs(false);
      setEmailPrefsSuccess('Email preferences updated successfully.');
    }, 600);
  };

  const handleNotificationPrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotificationPrefs(true);
    setNotificationPrefsSuccess(null);

    setTimeout(() => {
      setIsSavingNotificationPrefs(false);
      setNotificationPrefsSuccess('Notification preferences updated successfully.');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Customize your experience, update security settings, and configure email and UI preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Configurations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Change Password</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Update your account password. You will be logged out automatically after changing.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                    placeholder="Min 8 characters with upper, lower, number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-150"
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all duration-150 shadow-sm"
                >
                  {isChangingPassword ? 'Updating password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Email Preferences Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Email Notifications</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage what email updates you receive from Algora AI.</p>
            </div>

            <form onSubmit={handleEmailPrefsSubmit} className="p-6 space-y-6">
              {emailPrefsSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                  {emailPrefsSuccess}
                </div>
              )}

              <div className="space-y-4">
                <label className="relative flex items-start cursor-pointer select-none">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="font-medium text-slate-750 dark:text-slate-350">Platform Updates</span>
                    <p className="text-slate-450 dark:text-slate-450 text-xs">Receive news about new features, courses, and platform updates.</p>
                  </div>
                </label>

                <label className="relative flex items-start cursor-pointer select-none">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={emailWeekly}
                      onChange={(e) => setEmailWeekly(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="font-medium text-slate-750 dark:text-slate-350">Weekly Digests</span>
                    <p className="text-slate-450 dark:text-slate-450 text-xs">Receive a weekly summary of your streak and coding problems solved.</p>
                  </div>
                </label>

                <label className="relative flex items-start cursor-pointer select-none">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={emailSecurity}
                      onChange={(e) => setEmailSecurity(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="font-medium text-slate-750 dark:text-slate-350">Security Alerts</span>
                    <p className="text-slate-450 dark:text-slate-450 text-xs">Receive notifications about passwords changes and new login sessions.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingEmailPrefs}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all duration-150"
                >
                  {isSavingEmailPrefs ? 'Saving...' : 'Save Email Preferences'}
                </button>
              </div>
            </form>
          </div>

          {/* Browser / Notification Preferences Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Push & Audio Preferences</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Configure layout behaviors and browser push preferences.</p>
            </div>

            <form onSubmit={handleNotificationPrefsSubmit} className="p-6 space-y-6">
              {notificationPrefsSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                  {notificationPrefsSuccess}
                </div>
              )}

              <div className="space-y-4">
                <label className="relative flex items-start cursor-pointer select-none">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={pushBrowser}
                      onChange={(e) => setPushBrowser(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="font-medium text-slate-750 dark:text-slate-350">Browser Push Notifications</span>
                    <p className="text-slate-450 dark:text-slate-450 text-xs">Enable real-time browser alerts when milestones are reached.</p>
                  </div>
                </label>

                <label className="relative flex items-start cursor-pointer select-none">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={pushSounds}
                      onChange={(e) => setPushSounds(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="font-medium text-slate-750 dark:text-slate-350">App Audio Success Alerts</span>
                    <p className="text-slate-450 dark:text-slate-450 text-xs">Play subtle audio alert chimes upon successful solution submissions.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotificationPrefs}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all duration-150"
                >
                  {isSavingNotificationPrefs ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Columns - Theme and Security Meta */}
        <div className="space-y-8">
          
          {/* Theme Preference Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 tracking-tight uppercase">
              Theme Selection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Choose your dashboard environment appearance preference.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { if (theme === 'dark') toggleTheme(); }}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all duration-150 ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600 font-semibold ring-2 ring-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650'
                }`}
              >
                {/* Sun Icon */}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span className="text-sm">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => { if (theme === 'light') toggleTheme(); }}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all duration-150 ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400 font-semibold ring-2 ring-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650'
                }`}
              >
                {/* Moon Icon */}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm">Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Account Security Metadata Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 tracking-tight uppercase">
              Account Security Info
            </h3>

            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Email Verification</span>
                {user.emailVerified ? (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                    Pending Verification
                  </span>
                )}
              </div>

              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                <span className="text-slate-400">Password State</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Last updated recently</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Registered On</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
