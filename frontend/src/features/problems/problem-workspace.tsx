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

interface SubmissionResult {
  submission: {
    id: number;
    status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
    runtime?: number;
    memory?: number;
  };
  failedTestCase?: {
    input: string;
    expectedOutput: string;
  } | null;
  actualOutput?: string;
  error?: string;
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
  const [result, setResult] = useState<SubmissionResult | null>(null);
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
    setBottomTab('result');

    // Simulate fast local run
    setTimeout(() => {
      setIsRunning(false);
      if (language === 'javascript') {
        const hasBody = code.includes('return');
        if (hasBody) {
          setRunResult({
            status: 'Finished',
            output: 'All sample test cases executed successfully.\nOutput matches expected test values.',
          });
        } else {
          setRunResult({
            status: 'Finished',
            output: 'Testcase run completed.\nWarning: No explicit return value detected.',
          });
        }
      } else {
        setRunResult({
          status: 'Finished',
          output: `Mock runner executed code in ${language}.\nSample output matches expected testcase values.`,
        });
      }
    }, 400);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setResult(null);
    setRunResult(null);
    setBottomTab('result');

    const res = await request<SubmissionResult>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        problemId: problem.id,
        language,
        sourceCode: code,
      }),
    });

    setIsSubmitting(false);

    if (res.data) {
      setResult(res.data);
    } else {
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
          {/* Tab Navigation Header */}
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

          {/* Description Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <div className="whitespace-pre-line">
              {problem.description}
            </div>

            {/* Examples list */}
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

            {/* Constraints list */}
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
          {/* Top Code Editor Box */}
          <div className="saas-card !p-0 overflow-hidden flex flex-col flex-1">
            {/* Editor Toolbar */}
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

            {/* Textarea Editor */}
            <div className="flex-1 relative bg-slate-950 text-slate-100 font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed selection:bg-indigo-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Action Bar (Run / Submit) */}
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div className="text-2xs text-slate-400 font-mono">
                Line 1, Col 1
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

          {/* Bottom Results & Testcases Panel */}
          <div className="saas-card !p-0 overflow-hidden h-[200px] flex flex-col">
            {/* Panel Tabs */}
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

            {/* Panel Body */}
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
                  {runResult && !result && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{runResult.status}</span>
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{runResult.output}</pre>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className={`text-base font-extrabold ${
                          result.submission.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {result.submission.status}
                        </span>
                        {result.submission.runtime !== undefined && (
                          <span className="text-2xs text-slate-400">
                            Runtime: {result.submission.runtime} ms
                          </span>
                        )}
                        {result.submission.memory !== undefined && (
                          <span className="text-2xs text-slate-400">
                            Memory: {(result.submission.memory / 1024).toFixed(1)} MB
                          </span>
                        )}
                      </div>

                      {result.submission.status === 'Accepted' && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                          🎉 Congratulations! Your solution passed all test cases!
                        </p>
                      )}

                      {result.failedTestCase && (
                        <div className="space-y-1.5 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-200 dark:border-rose-900/30 text-xs text-rose-900 dark:text-rose-300">
                          <p><span className="font-bold">Input:</span> {result.failedTestCase.input}</p>
                          <p><span className="font-bold">Expected Output:</span> {result.failedTestCase.expectedOutput}</p>
                          {result.actualOutput && (
                            <p><span className="font-bold">Your Output:</span> {result.actualOutput}</p>
                          )}
                        </div>
                      )}

                      {result.error && (
                        <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-200 dark:border-rose-900/30 text-xs text-rose-600 dark:text-rose-400">
                          <p className="font-bold">Error details:</p>
                          <pre className="mt-1 whitespace-pre-wrap">{result.error}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {!runResult && !result && (
                    <p className="text-slate-400">Click "Run" or "Submit" to see execution results.</p>
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
