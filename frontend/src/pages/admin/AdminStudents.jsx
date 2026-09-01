import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Users, Search, Filter, Trash2, Eye,
  Building2, GraduationCap, Mail, Phone, Award
} from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [gradYearFilter, setGradYearFilter] = useState('');

  // Performance Report Modal
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, gradYearFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (branchFilter) params.branch = branchFilter;
      if (gradYearFilter) params.graduation_year = gradYearFilter;

      const res = await adminService.getReports(params);
      setStudents(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student account?')) return;
    try {
      await adminService.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleViewPerformance = (student) => {
    setSelectedStudentReport(student);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-400" />
          Student Directory & Performance Inspector
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review enrolled student accounts, inspect individual readiness scores, and filter by branch or graduation year.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            placeholder="Filter Branch (e.g. CSE)"
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="number"
            value={gradYearFilter}
            onChange={(e) => setGradYearFilter(e.target.value)}
            placeholder="Year (e.g. 2026)"
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-purple-500 focus:outline-none w-28"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Enrolled Students ({students.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching student records..." size="lg" />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match the criteria"
            description="Try changing the branch or year filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase font-bold text-slate-400 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">College & Branch</th>
                  <th className="py-3 px-4">Grad Year</th>
                  <th className="py-3 px-4">Readiness Index</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{st.college || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{st.branch || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{st.graduation_year || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-400 text-sm">
                      {st.readiness_score}%
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.tier === 'Placement Ready' || st.tier === 'Excellent' ? 'success' : 'warning'} size="xs">
                        {st.tier}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewPerformance(st)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold text-xs border border-blue-500/20 transition-colors cursor-pointer"
                      >
                        Performance
                      </button>
                      <button
                        onClick={() => handleDelete(st.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Report Modal */}
      <Modal
        isOpen={!!selectedStudentReport}
        onClose={() => setSelectedStudentReport(null)}
        title="Student Performance & Readiness Diagnostics"
        maxWidth="max-w-xl"
      >
        {selectedStudentReport && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white">{selectedStudentReport.name}</h4>
                <p className="text-slate-400">{selectedStudentReport.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedStudentReport.college} • {selectedStudentReport.branch} ({selectedStudentReport.graduation_year})
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</p>
                <p className="text-2xl font-black text-blue-400">{selectedStudentReport.readiness_score}%</p>
                <Badge variant="primary" size="xs">{selectedStudentReport.tier}</Badge>
              </div>
            </div>

            {/* 4 Modules breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Aptitude Score</span>
                <p className="text-base font-bold text-indigo-400 mt-0.5">{selectedStudentReport.module_scores?.aptitude || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Coding Score</span>
                <p className="text-base font-bold text-blue-400 mt-0.5">{selectedStudentReport.module_scores?.coding || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Resume Score</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{selectedStudentReport.module_scores?.resume || 0} / 100</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Interview Score</span>
                <p className="text-base font-bold text-purple-400 mt-0.5">{selectedStudentReport.module_scores?.interview || 0} / 100</p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-2 pt-2">
              {selectedStudentReport.strong_areas?.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Strong Topics:</h5>
                  <p className="text-slate-300">{selectedStudentReport.strong_areas.join(', ')}</p>
                </div>
              )}
              {selectedStudentReport.weak_areas?.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">Areas For Focus:</h5>
                  <p className="text-slate-300">{selectedStudentReport.weak_areas.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStudents;
