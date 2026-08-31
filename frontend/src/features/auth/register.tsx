import React, { useState } from 'react';
import { AuthCard, InputField, Alert, SubmitButton } from './auth.components';
import { request } from './auth.service';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Registration successful! Please check console logs to verify.');
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join Algora AI and start coding">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <InputField
          label="Username"
          type="text"
          placeholder="e.g. coder_dev"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          placeholder="e.g. user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="pt-2">
          <SubmitButton type="submit" loading={loading}>
            Register
          </SubmitButton>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </AuthCard>
  );
};
