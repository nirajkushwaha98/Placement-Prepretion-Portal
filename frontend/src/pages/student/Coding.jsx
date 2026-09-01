import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { codingService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MultiLanguageRunner from '../../components/MultiLanguageRunner';
import {
  Code2, Terminal, CheckCircle, Search, Filter,
  ArrowRight, Sparkles, Trophy, Cpu, Play, Layers,
  Flame, Zap, Laptop
} from 'lucide-react';

const Coding = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState(tabParam === 'runner' ? 'runner' : 'problems');

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedStatus]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const res = await codingService.getProblems(params);
      setProblems(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const solvedCount = problems.filter((p) => p.is_solved).length;

  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAIProblem = async () => {
    if (generatingAI) return;
    try {
      setGeneratingAI(true);
      const res = await codingService.generateAIProblem({
        topic: 'Arrays & Dynamic Programming',
        difficulty: 'MEDIUM',
      });
      fetchProblems();
      if (res?.data?.id) {
        navigate(`/coding/${res.data.id}`);
      }
    } catch (err) {
      console.error('Error generating AI problem:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const [selectedTopic, setSelectedTopic] = useState('ALL');

  const DSA_TOPICS = [
    { id: 'ALL', label: 'All Topics', icon: '⚡' },
    { id: 'Sorting', label: 'Sorting', icon: '🔢' },
    { id: 'Linked Lists', label: 'Linked Lists', icon: '🔗' },
    { id: 'Doubly Linked List', label: 'Doubly Linked List', icon: '↔️' },
    { id: 'Stacks and Queues', label: 'Stacks and Queues', icon: '📚' },
    { id: 'Trees', label: 'Trees', icon: '🌳' },
    { id: 'Arrays', label: 'Arrays', icon: '📊' },
    { id: 'Graphs', label: 'Graphs', icon: '🌐' },
    { id: 'Dynamic Programming', label: 'Dynamic Programming', icon: '🧩' },
    { id: 'Recursion', label: 'Recursion & Backtracking', icon: '🔄' },
  ];

  const displayedProblems = problems.filter((p) => {
    if (selectedTopic !== 'ALL') {
      const pTags = (p.tags || []).map((t) => String(t).toUpperCase());
      const pTitle = (p.title || '').toUpperCase();
      const searchKey = selectedTopic.toUpperCase();

      let topicMatch = false;
      if (searchKey === 'DOUBLY LINKED LIST') {
        topicMatch = pTags.some((t) => t.includes('DOUBLY')) || pTitle.includes('DOUBLY') || pTitle.includes('LRU') || pTitle.includes('BROWSER');
      } else if (searchKey === 'LINKED LISTS') {
        topicMatch = pTags.some((t) => t.includes('LINKED LIST')) || pTitle.includes('LINKED LIST');
      } else if (searchKey === 'STACKS AND QUEUES') {
        topicMatch = pTags.some((t) => t.includes('STACK') || t.includes('QUEUE')) || pTitle.includes('STACK') || pTitle.includes('QUEUE');
      } else if (searchKey === 'SORTING') {
        topicMatch = pTags.some((t) => t.includes('SORT')) || pTitle.includes('SORT');
      } else if (searchKey === 'TREES') {
        topicMatch = pTags.some((t) => t.includes('TREE') || t.includes('BST')) || pTitle.includes('TREE');
      } else if (searchKey === 'ARRAYS') {
        topicMatch = pTags.some((t) => t.includes('ARRAY')) || pTitle.includes('ARRAY');
      } else if (searchKey === 'GRAPHS' || searchKey === 'GRAPH') {
        topicMatch =
          pTags.some((t) => t.includes('GRAPH')) ||
          pTitle.includes('GRAPH') ||
          pTitle.includes('ISLAND') ||
          pTitle.includes('ORANGE') ||
          pTitle.includes('LADDER') ||
          pTitle.includes('SURROUNDED') ||
          pTitle.includes('FLOOD') ||
          pTitle.includes('COURSE SCHEDULE');
      } else if (searchKey === 'DYNAMIC PROGRAMMING') {
        topicMatch = pTags.some((t) => t.includes('DYNAMIC') || t.includes('DP')) || pTitle.includes('DYNAMIC') || pTitle.includes('ROBBER') || pTitle.includes('COIN') || pTitle.includes('STAIR');
      } else if (searchKey === 'RECURSION') {
        topicMatch = pTags.some((t) => t.includes('RECURSION') || t.includes('BACKTRACKING') || t.includes('DIVIDE'));
      } else {
        topicMatch = pTags.some((t) => t.includes(searchKey)) || pTitle.includes(searchKey);
      }

      if (!topicMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Code2 className="h-6 w-6 text-blue-400" />
            Coding Practice & DSA Arena
          </h1>
        </div>

        {/* Gemini AI & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateAIProblem}
            disabled={generatingAI}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {generatingAI ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-400" />
            )}
            <span>⚡ Generate Custom Challenge</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div className="text-xs">
              <span className="font-bold text-white text-sm">{solvedCount}</span>
              <span className="text-slate-400"> / {problems.length} Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar (DSA Arena vs Multi-Language Playground) */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveView('problems');
            setSearchParams({});
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeView === 'problems'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>DSA Practice Problems ({problems.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveView('runner');
            setSearchParams({ tab: 'runner' });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeView === 'runner'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Play className="h-4 w-4 fill-current text-emerald-400" />
          <span>⚡ Universal Multi-Language Code Runner</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
            20+ Langs
          </span>
        </button>
      </div>

      {/* RENDER VIEW ACCORDING TO TAB */}
      {activeView === 'runner' ? (
        <MultiLanguageRunner />
      ) : (
        <>
          {/* DSA Topic Filter Tabs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              DSA Data Structure & Topic Tracks
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {DSA_TOPICS.map((topic) => {
                const isActive = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102 border border-blue-400/30'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by title, algorithm, or data structure..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </form>

            {/* Difficulty filter buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDifficulty === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Difficulties
              </button>
              {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDifficulty === d
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="UNSOLVED">Unsolved</option>
            </select>
          </div>

          {/* Problem Grid */}
          {loading ? (
            <LoadingSpinner text="Fetching coding challenges..." size="lg" />
          ) : displayedProblems.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No coding problems match your filters"
              description="Try modifying your search keywords or resetting topic/difficulty filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedDifficulty('');
                setSelectedStatus('');
                setSelectedTopic('ALL');
                setSearch('');
              }}
            />
          ) : (
            <div className="space-y-3">
              {displayedProblems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => navigate(`/coding/${problem.id}`)}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/40 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={problem.difficulty} size="xs">
                        {problem.difficulty}
                      </Badge>
                      {problem.is_solved && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle className="h-3.5 w-3.5" /> Solved
                        </span>
                      )}
                      <span className="text-xs text-slate-400">• {problem.points || 50} pts</span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {problem.title}
                    </h3>

                    {/* Tags */}
                    {problem.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {problem.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-medium text-slate-300 border border-slate-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coding/${problem.id}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>{problem.is_solved ? 'Practice Again' : 'Solve Problem'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Coding;
