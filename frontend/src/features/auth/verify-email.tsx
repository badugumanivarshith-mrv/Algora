import React, { useEffect, useState } from 'react';
import { AuthCard, Alert } from './auth.components';
import { request } from './auth.service';

interface VerifyEmailProps {
  onNavigate: (page: string) => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    const verify = async () => {
      if (!token) {
        setError('Verification token is missing from the URL.');
        setLoading(false);
        return;
      }

      const result = await request('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || 'Email verified successfully!');
      }
    };

    verify();
  }, []);

  return (
    <AuthCard title="Email Verification" subtitle="Processing your verification token">
      <div className="space-y-6 text-center">
        {loading && (
          <div className="flex flex-col items-center py-6 space-y-3">
            <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
            <p className="text-sm text-slate-400">Verifying your token...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <Alert type="error" message={error} />
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
            >
              Back to Login
            </button>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <Alert type="success" message={success} />
            <button
              onClick={() => onNavigate('/login')}
              className="btn-primary w-full"
            >
              Log In Now
            </button>
          </div>
        )}
      </div>
    </AuthCard>
  );
};
