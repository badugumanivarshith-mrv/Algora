import { useEffect, useState } from 'react';
import { getAuthToken, removeAuthToken, request, UserProfile } from './features/auth/auth.service';
import { Login } from './features/auth/login';
import { Register } from './features/auth/register';
import { VerifyEmail } from './features/auth/verify-email';
import { ForgotPassword } from './features/auth/forgot-password';
import { ResetPassword } from './features/auth/reset-password';
import { ThemeProvider } from './features/theme/theme.context';
import { MainLayout } from './components/layout/main-layout';
import { DashboardHome } from './features/dashboard/dashboard-home';
import { ProfileDashboard } from './features/profile/profile-dashboard';
import { AccountSettings } from './features/profile/account-settings';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

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

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    navigate('/login');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-slate-400 font-sans transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
          <p className="text-sm font-semibold tracking-wider text-slate-505 dark:text-slate-400">Loading Algora AI...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(path);

  // Redirect Logic for Protected vs Unprotected Routing
  if (!isAuthenticated && !isAuthRoute) {
    navigate('/login');
    return null;
  }

  if (isAuthenticated && isAuthRoute) {
    navigate('/dashboard');
    return null;
  }

  // 1. Unauthenticated View Pages Layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-6 py-12 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <div className="w-full flex justify-center">
          {path === '/login' && (
            <Login onNavigate={navigate} onLoginSuccess={(u) => { setUser(u); navigate('/dashboard'); }} />
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
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard Layout Shell
  return (
    <MainLayout user={user} currentPath={path} onNavigate={navigate} onLogout={handleLogout}>
      {(path === '/' || path === '/dashboard') && (
        <DashboardHome user={user} onNavigate={navigate} />
      )}

      {path === '/profile' && (
        <ProfileDashboard user={user} onUpdateSuccess={(u) => setUser(u)} />
      )}

      {path === '/settings' && (
        <AccountSettings user={user} />
      )}
    </MainLayout>
  );
}
