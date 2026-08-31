import React, { useEffect, useState } from 'react';
import { request } from '../auth/auth.service';

interface SubmissionItem {
  id: number;
  language: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  runtime?: number;
  memory?: number;
  submittedAt: string;
  problem: {
    title: string;
    slug: string;
  };
}

interface SubmissionsListProps {
  onNavigate: (path: string) => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({ onNavigate }) => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      const res = await request<{ submissions: SubmissionItem[] }>('/api/submissions/me');
      if (res.data) {
        setSubmissions(res.data.submissions);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  const statusColors = {
    Accepted: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
    'Wrong Answer': 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
    'Runtime Error': 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
    'Compilation Error': 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
    'Time Limit Exceeded': 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
    Pending: 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Submission History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review your past code submission attempts, performance metrics, and verdicts.
        </p>
      </div>

      <div className="saas-card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-16 space-y-4">
            <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
            <p className="text-sm text-slate-400">Loading your submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm font-semibold">No submissions recorded yet.</p>
            <button onClick={() => onNavigate('/problems')} className="btn-primary">
              Browse Problems →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-sm font-medium">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Runtime</th>
                  <th className="px-6 py-4">Memory</th>
                  <th className="px-6 py-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onNavigate(`/problems/${sub.problem.slug}`)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {sub.problem.title}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[sub.status]}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 capitalize">{sub.language}</td>
                    <td className="px-6 py-4.5 font-mono text-xs">{sub.runtime !== undefined ? `${sub.runtime} ms` : '—'}</td>
                    <td className="px-6 py-4.5 font-mono text-xs">{sub.memory !== undefined ? `${(sub.memory / 1024).toFixed(1)} MB` : '—'}</td>
                    <td className="px-6 py-4.5 text-xs text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
