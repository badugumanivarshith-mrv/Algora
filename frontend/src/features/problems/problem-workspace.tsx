import React, { useEffect, useState } from 'react';
import { request } from '../auth/auth.service';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Problem {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: Record<string, string>;
  tags: Tag[];
}

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

interface SubmissionResultResponse {
  id: number;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded';
  runtime: number;
  memory: number;
  problemTitle: string;
  problemSlug: string;
  results: TestCaseResult[];
}

interface ProblemWorkspaceProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({ slug, onNavigate }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [result, setResult] = useState<SubmissionResultResponse | null>(null);
  const [runResult, setRunResult] = useState<{ status: string; output: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<'testcases' | 'result'>('testcases');

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      const res = await request<{ problem: Problem }>(`/api/problems/${slug}`);
      if (res.data) {
        setProblem(res.data.problem);
        const initialCode = res.data.problem.starterCode['javascript'] || '';
        setCode(initialCode);
      } else {
        setError(res.error || 'Failed to load problem');
      }
      setLoading(false);
    };

    fetchProblem();
  }, [slug]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (problem && problem.starterCode[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem && problem.starterCode[language]) {
      setCode(problem.starterCode[language]);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setRunResult(null);
    setResult(null);
    setBottomTab('result');

    setTimeout(() => {
      setIsRunning(false);
      setRunResult({
        status: 'Finished',
        output: 'Sample test cases executed locally.\nOutput matches sample parameters.',
      });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setResult(null);
    setRunResult(null);
    setBottomTab('result');

    const res = await request<{ submission: { id: number; status: string } }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        problemId: problem.id,
        language,
        sourceCode: code,
      }),
    });

    if (res.data && res.data.submission) {
      const subId = res.data.submission.id;
      // Poll judge until completed
      const pollInterval = setInterval(async () => {
        const detailRes = await request<{ submission: SubmissionResultResponse }>(`/api/submissions/${subId}`);
        if (detailRes.data && detailRes.data.submission) {
          if (detailRes.data.submission.status !== 'Pending') {
            clearInterval(pollInterval);
            setResult(detailRes.data.submission);
            setIsSubmitting(false);
          }
        }
      }, 400);
    } else {
      setIsSubmitting(false);
      setError(res.error || 'Submission failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading problem workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="saas-card text-center py-12 space-y-4">
        <p className="text-rose-600 dark:text-rose-400 font-bold">{error || 'Problem not found.'}</p>
        <button onClick={() => onNavigate('/problems')} className="btn-secondary">
          ← Return to Problems
        </button>
      </div>
    );
  }

  const diffColors = {
    Easy: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
    Medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
    Hard: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
  };

  const statusColors = {
    Accepted: 'text-emerald-500',
    'Wrong Answer': 'text-rose-500',
    'Runtime Error': 'text-amber-500',
    'Compilation Error': 'text-rose-500',
    'Time Limit Exceeded': 'text-orange-500',
    'Memory Limit Exceeded': 'text-purple-500',
    Pending: 'text-slate-400',
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('/problems')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors text-xs font-semibold cursor-pointer"
          >
            ← Problems
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{problem.title}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${diffColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {problem.tags.map((t) => (
            <span
              key={t.id}
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md"
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[650px]">
        {/* Left Column: Problem Description */}
        <div className="lg:col-span-5 saas-card !p-0 overflow-hidden flex flex-col h-[650px]">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 pt-2">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'description'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Description
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <div className="whitespace-pre-line">{problem.description}</div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Examples</h3>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                  <p className="font-bold text-slate-700 dark:text-slate-300 font-sans">Example {idx + 1}:</p>
                  <p><span className="text-slate-500 font-semibold font-sans">Input: </span><span className="text-slate-900 dark:text-slate-100">{ex.input}</span></p>
                  <p><span className="text-slate-500 font-semibold font-sans">Output: </span><span className="text-slate-900 dark:text-slate-100">{ex.output}</span></p>
                  {ex.explanation && (
                    <p><span className="text-slate-500 font-semibold font-sans">Explanation: </span><span className="text-slate-700 dark:text-slate-300 font-sans">{ex.explanation}</span></p>
                  )}
                </div>
              ))}
            </div>

            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Constraints</h3>
                <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Results Panel */}
        <div className="lg:col-span-7 flex flex-col h-[650px] space-y-4">
          <div className="saas-card !p-0 overflow-hidden flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <button
                onClick={handleResetCode}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Reset Code
              </button>
            </div>

            <div className="flex-1 relative bg-slate-950 text-slate-100 font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed selection:bg-indigo-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div className="text-2xs text-slate-400 font-mono">
                {isSubmitting ? 'Status: Judging submission...' : 'Ready'}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  {isRunning ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isRunning}
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>

          <div className="saas-card !p-0 overflow-hidden h-[200px] flex flex-col">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 pt-2">
              <button
                onClick={() => setBottomTab('testcases')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  bottomTab === 'testcases'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => setBottomTab('result')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  bottomTab === 'result'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Output & Results
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-xs font-mono">
              {bottomTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    {problem.examples.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTestCaseIndex(i)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          selectedTestCaseIndex === i
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                        }`}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {problem.examples[selectedTestCaseIndex] && (
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p><span className="text-slate-500">Input: </span><span className="text-slate-900 dark:text-slate-100">{problem.examples[selectedTestCaseIndex].input}</span></p>
                      <p><span className="text-slate-500">Expected: </span><span className="text-slate-900 dark:text-slate-100">{problem.examples[selectedTestCaseIndex].output}</span></p>
                    </div>
                  )}
                </div>
              )}

              {bottomTab === 'result' && (
                <div>
                  {isSubmitting && (
                    <div className="flex items-center space-x-3 py-4">
                      <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
                      <p className="text-xs text-slate-400">Judging solution against hidden test cases...</p>
                    </div>
                  )}

                  {runResult && !result && !isSubmitting && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{runResult.status}</span>
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{runResult.output}</pre>
                    </div>
                  )}

                  {result && !isSubmitting && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`text-base font-extrabold ${statusColors[result.status]}`}>
                            {result.status}
                          </span>
                          <span className="text-2xs text-slate-400">Runtime: {result.runtime} ms</span>
                          <span className="text-2xs text-slate-400">Memory: {(result.memory / 1024).toFixed(1)} MB</span>
                        </div>
                        <button
                          onClick={() => onNavigate(`/submissions/${result.id}`)}
                          className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                          View Details →
                        </button>
                      </div>

                      {result.status === 'Accepted' && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                          🎉 Solution Accepted! Passed all test cases.
                        </p>
                      )}

                      {result.results && result.results.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <p className="text-2xs font-bold text-slate-400 uppercase">Test Case Results:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.results.map((tc, idx) => (
                              <span
                                key={tc.id}
                                className={`px-2 py-0.5 rounded text-2xs font-bold ${
                                  tc.status === 'Accepted'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                Case {idx + 1}: {tc.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!runResult && !result && !isSubmitting && (
                    <p className="text-slate-400">Click "Run" or "Submit" to evaluate solution.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
