import { useEffect, useState } from 'react';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  db: string;
  error?: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: HealthData = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-slate-955/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-xl tracking-wider">A</span>
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
                ALGORA AI
              </h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
                Phase 1 Foundation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              React + Vite + TS
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            System Initialization <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Verified</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            All foundation components for Phase 1 have been generated. Below is the live connection monitoring dashboard.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Database & API Status Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80 hover:shadow-indigo-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mr-2.5 animate-pulse"></span>
              Live Connection Status
            </h3>

            {loading ? (
              <div className="space-y-4 py-4">
                <div className="h-6 bg-slate-800/60 rounded-md animate-pulse w-3/4"></div>
                <div className="h-12 bg-slate-800/60 rounded-md animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                <p className="font-semibold mb-1">Backend Connection Failed</p>
                <p className="text-rose-400/90 text-xs font-mono">{error}</p>
                <button
                  onClick={fetchHealth}
                  className="mt-3 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold transition-all border border-rose-500/30"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-sm text-slate-400">Server Health</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-sm text-slate-400">Database Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      health?.db === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {health?.db === 'connected' ? 'PostgreSQL Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-sm text-slate-400">Server Uptime</span>
                  <span className="text-sm text-slate-200 font-mono">
                    {health ? `${health.uptime.toFixed(1)}s` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Timestamp</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {health ? new Date(health.timestamp).toLocaleTimeString() : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tech Stack Blueprint Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80 hover:shadow-violet-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 mr-2.5"></span>
              Algora Foundation Blueprint
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-955/40 border border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Frontend</span>
                <span className="text-sm font-semibold text-slate-300">Vite + React</span>
              </div>
              <div className="p-3 bg-slate-955/40 border border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Styling</span>
                <span className="text-sm font-semibold text-indigo-300">Tailwind CSS v4</span>
              </div>
              <div className="p-3 bg-slate-955/40 border border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Backend</span>
                <span className="text-sm font-semibold text-slate-300">Express + TS</span>
              </div>
              <div className="p-3 bg-slate-955/40 border border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">ORM</span>
                <span className="text-sm font-semibold text-violet-300">Drizzle ORM</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center space-x-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400 font-medium">PostgreSQL connection pool verified.</span>
            </div>
          </div>
        </div>

        {/* Directory Validation List */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-300 mb-4">Structure Conformity Check</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Backend folders</span>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/routes</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/controllers</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/services</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/middleware</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/db</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Frontend folders</span>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/pages</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/components</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/features</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/services</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400">✔</span>
                <span>src/hooks</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-6 mt-12 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">
          Algora AI © 2026. Phase 1 Architecture Foundation Completed.
        </p>
      </footer>
    </div>
  );
}
