import React, { useState } from 'react';
import { InputField, Alert, SubmitButton } from './auth.components';
import { request, UserProfile, removeAuthToken } from './auth.service';

interface ProfileProps {
  user: UserProfile;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateSuccess, onLogout }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await request<{ message?: string; user: UserProfile }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username, email }),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setSuccess(result.data.message || 'Profile updated successfully!');
      onUpdateSuccess(result.data.user);

      // If email was changed, emailVerified is set to false, requiring logout
      if (email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        setTimeout(() => {
          removeAuthToken();
          onLogout();
        }, 2500);
      }
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mr-2.5"></span>
        Account Information
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-2 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="font-mono text-slate-200">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Email Verified:</span>
            <span
              className={`font-semibold ${user.emailVerified ? 'text-emerald-400' : 'text-amber-450'}`}
            >
              {user.emailVerified ? 'Yes' : 'No (Verification Required)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Joined At:</span>
            <span className="text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <InputField
          label="Username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {email.toLowerCase().trim() !== user.email.toLowerCase().trim() && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-300 leading-normal">
            ⚠ Changing your email address resets verification status and logs you out. You must click the verification link in the console log before logging in again.
          </div>
        )}

        <div className="pt-2">
          <SubmitButton type="submit" loading={loading}>
            Update Profile
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
