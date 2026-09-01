import React, { useState, useEffect } from 'react';
import { resumeService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Briefcase, CheckCircle2, AlertTriangle, Lightbulb,
  Sparkles, ArrowRight, History, Layers, Building2
} from 'lucide-react';

const JobMatcher = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [companyName, setCompanyName] = useState('Tech Corp');
  const [jdText, setJdText] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resRes, histRes] = await Promise.all([
        resumeService.getHistory(),
        resumeService.getJobMatchHistory(),
      ]);
      const resList = resRes.data.results || resRes.data;
      setResumes(resList);
      if (resList.length > 0) {
        setSelectedResumeId(resList[0].id);
      }
      const histList = histRes.data.results || histRes.data;
      setHistory(histList);
      if (histList.length > 0) {
        setMatchResult(histList[0]);
      }
    } catch (err) {
      console.error('Error loading job matcher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatch = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      setError('Please paste a job description.');
      return;
    }

    try {
      setMatching(true);
      setError('');
      const res = await resumeService.matchJobDescription({
        resume_id: selectedResumeId || null,
        job_title: jobTitle,
        company_name: companyName,
        jd_text: jdText,
      });
      setMatchResult(res.data);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Matching failed. Please make sure you have uploaded a resume first.');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job matching engine..." size="lg" />;
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Resume vs Job Description Matcher
          </h1>
        </div>
      </div>

      {/* Input Form & Matcher View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Target Role Specification
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRunMatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Base Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {resumes.length === 0 ? (
                  <option value="">No resumes found - will use profile skills</option>
                ) : (
                  resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.file_name} (Uploaded: {new Date(r.uploaded_at).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google / Microsoft"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Description Text (paste requirements, qualifications & tech stack)
              </label>
              <textarea
                rows={6}
                required
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="We are looking for a Software Engineer proficient in Python, Django, PostgreSQL, Docker, AWS, React, and REST APIs..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={matching}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {matching ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  <span>Compute Match & Skill Gaps</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Match Score Card */}
        <div className="lg:col-span-6 space-y-4">
          {matchResult ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              {/* Score Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Match Analysis
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    {matchResult.job_title} {matchResult.company_name ? `@ ${matchResult.company_name}` : ''}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</p>
                    <p className={`text-2xl font-black ${
                      matchResult.match_score >= 75 ? 'text-emerald-400' : matchResult.match_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {matchResult.match_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Matching Skills */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Matching Skills ({matchResult.matching_skills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.matching_skills?.length > 0 ? (
                    matchResult.matching_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No matching keywords found</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Missing Required Skills ({matchResult.missing_skills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missing_skills?.length > 0 ? (
                    matchResult.missing_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium"
                      >
                        + {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400">All required tech stack skills detected in resume!</span>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {matchResult.recommendations?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    Recommendations to Elevate Match Rate
                  </h5>
                  <div className="space-y-1.5">
                    {matchResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center">
              <p className="text-xs text-slate-400">
                Paste a target job description and click "Compute Match" to view the compatibility breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;
