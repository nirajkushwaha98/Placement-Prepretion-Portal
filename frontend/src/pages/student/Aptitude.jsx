import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aptitudeService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Calculator, Brain, BookOpen, BarChart3, Clock,
  CheckCircle2, Play, Sparkles, Filter, ChevronRight,
  History, Building2, Search, Target, Award, Layers
} from 'lucide-react';

const iconMap = {
  Calculator: Calculator,
  Brain: Brain,
  BookOpen: BookOpen,
  BarChart3: BarChart3,
};

const COMPANIES = [
  { id: 'ALL', name: 'All Companies' },
  { id: 'TCS', name: 'TCS NQT', icon: '🏢' },
  { id: 'INFOSYS', name: 'Infosys', icon: '🏢' },
  { id: 'WIPRO', name: 'Wipro NLTH', icon: '🏢' },
  { id: 'ACCENTURE', name: 'Accenture', icon: '🏢' },
  { id: 'COGNIZANT', name: 'Cognizant', icon: '🏢' },
  { id: 'AMAZON', name: 'Amazon OA', icon: '🏢' },
  { id: 'CAPGEMINI', name: 'Capgemini', icon: '🏢' },
  { id: 'DELOITTE', name: 'Deloitte', icon: '🏢' },
  { id: 'GOOGLE', name: 'Google', icon: '🏢' },
  { id: 'MICROSOFT', name: 'Microsoft', icon: '🏢' },
];

const getCompanyTag = (title = '', description = '') => {
  const text = `${title} ${description}`.toUpperCase();
  if (text.includes('TCS')) {
    return { name: 'TCS NQT', color: 'from-blue-600 to-cyan-600', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  }
  if (text.includes('INFOSYS')) {
    return { name: 'Infosys', color: 'from-blue-700 to-indigo-600', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  }
  if (text.includes('ACCENTURE')) {
    return { name: 'Accenture', color: 'from-purple-600 to-pink-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  }
  if (text.includes('WIPRO')) {
    return { name: 'Wipro Elite', color: 'from-emerald-600 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
  if (text.includes('COGNIZANT')) {
    return { name: 'Cognizant GenC', color: 'from-sky-600 to-blue-600', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
  }
  if (text.includes('AMAZON')) {
    return { name: 'Amazon OA', color: 'from-amber-600 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  }
  if (text.includes('CAPGEMINI')) {
    return { name: 'Capgemini', color: 'from-blue-500 to-blue-700', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  }
  if (text.includes('DELOITTE')) {
    return { name: 'Deloitte', color: 'from-emerald-700 to-green-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
  if (text.includes('GOOGLE')) {
    return { name: 'Google', color: 'from-red-600 via-amber-500 to-green-500', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  }
  if (text.includes('MICROSOFT')) {
    return { name: 'Microsoft', color: 'from-blue-600 to-indigo-700', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  }
  return { name: 'Corporate MNC', color: 'from-slate-600 to-slate-700', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
};

const Aptitude = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom practice generator state
  const [genCategory, setGenCategory] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('MEDIUM');
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, testRes, histRes] = await Promise.all([
        aptitudeService.getCategories(),
        aptitudeService.getTests(),
        aptitudeService.getHistory(),
      ]);
      const catList = Array.isArray(catRes?.data)
        ? catRes.data
        : (catRes?.data?.results || []);
      const testList = Array.isArray(testRes?.data)
        ? testRes.data
        : (testRes?.data?.results || []);
      const histList = Array.isArray(histRes?.data)
        ? histRes.data
        : (histRes?.data?.results || []);

      setCategories(catList);
      setTests(testList);
      setHistory(histList);
    } catch (err) {
      console.error('Error loading aptitude data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStandardTest = (testId) => {
    try {
      sessionStorage.removeItem('active_practice_test');
    } catch {
      // ignore
    }
    navigate(`/aptitude/test/${testId}`);
  };

  const handleGeneratePractice = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await aptitudeService.generatePractice({
        category_id: genCategory || null,
        difficulty: genDifficulty,
        count: genCount,
      });
      // Store dynamic test in sessionStorage for runner
      sessionStorage.setItem('active_practice_test', JSON.stringify(res.data));
      navigate('/aptitude/test/custom');
    } catch (err) {
      console.error('Error generating practice test:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Filter tests by Company, Category, Difficulty, Search
  const filteredTests = tests.filter((test) => {
    const fullText = `${test.title} ${test.description} ${test.category_name || ''}`.toUpperCase();

    // Company filter
    if (selectedCompany !== 'ALL') {
      if (!fullText.includes(selectedCompany)) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'ALL') {
      const matchCat = (test.category_name || '').toUpperCase().includes(selectedCategoryFilter.toUpperCase()) ||
        String(test.category || '').toUpperCase().includes(selectedCategoryFilter.toUpperCase());
      if (!matchCat) return false;
    }

    // Difficulty filter
    if (selectedDifficultyFilter !== 'ALL') {
      if (test.difficulty !== selectedDifficultyFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase();
      if (!fullText.includes(q)) return false;
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading company placement test series..." size="lg" />;
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
              Company-Wise Mock Test Series
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="h-7 w-7 text-blue-400" />
            Company-Specific Aptitude & Placement Tests
          </h1>
        </div>
      </div>

      {/* Company Selector Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-blue-400" />
            Target Hiring Company
          </h3>
          <span className="text-[11px] text-slate-400">
            {filteredTests.length} tests matching
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {COMPANIES.map((comp) => {
            const isActive = selectedCompany === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedCompany(comp.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-102 border border-blue-400/30'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
              >
                {comp.icon && <span>{comp.icon}</span>}
                <span>{comp.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Category Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Topic Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Calculator;
            const isFilterActive = selectedCategoryFilter === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (selectedCategoryFilter === cat.name) {
                    setSelectedCategoryFilter('ALL');
                  } else {
                    setSelectedCategoryFilter(cat.name);
                  }
                  setGenCategory(cat.id);
                }}
                className={`rounded-xl border p-5 transition-all duration-200 cursor-pointer shadow-lg group ${isFilterActive
                    ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-blue-500/50 hover:bg-slate-800/50'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors flex items-center gap-1">
                    <span>Practice Drill</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test by company name (e.g. TCS, Infosys, Amazon) or topic..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDifficultyFilter}
            onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {(selectedCompany !== 'ALL' || selectedCategoryFilter !== 'ALL' || selectedDifficultyFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCompany('ALL');
                setSelectedCategoryFilter('ALL');
                setSelectedDifficultyFilter('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Standard Mock Tests & Dynamic Practice Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company & Standard Placement Mock Tests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Company Test Lineup
            </h3>
            <span className="text-xs text-slate-400">{filteredTests.length} tests ready</span>
          </div>

          {filteredTests.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Tests Found"
              description="No tests match your current filter. Try selecting 'All Companies' or resetting filters."
              actionLabel="View All Tests"
              onAction={() => {
                setSelectedCompany('ALL');
                setSelectedCategoryFilter('ALL');
                setSelectedDifficultyFilter('ALL');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredTests.map((test) => {
                const compTag = getCompanyTag(test.title, test.description);
                return (
                  <div
                    key={test.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/40 hover:bg-slate-800/40 transition-all duration-200 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Company Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${compTag.badge}`}>
                          <Building2 className="h-3 w-3" />
                          <span>{compTag.name}</span>
                        </span>

                        <Badge variant={test.difficulty} size="xs">
                          {test.difficulty}
                        </Badge>

                        <span className="text-xs font-semibold text-slate-400">
                          {test.category_name || 'All Categories Combined'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {test.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {test.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          {test.duration_minutes} Mins
                        </span>
                        <span>•</span>
                        <span>{test.total_questions} Questions</span>
                        <span>•</span>
                        <span>Passing: {test.passing_percentage}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartStandardTest(test.id)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 group-hover:shadow-blue-500/40"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>Start Test</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Practice Test Generator */}
        <div
          id="practice-generator"
          className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 p-6 shadow-xl space-y-4 h-fit"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Custom Practice Drill</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Interactive Drill
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate an on-demand timed test with tailored questions based on your chosen difficulty and category.
          </p>

          <form onSubmit={handleGeneratePractice} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={genCategory}
                onChange={(e) => setGenCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="">All Categories (Mixed)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setGenDifficulty(diff)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${genDifficulty === diff
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Questions
              </label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value={5}>5 Questions (7 Mins)</option>
                <option value={10}>10 Questions (15 Mins)</option>
                <option value={15}>15 Questions (20 Mins)</option>
                <option value={20}>20 Questions (25 Mins)</option>
                <option value={25}>25 Questions (30 Mins - Standard)</option>
                <option value={30}>30 Questions (40 Mins)</option>
                <option value={40}>40 Questions (50 Mins)</option>
                <option value={50}>50 Questions (60 Mins - Grand Mock)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {generating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Practice Test</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Attempt History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Previous Test Attempts & Evaluation History
          </h3>
          <span className="text-xs text-slate-400">{history.length} records</span>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No Aptitude Attempts Yet"
            description="Take your first practice or diagnostic test to view comprehensive accuracy analytics."
            actionLabel="Start Diagnostic Test"
            onAction={() => tests[0] && handleStartStandardTest(tests[0].id)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Test / Drill</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Accuracy Breakdown</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {att.test_title || 'Custom Practice Test'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {att.category_name || 'Mixed'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {att.score} / {att.total_marks}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={att.percentage >= 60 ? 'success' : 'danger'} size="xs">
                        {att.percentage}%
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="text-emerald-400 font-semibold">{att.correct_count} Correct</span>,{' '}
                      <span className="text-rose-400">{att.incorrect_count} Wrong</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(att.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/aptitude/review/${att.id}`)}
                        className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        Review Answers →
                      </button>
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

export default Aptitude;
