import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../api/services';
import ReadinessGauge from '../../components/ReadinessGauge';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  LineChart as LineChartIcon, BarChart2, Activity,
  CheckCircle, AlertTriangle, Calculator, Code2,
  FileText, MessageSquare, History, TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const Progress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHistoryTab, setActiveHistoryTab] = useState('aptitude'); // 'aptitude', 'coding', 'resume', 'interview'

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getProgress();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling historical progress analytics..." size="lg" />;
  }

  const { score_data = {}, charts = {}, weak_areas = [], strong_areas = [], history = {} } = data || {};

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <LineChartIcon className="h-6 w-6 text-blue-400" />
          Progress Tracking & Historical Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor your continuous learning trajectory, competency balance, and test performance history over time.
        </p>
      </div>

      {/* Top Section: Readiness Gauge + Category Performance Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Current Readiness Rating
          </h3>
          <ReadinessGauge
            score={score_data.readiness_score || 0}
            tier={score_data.tier || 'Beginner'}
            moduleScores={score_data.module_scores || {}}
          />
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800">
            Based on {score_data.stats?.tests_attempted || 0} tests & {score_data.stats?.problems_solved || 0} solved problems
          </div>
        </div>

        {/* Category Accuracy Bar Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              Category Accuracy Breakdown (%)
            </h3>
            <span className="text-xs text-slate-400">Score per module</span>
          </div>

          <div className="h-64 w-full">
            {charts.category_bar_data && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.category_bar_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Score %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Track Historical Logs Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Historical Logs by Module
          </h3>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {[
              { key: 'aptitude', label: 'Aptitude Tests', icon: Calculator },
              { key: 'coding', label: 'Coding Submissions', icon: Code2 },
              { key: 'resume', label: 'Resumes', icon: FileText },
              { key: 'interview', label: 'Interviews', icon: MessageSquare },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveHistoryTab(t.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeHistoryTab === t.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Table */}
        <div className="overflow-x-auto">
          {activeHistoryTab === 'aptitude' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Attempt ID</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Diagnostic Summary</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.aptitude?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono text-blue-400">#APT-{item.id}</td>
                    <td className="py-3 px-3 font-bold">{item.score} / {item.total_marks}</td>
                    <td className="py-3 px-3">
                      <Badge variant={item.percentage >= 60 ? 'success' : 'danger'} size="xs">
                        {item.percentage}%
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-md truncate">{item.feedback_summary || 'Practice test'}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeHistoryTab === 'coding' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Problem Title</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.coding?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white">{item.problem__title}</td>
                    <td className="py-3 px-3 uppercase text-slate-400 font-mono">{item.language}</td>
                    <td className="py-3 px-3">
                      <Badge variant={item.status} size="xs">{item.status}</Badge>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">{item.score} pts</td>
                    <td className="py-3 px-3 text-right text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeHistoryTab === 'resume' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Resume File</th>
                  <th className="py-2.5 px-3">ATS Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Upload Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.resume?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white">{item.file_name}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{item.analysis__overall_score || 0} / 100</td>
                    <td className="py-3 px-3">
                      <Badge variant={item.analysis__overall_score >= 75 ? 'success' : 'warning'} size="xs">
                        {item.analysis__overall_score >= 75 ? 'ATS Optimized' : 'Needs Optimization'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{new Date(item.uploaded_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeHistoryTab === 'interview' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Question</th>
                  <th className="py-2.5 px-3">Overall Score</th>
                  <th className="py-2.5 px-3">Relevance</th>
                  <th className="py-2.5 px-3">Clarity</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.interview?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white max-w-sm truncate">{item.question__question}</td>
                    <td className="py-3 px-3 font-bold text-purple-400">{item.overall_score} / 100</td>
                    <td className="py-3 px-3 text-slate-300">{item.relevance_score} / 10</td>
                    <td className="py-3 px-3 text-slate-300">{item.clarity_score} / 10</td>
                    <td className="py-3 px-3 text-right text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
