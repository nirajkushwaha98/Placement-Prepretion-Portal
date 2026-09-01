import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../api/services';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Shield, Users, HelpCircle, Terminal,
  MessageCircle, FileSpreadsheet, Activity,
  TrendingUp, Award, CheckCircle, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling institution-wide analytics..." size="lg" />;
  }

  const { metrics = {}, averages = {}, readiness_distribution = [] } = data || {};

  const tierColors = {
    Beginner: '#f43f5e',
    Developing: '#f59e0b',
    Good: '#8b5cf6',
    'Placement Ready': '#3b82f6',
    Excellent: '#10b981',
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Administrator Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-400" />
            Training & Placement Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor batch readiness distribution, module averages, student engagement, and question repositories.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/reports')}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Student Reports</span>
        </button>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={metrics.total_students || 0}
          subtitle={`${metrics.active_students || 0} active accounts`}
          icon={Users}
          color="purple"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Tests Attempted"
          value={metrics.total_tests_attempted || 0}
          subtitle="Diagnostic aptitude drills"
          icon={HelpCircle}
          color="indigo"
          onClick={() => navigate('/admin/questions')}
        />
        <StatCard
          title="Code Submissions"
          value={metrics.total_coding_submissions || 0}
          subtitle="Judge0 evaluated runs"
          icon={Terminal}
          color="blue"
          onClick={() => navigate('/admin/coding')}
        />
        <StatCard
          title="Resumes Analyzed"
          value={metrics.total_resumes_analyzed || 0}
          subtitle="NLP ATS parsed files"
          icon={BarChart3}
          color="emerald"
        />
        <StatCard
          title="Interviews Conducted"
          value={metrics.total_interviews_conducted || 0}
          subtitle="AI mock evaluations"
          icon={MessageCircle}
          color="amber"
          onClick={() => navigate('/admin/interview')}
        />
        <StatCard
          title="Readiness Index"
          value={`${averages.overall_readiness || 0}%`}
          subtitle="Batch composite average"
          icon={Award}
          color="rose"
          onClick={() => navigate('/admin/reports')}
        />
      </div>

      {/* Module Averages & Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Averages Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            Batch Performance Averages
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Aptitude Score</span>
                <span className="font-bold text-white">{averages.aptitude_score || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${averages.aptitude_score || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Coding Score</span>
                <span className="font-bold text-white">{averages.coding_score || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${averages.coding_score || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Resume ATS Score</span>
                <span className="font-bold text-white">{averages.resume_score || 0} / 100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${averages.resume_score || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Interview Score</span>
                <span className="font-bold text-white">{averages.interview_score || 0} / 100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${averages.interview_score || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Tier Distribution Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Placement Readiness Tier Distribution
            </h3>
            <span className="text-xs text-slate-400">Student count per tier</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readiness_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tier" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                  {readiness_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={tierColors[entry.tier] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/students')}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg"
        >
          <Users className="h-5 w-5 text-purple-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Student Management</h4>
          <p className="text-xs text-slate-400 mt-1">View profiles, academic tracks, and individual performance.</p>
        </div>

        <div
          onClick={() => navigate('/admin/questions')}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg"
        >
          <HelpCircle className="h-5 w-5 text-indigo-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Aptitude Question Bank</h4>
          <p className="text-xs text-slate-400 mt-1">Create, edit, or categorize MCQs with solutions.</p>
        </div>

        <div
          onClick={() => navigate('/admin/coding')}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg"
        >
          <Terminal className="h-5 w-5 text-blue-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Coding Problems CRUD</h4>
          <p className="text-xs text-slate-400 mt-1">Manage problem descriptions, starter codes, and test cases.</p>
        </div>

        <div
          onClick={() => navigate('/admin/reports')}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg"
        >
          <FileSpreadsheet className="h-5 w-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Analytics & CSV Export</h4>
          <p className="text-xs text-slate-400 mt-1">Generate filtered batch placement reports and export CSV.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
