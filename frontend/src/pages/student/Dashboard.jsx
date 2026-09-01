import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import ReadinessGauge from '../../components/ReadinessGauge';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Calculator, Code2, FileText, MessageSquare, Flame,
  TrendingUp, CheckCircle, AlertTriangle, ArrowRight,
  Sparkles, ShieldCheck, Activity, Target
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating placement readiness metrics..." size="lg" />;
  }

  const {
    readiness_score = 0,
    tier = 'Beginner',
    module_scores = {},
    stats = {},
    streak_days = 0,
    recommendations = [],
    weak_areas = [],
    strong_areas = [],
    recent_activity = [],
    progress_charts = {},
  } = data || {};

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Welcome back
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span className="text-xs text-slate-400">
                {user?.student_profile?.branch || 'Engineering Track'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user?.first_name || user?.name?.split(' ')[0] || user?.username || 'Student'}
            </h1>

            {/* Overall Placement Completion Progress Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 max-w-xl">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-blue-300 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Overall Placement Preparation Completed:
                </span>
                <span className="text-emerald-400 font-extrabold text-sm">{readiness_score}%</span>
              </div>
              <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/20"
                  style={{ width: `${Math.max(5, readiness_score)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Completion Percentage Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Completed</p>
                <p className="text-base font-extrabold text-emerald-300">{readiness_score}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-lg">
              <Flame className="h-6 w-6 fill-amber-400 text-amber-400 animate-bounce" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Streak</p>
                <p className="text-base font-extrabold">{streak_days} {streak_days === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Readiness Gauge + 4 Core Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Index Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              Placement Readiness
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded">
              Weighted Formula
            </span>
          </div>

          <ReadinessGauge
            score={readiness_score}
            tier={tier}
            moduleScores={module_scores}
          />

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
            Formula: Aptitude (25%) + Coding (30%) + Resume (20%) + Interview (25%)
          </div>
        </div>

        {/* 4 Core Module Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Aptitude Practice"
            value={`${module_scores.aptitude || 0}%`}
            subtitle={`${stats.tests_attempted || 0} tests completed`}
            icon={Calculator}
            color="indigo"
            onClick={() => navigate('/aptitude')}
          />
          <StatCard
            title="Coding Problems"
            value={`${stats.problems_solved || 0} / ${stats.total_problems || 10}`}
            subtitle={`${module_scores.coding || 0}% mastery score`}
            icon={Code2}
            color="blue"
            onClick={() => navigate('/coding')}
          />
          <StatCard
            title="Resume ATS Score"
            value={`${module_scores.resume || 0} / 100`}
            subtitle={stats.resumes_uploaded > 0 ? "Latest resume analyzed" : "No resume uploaded"}
            icon={FileText}
            color="emerald"
            onClick={() => navigate('/resume')}
          />
          <StatCard
            title="Interview Score"
            value={`${module_scores.interview || 0} / 100`}
            subtitle={`${stats.interviews_attempted || 0} questions practiced`}
            icon={MessageSquare}
            color="purple"
            onClick={() => navigate('/interview')}
          />
        </div>
      </div>

      {/* Dynamic Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI Personalized Recommendations
            </h3>
            <span className="text-xs text-slate-400">Based on recent performance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {rec.category}
                    </span>
                    <Badge variant={rec.type === 'danger' ? 'danger' : rec.type === 'warning' ? 'warning' : 'primary'} size="xs">
                      {rec.type === 'danger' ? 'Priority' : 'Recommended'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{rec.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                </div>

                {rec.action_label && (
                  <button
                    onClick={() => navigate(rec.action_link)}
                    className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-colors cursor-pointer"
                  >
                    <span>{rec.action_label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak & Strong Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Your Strong Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {strong_areas.map((area, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium"
              >
                ✓ {area}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Areas For Improvement
          </h4>
          <div className="flex flex-wrap gap-2">
            {weak_areas.map((area, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium"
              >
                ⚠ {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts & Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time Line Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Progress Trend (Last 7 Sessions)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Aptitude vs Interview vs Readiness Score</p>
            </div>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>

          <div className="h-64 w-full">
            {progress_charts?.line_chart_data && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress_charts.line_chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2.5} name="Readiness Index" />
                  <Line type="monotone" dataKey="aptitude" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" name="Aptitude %" />
                  <Line type="monotone" dataKey="interview" stroke="#10b981" strokeWidth={2} strokeDasharray="2 2" name="Interview Score" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Radar Chart: Preparation Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Preparation Balance Radar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Multi-competency readiness overview</p>
            </div>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>

          <div className="h-64 w-full">
            {progress_charts?.radar_chart_data && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={progress_charts.radar_chart_data}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <Radar
                    name="Student Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Recent Practice Activity
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any activity to review details</span>
        </div>

        {recent_activity.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No activity recorded yet. Start practicing aptitude or coding!
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recent_activity.map((act) => {
              const link =
                act.link ||
                (act.type === 'aptitude'
                  ? act.target_id
                    ? `/aptitude/review/${act.target_id}`
                    : '/aptitude'
                  : act.type === 'coding'
                  ? act.target_id
                    ? `/coding/${act.target_id}`
                    : '/coding'
                  : act.type === 'resume'
                  ? '/resume'
                  : act.target_id
                  ? `/interview/practice/${act.target_id}`
                  : '/interview');

              return (
                <div
                  key={act.id}
                  onClick={() => navigate(link)}
                  className="py-3 px-3 -mx-3 rounded-xl flex items-center justify-between hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl transition-all group-hover:scale-105 ${
                        act.type === 'aptitude'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : act.type === 'coding'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : act.type === 'resume'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {act.type === 'aptitude' && <Calculator className="h-4 w-4" />}
                      {act.type === 'coding' && <Code2 className="h-4 w-4" />}
                      {act.type === 'resume' && <FileText className="h-4 w-4" />}
                      {act.type === 'interview' && <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {act.title}
                      </h5>
                      <p className="text-[11px] text-slate-400">{act.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant={act.status === 'passed' ? 'success' : 'warning'} size="xs">
                      {act.status === 'passed' ? 'Completed' : 'Reviewed'}
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(link);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
