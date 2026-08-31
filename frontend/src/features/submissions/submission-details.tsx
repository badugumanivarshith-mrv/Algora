import React, { useEffect, useState } from 'react';
import { request } from '../auth/auth.service';

interface TestCaseResult {
  id: number;
  testCaseId: number;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded';
  runtime: number;
  memory: number;
  errorMessage: string | null;
  isHidden: boolean;
  input: string;
  expectedOutput: string;
}

interface SubmissionDetail {
  id: number;
  userId: number;
  problemId: number;
  problemTitle: string;
  problemSlug: string;
  language: string;
  sourceCode: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded';
  runtime: number;
  memory: number;
  submittedAt: string;
  results: TestCaseResult[];
}

interface SubmissionDetailsProps {
  id: number;
  onNavigate: (path: string) => void;
}

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ id, onNavigate }) => {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      const res = await request<{ submission: SubmissionDetail }>(`/api/submissions/${id}`);
      if (res.data) {
        setSubmission(res.data.submission);
      } else {
        setError(res.error || 'Failed to load submission');
      }
      setLoading(false);
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading submission details...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="saas-card text-center py-12 space-y-4">
        <p className="text-rose-600 dark:text-rose-400 font-bold">{error || 'Submission not found'}</p>
        <button onClick={() => onNavigate('/submissions')} className="btn-secondary">
          ← Return to Submissions
        </button>
      </div>
    );
  }

  const statusColors = {
    Accepted: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
    'Wrong Answer': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
    'Runtime Error': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
    'Compilation Error': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
    'Time Limit Exceeded': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
    'Memory Limit Exceeded': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30',
    Pending: 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  };

  const passedCasesCount = submission.results.filter((r) => r.status === 'Accepted').length;
  const totalCasesCount = submission.results.length;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('/submissions')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors text-xs font-semibold cursor-pointer"
          >
            ← Submissions
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Submission #{submission.id}
          </h1>
          <button
            onClick={() => onNavigate(`/problems/${submission.problemSlug}`)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
          >
            ({submission.problemTitle})
          </button>
        </div>

        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${statusColors[submission.status]}`}>
          {submission.status}
        </span>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="saas-card text-center py-4">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{submission.status}</p>
        </div>
        <div className="saas-card text-center py-4">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Language</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white capitalize">{submission.language}</p>
        </div>
        <div className="saas-card text-center py-4">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Runtime</p>
          <p className="mt-1 text-sm font-mono font-extrabold text-slate-900 dark:text-white">{submission.runtime} ms</p>
        </div>
        <div className="saas-card text-center py-4">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Passed Cases</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
            {passedCasesCount} / {totalCasesCount}
          </p>
        </div>
      </div>

      {/* Submitted Code Block */}
      <div className="saas-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Submitted Code</h2>
          <span className="text-xs text-slate-400">{new Date(submission.submittedAt).toLocaleString()}</span>
        </div>
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{submission.sourceCode}</pre>
        </div>
      </div>

      {/* Test Cases Results Breakdown */}
      <div className="saas-card space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Test Case Execution Breakdown</h2>
        {submission.results.length === 0 ? (
          <p className="text-xs text-slate-400">No test case details available.</p>
        ) : (
          <div className="space-y-3">
            {submission.results.map((res, idx) => (
              <div
                key={res.id}
                className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Test Case #{idx + 1}</span>
                    {res.isHidden && (
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded text-2xs font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border ${statusColors[res.status]}`}>
                    {res.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs text-slate-500 font-sans">
                  <p>Runtime: <span className="font-mono text-slate-800 dark:text-slate-200">{res.runtime} ms</span></p>
                  <p>Memory: <span className="font-mono text-slate-800 dark:text-slate-200">{(res.memory / 1024).toFixed(1)} MB</span></p>
                </div>

                {!res.isHidden && (
                  <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <p><span className="text-slate-500 font-sans">Input: </span><span className="text-slate-900 dark:text-slate-100">{res.input}</span></p>
                    <p><span className="text-slate-500 font-sans">Expected Output: </span><span className="text-slate-900 dark:text-slate-100">{res.expectedOutput}</span></p>
                  </div>
                )}

                {res.errorMessage && (
                  <p className="text-rose-600 dark:text-rose-400 text-2xs font-sans">
                    Error: {res.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
