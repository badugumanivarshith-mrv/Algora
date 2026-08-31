import { useEffect, useState } from 'react';
import { getAuthToken, removeAuthToken, request, UserProfile } from './features/auth/auth.service';
import { Login } from './features/auth/login';
import { Register } from './features/auth/register';
import { VerifyEmail } from './features/auth/verify-email';
import { ForgotPassword } from './features/auth/forgot-password';
import { ResetPassword } from './features/auth/reset-password';
import { Profile } from './features/auth/profile';
import { ChangePassword } from './features/auth/change-password';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  db: string;
  error?: string;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Native custom router
  const navigate = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setPath(newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getAuthToken();
      if (token) {
        const result = await request<{ user: UserProfile }>('/api/auth/profile');
        if (result.data) {
          setUser(result.data.user);
        } else {
          removeAuthToken();
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  // Fetch health data
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (err) {
      console.error('Health fetch failed:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    navigate('/login');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
          <p className="text-sm font-semibold tracking-wider">Loading Algora AI...</p>
        </div>
      </div>
    );
  }

  // Route protection
  const isAuthenticated = !!user;
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(path);

  // Render main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-slate-955/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(isAuthenticated ? '/' : '/login')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-xl tracking-wider">A</span>
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
                ALGORA AI
              </h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
                Phase 2 Authenticated
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  Signed in as <strong className="text-slate-200">{user.username}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              !isAuthRoute && (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Sign In
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Unauthenticated View Options */}
        {!isAuthenticated && (
          <div className="w-full flex justify-center">
            {path === '/login' && (
              <Login onNavigate={navigate} onLoginSuccess={(u) => { setUser(u); navigate('/'); }} />
            )}
            {path === '/register' && (
              <Register onNavigate={navigate} />
            )}
            {path === '/verify-email' && (
              <VerifyEmail onNavigate={navigate} />
            )}
            {path === '/forgot-password' && (
              <ForgotPassword onNavigate={navigate} />
            )}
            {path === '/reset-password' && (
              <ResetPassword onNavigate={navigate} />
            )}
            {!isAuthRoute && (
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-black text-white tracking-tight">
                  Welcome to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Algora AI</span>
                </h2>
                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                  A modern coding platform. Sign in to view your learning dashboard and manage your profile.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-350 font-bold rounded-xl text-sm hover:border-slate-700 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Authenticated Dashboard View */}
        {isAuthenticated && (
          <div className="max-w-5xl w-full space-y-8">
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{user.username}</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Manage your credentials, update your email or username, and view database states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile panel */}
              <Profile user={user} onUpdateSuccess={(u) => setUser(u)} onLogout={handleLogout} />

              {/* Password update panel */}
              <ChangePassword onLogout={handleLogout} />
            </div>

            {/* Health checking segment from Phase 1 */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-300 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-450 mr-2"></span>
                  System Health Checks
                </h3>
                <button
                  onClick={fetchHealth}
                  disabled={healthLoading}
                  className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-800"
                >
                  {healthLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Server Status</span>
                  <span className="text-slate-200">{health ? 'Active' : 'Offline'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Database status</span>
                  <span className={`font-semibold ${health?.db === 'connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {health?.db === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Uptime</span>
                  <span className="text-slate-300">{health ? `${health.uptime.toFixed(1)}s` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-6 mt-12 bg-slate-955/20 text-center">
        <p className="text-xs text-slate-500">
          Algora AI © 2026. Phase 2 Authentication System Verified.
        </p>
      </footer>
    </div>
  );
}
