import React, { useEffect, useState } from 'react';
import { AuthCard, InputField, Alert, SubmitButton } from './auth.components';
import { request } from './auth.service';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setToken(queryParams.get('token'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Reset token is missing from the URL.');
      return;
    }

    setLoading(true);

    const result = await request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Password reset successful! You can now log in.');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <AuthCard title="Reset Password" subtitle="Enter your new account password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {!token && !success && (
          <Alert type="error" message="Invalid link. No password reset token was found in the URL." />
        )}

        {token && !success && (
          <>
            <InputField
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <SubmitButton type="submit" loading={loading}>
                Reset Password
              </SubmitButton>
            </div>
          </>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthCard>
  );
};
