import React, { useState } from 'react';
import { AuthCard, InputField, Alert, SubmitButton } from './auth.components';
import { request, setAuthToken, UserProfile } from './auth.service';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setUnverified(false);
    setLoading(true);

    const result = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      if (result.unverified) {
        setUnverified(true);
      }
    } else if (result.data) {
      setAuthToken(result.data.token);
      onLoginSuccess(result.data.user);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);

    const result = await request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setResending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setInfo(result.message || 'Verification link resent successfully! Check console logs.');
      setUnverified(false);
    }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Log in to access your dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {info && <Alert type="success" message={info} />}

        <InputField
          label="Email Address"
          type="email"
          placeholder="e.g. user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('/forgot-password')}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
            >
              Forgot?
            </button>
          </div>
          <InputField
            label=""
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {unverified && (
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-300 flex justify-between items-center">
            <span>Resend verification email?</span>
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend Link'}
            </button>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton type="submit" loading={loading}>
            Sign In
          </SubmitButton>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </AuthCard>
  );
};
