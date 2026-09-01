import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  FileSpreadsheet, Download, Search, Filter,
  TrendingUp, Award, Users, CheckCircle, RefreshCw
} from 'lucide-react';

const AdminReports = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, [branch, gradYear, tierFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (branch) params.branch = branch;
      if (gradYear) params.graduation_year = gradYear;
      if (tierFilter) params.tier = tierFilter;

      const res = await adminService.getReports(params);
      setStudents(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const token = localStorage.getItem('access_token');
    window.open(`${adminService.exportCSVUrl}?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            Student Performance & Placement Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter batch competency records, evaluate readiness tier distribution, and export formatted CSV reports.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export All Data to CSV</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Filter Branch (e.g. CSE / ECE)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <input
            type="number"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            placeholder="Graduation Year (e.g. 2026)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Readiness Tiers</option>
            <option value="Placement Ready">Placement Ready (76-90)</option>
            <option value="Excellent">Excellent (91-100)</option>
            <option value="Good">Good (61-75)</option>
            <option value="Developing">Developing (41-60)</option>
            <option value="Beginner">Beginner (0-40)</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Student Performance Registry ({students.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating student performance report..." size="lg" />
        ) : students.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No records match current report filters"
            description="Clear filters to view all enrolled candidate records."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setBranch('');
              setGradYear('');
              setTierFilter('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">College & Branch</th>
                  <th className="py-3 px-3">Readiness</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Aptitude (%)</th>
                  <th className="py-3 px-3">Coding (%)</th>
                  <th className="py-3 px-3">Resume (/100)</th>
                  <th className="py-3 px-3">Interview (/100)</th>
                  <th className="py-3 px-3">Tests Done</th>
                  <th className="py-3 px-3">DSA Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <div>{st.college || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{st.branch} • {st.graduation_year}</div>
                    </td>
                    <td className="py-3.5 px-3 font-black text-sm text-blue-400">
                      {st.readiness_score}%
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={st.tier === 'Placement Ready' || st.tier === 'Excellent' ? 'success' : 'warning'} size="xs">
                        {st.tier}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-indigo-300">{st.module_scores?.aptitude || 0}%</td>
                    <td className="py-3.5 px-3 font-semibold text-blue-300">{st.module_scores?.coding || 0}%</td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-300">{st.module_scores?.resume || 0}</td>
                    <td className="py-3.5 px-3 font-semibold text-purple-300">{st.module_scores?.interview || 0}</td>
                    <td className="py-3.5 px-3 font-mono">{st.stats?.tests_attempted || 0}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-400">{st.stats?.problems_solved || 0}</td>
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

export default AdminReports;
