import React, { useState } from 'react';
import { AuthCard, InputField, Alert, SubmitButton } from './auth.components';
import { request } from './auth.service';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Password reset link sent. Check console logs.');
      setEmail('');
    }
  };

  return (
    <AuthCard title="Forgot Password" subtitle="Request a link to reset your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <InputField
          label="Email Address"
          type="email"
          placeholder="e.g. user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="pt-2">
          <SubmitButton type="submit" loading={loading}>
            Send Reset Link
          </SubmitButton>
        </div>

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
