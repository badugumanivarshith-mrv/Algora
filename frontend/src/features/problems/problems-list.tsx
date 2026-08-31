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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptanceRate: number;
  totalSubmissions: number;
  tags: Tag[];
}

interface ProblemsListProps {
  onNavigate: (path: string) => void;
}

export const ProblemsList: React.FC<ProblemsListProps> = ({ onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Fetch problems and tags
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (selectedTag !== 'All') params.append('tag', selectedTag);

      const pRes = await request<{ problems: Problem[] }>(`/api/problems?${params.toString()}`);
      if (pRes.data) {
        setProblems(pRes.data.problems);
      }

      const tRes = await request<{ tags: Tag[] }>('/api/tags');
      if (tRes.data) {
        setTags(tRes.data.tags);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchData, 200); // debounce input
    return () => clearTimeout(timer);
  }, [search, selectedDifficulty, selectedTag]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Coding Problems</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Expand your knowledge by solving standard algorithms problems with instant sandbox execution.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Search problems by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Difficulty Selector */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="form-input"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Tag Selector */}
        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="form-input"
          >
            <option value="All">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="saas-card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-16 space-y-4">
            <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
            <p className="text-sm text-slate-400">Loading problems list...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold">No coding problems found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-sm font-medium">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Acceptance Rate</th>
                  <th className="px-6 py-4">Submissions</th>
                  <th className="px-6 py-4">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {problems.map((p) => {
                  const diffColors = {
                    Easy: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/20',
                    Medium: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-900/20',
                    Hard: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/20',
                  };

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onNavigate(`/problems/${p.slug}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {p.title}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${diffColors[p.difficulty]}`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">{p.acceptanceRate}%</td>
                      <td className="px-6 py-4.5">{p.totalSubmissions}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-md"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
