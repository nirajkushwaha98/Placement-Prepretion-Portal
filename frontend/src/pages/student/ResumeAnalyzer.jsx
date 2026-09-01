import React, { useState, useEffect } from 'react';
import { resumeService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Lightbulb,
  Trash2, ArrowRight, ShieldCheck, Sparkles, FileSpreadsheet,
  ExternalLink, Mail, Phone, Globe, Link as LinkIcon, Code, Wrench, Layers
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await resumeService.getHistory();
      const list = res.data.results || res.data;
      setHistory(list);
      if (list.length > 0 && list[0].analysis) {
        setCurrentAnalysis(list[0]);
      }
    } catch (err) {
      console.error('Error fetching resume history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMode === 'file' && !file) {
      setError('Please select a PDF or DOCX resume file.');
      return;
    }
    if (uploadMode === 'text' && !rawText.trim()) {
      setError('Please paste your resume text.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      const formData = new FormData();
      if (uploadMode === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('raw_text', rawText);
      }

      const res = await resumeService.uploadAndAnalyze(formData);
      setCurrentAnalysis(res.data);
      setFile(null);
      setRawText('');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try another file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume from your history?')) return;
    try {
      await resumeService.deleteResume(id);
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
      }
      fetchHistory();
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  const analysisData = currentAnalysis?.analysis;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-400" />
            AI-Powered Resume & ATS Analyzer
          </h1>
        </div>
      </div>

      {/* Upload and History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-400" />
              Upload Resume Document
            </h3>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  uploadMode === 'file' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  uploadMode === 'text' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {uploadMode === 'file' ? (
              <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-6 text-center hover:border-emerald-500/50 transition-colors">
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file"
                  className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                >
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {file ? file.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF or DOCX (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your complete resume text including education, skills, projects, and work experience..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {analyzing ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run NLP Resume Evaluation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
              Uploaded Resumes ({history.length})
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No resumes analyzed yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      currentAnalysis?.id === item.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold truncate">{item.file_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={item.analysis?.overall_score >= 75 ? 'success' : 'warning'} size="xs">
                        {item.analysis?.overall_score || 0}/100
                      </Badge>
                      <button
                        onClick={(e) => handleDeleteResume(item.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Score badge circle */}
                <div className="flex flex-col items-center justify-center h-28 w-28 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/20 text-white shrink-0">
                  <span className="text-3xl font-black">{analysisData.overall_score}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-90">/ 100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={analysisData.overall_score >= 75 ? 'success' : 'warning'} size="sm">
                      {analysisData.overall_score >= 75 ? 'Placement Ready' : 'Optimization Recommended'}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1.5">
                    ATS Resume Evaluation Score
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Evaluation based on technical keyword coverage, structural clarity, contact integrity, quantifiable impact metrics, and ATS parsing standards.
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Category Sub-score Grid */}
            {analysisData.category_scores && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-6 border-t border-slate-800">
                {Object.entries(analysisData.category_scores).map(([category, score]) => (
                  <div key={category} className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {category.replace('_', ' ')}
                    </p>
                    <p className="text-base font-extrabold text-white mt-1">{score}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strengths, Weaknesses, Suggestions 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Key Strengths ({analysisData.strengths?.length || 0})
              </h4>
              <div className="space-y-2">
                {analysisData.strengths?.map((str, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Identified Weaknesses ({analysisData.weaknesses?.length || 0})
              </h4>
              <div className="space-y-2">
                {analysisData.weaknesses?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-rose-200/90 leading-relaxed">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                Actionable Improvements ({analysisData.suggestions?.length || 0})
              </h4>
              <div className="space-y-2">
                {analysisData.suggestions?.map((sug, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NLP Extracted Entities Inspection */}
          {analysisData.extracted_info && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-400" />
                Extracted Profile & Technical Taxonomy
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Languages */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5 text-blue-400" /> Programming Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisData.extracted_info.programming_languages?.length > 0 ? (
                      analysisData.extracted_info.programming_languages.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None detected</span>
                    )}
                  </div>
                </div>

                {/* Frameworks */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-purple-400" /> Frameworks & Libraries
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisData.extracted_info.frameworks?.length > 0 ? (
                      analysisData.extracted_info.frameworks.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None detected</span>
                    )}
                  </div>
                </div>

                {/* Tools & Platforms */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-emerald-400" /> Tools & Cloud Platforms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisData.extracted_info.tools?.length > 0 ? (
                      analysisData.extracted_info.tools.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None detected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
