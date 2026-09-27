import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { codingService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Flame, CheckCircle2, Circle, Code2, Search, Filter,
  ExternalLink, ChevronDown, ChevronUp, Sparkles, Trophy,
  TrendingUp, BookOpen, Tag, Layers, ArrowUpRight, Check,
  Briefcase, Compass, Clock, Zap, Star, ShieldCheck,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';

// Specific curated approach & pattern hints for key placement problems
const DSA_CURATED_PATTERNS = {
  1: { pattern: 'Hash Map Lookup', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(N)', intuition: 'Store visited elements in hash map to find complement target - x in O(1).' },
  2: { pattern: 'Frequency Counting', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Count character frequencies across both strings.' },
  3: { pattern: "Kadane's Algorithm", sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Keep adding elements to current sum. If sum < 0, reset to 0.' },
  4: { pattern: 'Sliding Window', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(min(N, M))', intuition: 'Expand with right pointer; shrink left when duplicate found.' },
  5: { pattern: 'Matching Parentheses Stack', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(N)', intuition: 'Push open brackets; pop and verify match for closing brackets.' },
  6: { pattern: 'Unbounded Knapsack DP', sheet: 'Blind 75', timeComp: 'O(amount * coins)', spaceComp: 'O(amount)', intuition: 'dp[i] = min(dp[i], dp[i - coin] + 1) for each coin denomination.' },
  7: { pattern: 'Two Pointers / Monotonic Stack', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Pointers from both ends track leftMax and rightMax to compute trapped water.' },
  8: { pattern: 'Interval Sorting', sheet: 'Blind 75', timeComp: 'O(N log N)', spaceComp: 'O(N)', intuition: 'Sort intervals by start time; merge if start <= previous end.' },
  9: { pattern: 'Binary Search', sheet: 'Top 100', timeComp: 'O(log N)', spaceComp: 'O(1)', intuition: 'Halve the search interval at each step using mid calculation.' },
  10: { pattern: 'Cyclic Shift via Reversals', sheet: 'Top 100', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Reverse entire array, then reverse first k, then remaining n-k.' },
  11: { pattern: 'Sorted Two Pointers', sheet: 'Blind 75', timeComp: 'O(N^2)', spaceComp: 'O(1)', intuition: 'Sort array; fix one element and two-pointer search for remaining pair.' },
  12: { pattern: 'Greedy Two Pointers', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Start at outer edges; advance the pointer having smaller height.' },
  13: { pattern: 'Prefix Minimum Tracking', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Track lowest price seen so far and calculate profit on every step.' },
  14: { pattern: 'Pointer Reversal', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Maintain prev, curr, next pointers and flip curr.next = prev.' },
  15: { pattern: "Floyd's Tortoise and Hare", sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'Slow pointer moves 1 step, fast moves 2 steps; collision implies cycle.' },
  16: { pattern: 'Two Pointers Merge', sheet: 'Blind 75', timeComp: 'O(N + M)', spaceComp: 'O(1)', intuition: 'Dummy node head; splice smallest current head onto merged list.' },
  17: { pattern: 'Auxiliary Min Stack', sheet: 'Blind 75', timeComp: 'O(1)', spaceComp: 'O(N)', intuition: 'Stack values paired with running minimum.' },
  18: { pattern: 'Monotonic Decreasing Stack', sheet: 'Top 100', timeComp: 'O(N)', spaceComp: 'O(N)', intuition: 'Stack indices of temperatures; pop upon finding warmer day.' },
  19: { pattern: 'Tree Inversion Recursion', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(H)', intuition: 'Swap left and right children recursively for all nodes.' },
  20: { pattern: 'Breadth-First Search (Queue)', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(N)', intuition: 'FIFO queue with level size chunking.' },
  21: { pattern: 'Lowest Common Ancestor DFS', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(H)', intuition: 'If root is p or q or split point, root is LCA.' },
  22: { pattern: 'Connected Components BFS/DFS', sheet: 'Blind 75', timeComp: 'O(R * C)', spaceComp: 'O(R * C)', intuition: 'Increment island count and sink connected land cells via DFS.' },
  23: { pattern: "Topological Sort (Kahn's)", sheet: 'Blind 75', timeComp: 'O(V + E)', spaceComp: 'O(V + E)', intuition: 'In-degree queue traversal; cycles prevent full topological order.' },
  24: { pattern: 'Fibonacci Dynamic Programming', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'dp[i] = dp[i-1] + dp[i-2].' },
  25: { pattern: 'Patience Sorting / Binary Search', sheet: 'Blind 75', timeComp: 'O(N log N)', spaceComp: 'O(N)', intuition: 'Maintain tail values of increasing subsequences with binary search.' },
  26: { pattern: 'Linear DP (Pick vs Skip)', sheet: 'Blind 75', timeComp: 'O(N)', spaceComp: 'O(1)', intuition: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).' },
  27: { pattern: 'Rotated Binary Search', sheet: 'Blind 75', timeComp: 'O(log N)', spaceComp: 'O(1)', intuition: 'Identify sorted half and test if target lies within that range.' },
  28: { pattern: 'Min Heap / QuickSelect', sheet: 'Blind 75', timeComp: 'O(N log K)', spaceComp: 'O(K)', intuition: 'Keep min-heap of size K; top element is K-th largest.' },
  29: { pattern: 'Backtracking Cascading', sheet: 'Top 100', timeComp: 'O(2^N)', spaceComp: 'O(N)', intuition: 'Branch with pick vs skip at each index.' },
  30: { pattern: 'Hash Map + Doubly Linked List', sheet: 'Top 100', timeComp: 'O(1)', spaceComp: 'O(C)', intuition: 'DLL maintains recency order; hash map provides O(1) lookup.' }
};

const COMPANY_POOL = [
  ['Google', 'Amazon', 'Microsoft'],
  ['Amazon', 'Flipkart', 'TCS'],
  ['Microsoft', 'Adobe', 'Infosys'],
  ['Meta', 'Google', 'Uber'],
  ['Amazon', 'Goldman Sachs', 'Morgan Stanley'],
  ['Apple', 'Cisco', 'Cognizant'],
  ['Google', 'Bloomberg', 'Oracle'],
  ['TCS Digital', 'Infosys', 'Wipro']
];

const TOPICS = [
  'All Topics',
  'Arrays & Hashing',
  'Strings & Text',
  'Matrix & 2D Grids',
  'Two Pointers & Sliding Window',
  'Binary Search',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & BST',
  'Graphs & Matrix',
  'Dynamic Programming',
  'Heaps & Sorting',
  'Backtracking & Recursion',
  'Greedy Algorithms',
  'Bit Manipulation'
];

// Helper to determine placement category from problem tags & title
const mapProblemToCategory = (prob) => {
  const tags = (prob.tags || []).map((t) => String(t).toLowerCase());
  const title = (prob.title || '').toLowerCase();

  if (tags.some((t) => t.includes('tree') || t.includes('bst')) || title.includes('tree') || title.includes('bst')) return 'Trees & BST';
  if (tags.some((t) => t.includes('graph') || t.includes('topological') || t.includes('dijkstra') || t.includes('bipartite') || t.includes('shortest path')) || title.includes('graph') || title.includes('island') || title.includes('network')) return 'Graphs & Matrix';
  if (tags.some((t) => t.includes('dynamic') || t.includes('dp') || t.includes('knapsack') || t.includes('memoization')) || title.includes('dynamic') || title.includes('subsequence') || title.includes('knapsack')) return 'Dynamic Programming';
  if (tags.some((t) => t.includes('linked') || t.includes('doubly') || t.includes('node')) || title.includes('linked list')) return 'Linked Lists';
  if (tags.some((t) => t.includes('stack') || t.includes('queue') || t.includes('monotonic')) || title.includes('stack') || title.includes('queue')) return 'Stacks & Queues';
  if (tags.some((t) => t.includes('binary search')) || title.includes('binary search') || title.includes('peak element')) return 'Binary Search';
  if (tags.some((t) => t.includes('matrix')) || title.includes('matrix') || title.includes('grid')) return 'Matrix & 2D Grids';
  if (tags.some((t) => t.includes('sliding window') || t.includes('two pointers')) || title.includes('sliding window') || title.includes('two pointer')) return 'Two Pointers & Sliding Window';
  if (tags.some((t) => t.includes('string') || t.includes('trie')) || title.includes('string') || title.includes('palindrome') || title.includes('anagram')) return 'Strings & Text';
  if (tags.some((t) => t.includes('heap') || t.includes('sort') || t.includes('priority')) || title.includes('heap') || title.includes('sort') || title.includes('kth')) return 'Heaps & Sorting';
  if (tags.some((t) => t.includes('backtracking') || t.includes('recursion')) || title.includes('n-queens') || title.includes('sudoku') || title.includes('subset') || title.includes('combination') || title.includes('permutation')) return 'Backtracking & Recursion';
  if (tags.some((t) => t.includes('greedy')) || title.includes('greedy') || title.includes('jump game') || title.includes('gas station')) return 'Greedy Algorithms';
  if (tags.some((t) => t.includes('bit') || t.includes('math')) || title.includes('bit') || title.includes('xor') || title.includes('power of')) return 'Bit Manipulation';
  return 'Arrays & Hashing';
};

const DSASheet = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedSheet, setSelectedSheet] = useState('ALL'); // 'ALL', 'Blind 75'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'SOLVED', 'UNSOLVED'
  const [expandedProblemId, setExpandedProblemId] = useState(null);

  // Pagination state (defaults to displaying 25 questions)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // exactly 25 questions shown

  // Local revision / completed overrides
  const [localSolvedMap, setLocalSolvedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('placement_dsa_solved_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchProblems();

    const handleSyncSolved = (e) => {
      const pId = e.detail?.problemId;
      if (pId) {
        setLocalSolvedMap((prev) => ({ ...prev, [pId]: true }));
      } else {
        try {
          const saved = localStorage.getItem('placement_dsa_solved_map');
          setLocalSolvedMap(saved ? JSON.parse(saved) : {});
        } catch {}
      }
    };

    window.addEventListener('dsa_problem_solved', handleSyncSolved);
    window.addEventListener('storage', handleSyncSolved);
    return () => {
      window.removeEventListener('dsa_problem_solved', handleSyncSolved);
      window.removeEventListener('storage', handleSyncSolved);
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedSheet, statusFilter, pageSize]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // Fetch 100 problems
      const res = await codingService.getProblems({ page_size: 150 });
      const rawProblems = (res.data.results || res.data || []).slice();
      // Ensure sorted strictly by ID 1 to 100 so numbering is always sequential
      rawProblems.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
      // Keep strictly 100 problems
      setProblems(rawProblems.slice(0, 100));
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle problem revision status
  const handleToggleSolved = (probId, e) => {
    e.stopPropagation();
    setLocalSolvedMap((prev) => {
      const updated = { ...prev, [probId]: !prev[probId] };
      try {
        localStorage.setItem('placement_dsa_solved_map', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save dsa solved map', err);
      }
      return updated;
    });
  };

  // Enrich 100 problems with curated placement metadata
  const enrichedProblems = useMemo(() => {
    return problems.map((prob, index) => {
      const id = prob.id || index + 1;
      const specificMeta = DSA_CURATED_PATTERNS[id];

      const topic = mapProblemToCategory(prob);
      const companyIndex = (id + (prob.difficulty === 'HARD' ? 3 : 0)) % COMPANY_POOL.length;
      const companies = COMPANY_POOL[companyIndex];

      const sheet = specificMeta?.sheet || (id <= 75 ? 'Blind 75' : 'Top 100');
      const pattern = specificMeta?.pattern || (prob.tags?.[0] || 'Problem Solving');
      const timeComp = specificMeta?.timeComp || (prob.difficulty === 'HARD' ? 'O(N log N)' : 'O(N)');
      const spaceComp = specificMeta?.spaceComp || (prob.difficulty === 'EASY' ? 'O(1)' : 'O(N)');
      const intuition = specificMeta?.intuition || prob.description?.split('\n')[0] || 'Analyze constraints and apply optimal data structures.';

      const isSolved = prob.is_solved || Boolean(localSolvedMap[id]);

      return {
        ...prob,
        topic,
        companies,
        sheet,
        pattern,
        timeComp,
        spaceComp,
        intuition,
        isSolved
      };
    });
  }, [problems, localSolvedMap]);

  // Filtered problem list
  const filteredProblems = useMemo(() => {
    return enrichedProblems.filter((prob) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prob.title.toLowerCase().includes(q);
        const matchPattern = prob.pattern.toLowerCase().includes(q);
        const matchCompany = prob.companies.some((c) => c.toLowerCase().includes(q));
        const matchTopic = prob.topic.toLowerCase().includes(q);
        if (!matchTitle && !matchPattern && !matchCompany && !matchTopic) return false;
      }

      // Topic filter
      if (selectedTopic !== 'All Topics') {
        if (prob.topic !== selectedTopic) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'ALL') {
        if (prob.difficulty.toUpperCase() !== selectedDifficulty.toUpperCase()) return false;
      }

      // Sheet filter
      if (selectedSheet !== 'ALL') {
        if (selectedSheet === 'Top 25' && prob.id > 25) return false;
        if (selectedSheet === 'Blind 75' && prob.sheet !== 'Blind 75') return false;
      }

      // Status filter
      if (statusFilter === 'SOLVED' && !prob.isSolved) return false;
      if (statusFilter === 'UNSOLVED' && prob.isSolved) return false;

      return true;
    });
  }, [enrichedProblems, searchQuery, selectedTopic, selectedDifficulty, selectedSheet, statusFilter]);

  // Pagination calculations
  const totalItems = filteredProblems.length;
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    if (pageSize === 0) return filteredProblems;
    const start = (validCurrentPage - 1) * effectivePageSize;
    return filteredProblems.slice(start, start + effectivePageSize);
  }, [filteredProblems, validCurrentPage, effectivePageSize, pageSize]);

  // Overall Statistics across 100 questions
  const totalCount = enrichedProblems.length;
  const solvedCount = enrichedProblems.filter((p) => p.isSolved).length;
  const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const easySolved = enrichedProblems.filter((p) => p.isSolved && p.difficulty === 'EASY').length;
  const easyTotal = enrichedProblems.filter((p) => p.difficulty === 'EASY').length;

  const medSolved = enrichedProblems.filter((p) => p.isSolved && p.difficulty === 'MEDIUM').length;
  const medTotal = enrichedProblems.filter((p) => p.difficulty === 'MEDIUM').length;

  const hardSolved = enrichedProblems.filter((p) => p.isSolved && p.difficulty === 'HARD').length;
  const hardTotal = enrichedProblems.filter((p) => p.difficulty === 'HARD').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              <span>Campus Placement Top 100 DSA Sheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Top 100 Most Important DSA Questions
            </h1>
          </div>

          {/* Quick Progress Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shrink-0 min-w-[280px] sm:min-w-[320px] shadow-lg backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                Sheet Progress
              </span>
              <span className="text-sm font-black text-white">
                {solvedCount} / {totalCount} <span className="text-xs text-slate-400 font-normal">({percentage}%)</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Difficulty breakdown chips */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2 text-center">
                <span className="block text-[10px] font-bold text-emerald-400 uppercase">Easy</span>
                <span className="text-xs font-bold text-slate-200">{easySolved}/{easyTotal}</span>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2 text-center">
                <span className="block text-[10px] font-bold text-amber-400 uppercase">Medium</span>
                <span className="text-xs font-bold text-slate-200">{medSolved}/{medTotal}</span>
              </div>
              <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-2 text-center">
                <span className="block text-[10px] font-bold text-rose-400 uppercase">Hard</span>
                <span className="text-xs font-bold text-slate-200">{hardSolved}/{hardTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Top 100 by name, company, or pattern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sheet Preset */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
              <button
                onClick={() => setSelectedSheet('Top 25')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedSheet === 'Top 25'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Flame className="h-3 w-3 fill-current" />
                Top 25
              </button>
              <button
                onClick={() => setSelectedSheet('Blind 75')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedSheet === 'Blind 75'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <Star className="h-3 w-3 fill-current" />
                Blind 75
              </button>
              <button
                onClick={() => setSelectedSheet('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedSheet === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All 100
              </button>
            </div>

            {/* Difficulty selector */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy ({easyTotal})</option>
              <option value="MEDIUM">Medium ({medTotal})</option>
              <option value="HARD">Hard ({hardTotal})</option>
            </select>

            {/* Status selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="UNSOLVED">Unsolved</option>
            </select>

            {/* Page Size selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value={25}>Show 25 questions</option>
              <option value={50}>Show 50 questions</option>
              <option value={100}>Show All 100</option>
            </select>
          </div>
        </div>

        {/* Topic Pill Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Count & Pagination Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <span>
          Showing{' '}
          <strong className="text-white">
            {totalItems === 0 ? 0 : (validCurrentPage - 1) * effectivePageSize + 1}
          </strong>{' '}
          -{' '}
          <strong className="text-white">
            {Math.min(validCurrentPage * effectivePageSize, totalItems)}
          </strong>{' '}
          of <strong className="text-slate-200">{totalItems}</strong> matching questions (Total: <strong className="text-blue-400">{totalCount}</strong>)
        </span>

        {/* Pagination buttons */}
        {totalPages > 1 && pageSize > 0 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white">
              Page {validCurrentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Loading Top 100 Placement DSA Questions..." size="lg" />
        </div>
      ) : paginatedProblems.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-3">
          <Compass className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching DSA questions</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, topic pill, or difficulty filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopic('All Topics');
              setSelectedDifficulty('ALL');
              setSelectedSheet('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedProblems.map((prob) => {
            const isExpanded = expandedProblemId === prob.id;

            return (
              <div
                key={prob.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  prob.isSolved
                    ? 'border-emerald-500/25 bg-slate-900/60'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:shadow-lg'
                }`}
              >
                {/* Main Problem Header Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox + Number + Title & Tags */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSolved(prob.id, e)}
                      title={prob.isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                      className="mt-0.5 sm:mt-0 p-1 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      {prob.isSolved ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    {/* Problem Index Number */}
                    <span className="flex items-center justify-center text-xs font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/70 rounded-lg px-2 py-1 min-w-[38px] shrink-0 text-center shadow-sm">
                      #{prob.id}
                    </span>

                    {/* Title and Metadata */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          onClick={() => navigate(`/coding/${prob.id}`)}
                          className="text-sm font-bold text-white hover:text-blue-400 transition-colors cursor-pointer truncate max-w-xs sm:max-w-md"
                        >
                          {prob.title}
                        </span>

                        <Badge variant={prob.difficulty} size="xs">
                          {prob.difficulty}
                        </Badge>

                        {prob.sheet === 'Blind 75' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            Blind 75
                          </span>
                        )}
                      </div>

                      {/* Pattern & Companies Bar */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded text-[11px] border border-blue-500/20">
                          <Zap className="h-3 w-3 text-blue-400" />
                          {prob.pattern}
                        </span>

                        <span className="text-slate-600">•</span>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {prob.topic}
                        </span>

                        <span className="text-slate-600">•</span>

                        {/* Company badges */}
                        <div className="flex items-center gap-1 overflow-hidden">
                          {prob.companies.slice(0, 3).map((comp) => (
                            <span
                              key={comp}
                              className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60"
                            >
                              {comp}
                            </span>
                          ))}
                          {prob.companies.length > 3 && (
                            <span className="text-[10px] text-slate-500">
                              +{prob.companies.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Quick Intuition Toggle + Solve Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Expand Intuition / Complexity button */}
                    <button
                      type="button"
                      onClick={() => setExpandedProblemId(isExpanded ? null : prob.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>{isExpanded ? 'Hide Hint' : 'Approach'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Solve in IDE button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/coding/${prob.id}`)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Solve</span>
                      <ArrowUpRight className="h-3 w-3 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* Expanded Approach / Complexity Drawer */}
                {isExpanded && (
                  <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3 animate-fade-in text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Optimal Time & Space */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-400" />
                          Optimal Complexities
                        </span>
                        <div className="flex items-center gap-3 pt-0.5">
                          <span className="text-white font-mono font-bold">
                            Time: <span className="text-blue-400">{prob.timeComp}</span>
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-white font-mono font-bold">
                            Space: <span className="text-emerald-400">{prob.spaceComp}</span>
                          </span>
                        </div>
                      </div>

                      {/* Frequent Companies */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-amber-400" />
                          Frequently Asked At
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {prob.companies.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Placement Relevance */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-purple-400" />
                          Sheet Classification
                        </span>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-purple-300 font-bold">
                            {prob.sheet}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">
                            {prob.points || 100} Points
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Intuition / Pattern summary */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Key Intuition & Recommended Pattern: {prob.pattern}
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">
                        {prob.intuition}
                      </p>
                    </div>

                    {/* Action CTA inside drawer */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => navigate(`/coding/${prob.id}`)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Code2 className="h-4 w-4" />
                        <span>Open & Solve in Monaco IDE</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination */}
      {totalPages > 1 && pageSize > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{validCurrentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={validCurrentPage === 1}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={validCurrentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSASheet;
