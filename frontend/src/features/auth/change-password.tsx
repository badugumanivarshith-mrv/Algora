import React, { useState } from 'react';
import { InputField, Alert, SubmitButton } from './auth.components';
import { request, removeAuthToken } from './auth.service';

interface ChangePasswordProps {
  onLogout: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    const result = await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Password changed successfully. Requiring fresh login...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      // Invalidate frontend token after a short delay
      setTimeout(() => {
        removeAuthToken();
        onLogout();
      }, 2000);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-violet-405 mr-2.5"></span>
        Update Password
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <InputField
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <InputField
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <InputField
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />

        <div className="pt-2">
          <SubmitButton type="submit" loading={loading}>
            Change Password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
