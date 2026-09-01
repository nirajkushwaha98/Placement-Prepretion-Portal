import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Play, Send, ArrowLeft, CheckCircle2, XCircle,
  Terminal, History, Settings, RefreshCw, Sparkles, Check, AlertTriangle
} from 'lucide-react';

import { SUPPORTED_LANGUAGES } from '../../components/MultiLanguageRunner';

const LANGUAGE_CONFIGS = Object.fromEntries(
  Object.entries(SUPPORTED_LANGUAGES).map(([key, val]) => [
    key,
    { monaco: val.monaco, label: `${val.icon} ${val.label}` }
  ])
);

const CodingWorkspace = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'submissions'
  const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase', 'result'
  const [submissions, setSubmissions] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  useEffect(() => {
    if (problem && problem.starter_code) {
      setCode(problem.starter_code[language] || '# Write your code here\n');
    }
  }, [language, problem]);

  const fetchProblemDetails = async () => {
    try {
      setLoading(true);
      const res = await codingService.getProblemDetail(problemId);
      setProblem(res.data);
      if (res.data.starter_code?.[language]) {
        setCode(res.data.starter_code[language]);
      }
      setCustomInput(res.data.sample_input || '');
      loadSubmissions();
    } catch (err) {
      console.error('Error loading problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await codingService.getSubmissions({ problem_id: problemId });
      setSubmissions(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleTab('result');
    setRunResult(null);
    setAiReview(null);

    try {
      const res = await codingService.runCode({
        code,
        language,
        input: customInput,
        expected_output: problem?.sample_output || '',
      });
      setRunResult(res.data);
    } catch (err) {
      setRunResult({
        success: false,
        status: 'ERROR',
        error: err.response?.data?.error || 'Execution failed.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConsoleTab('result');
    setSubmissionResult(null);
    setAiReview(null);

    try {
      const res = await codingService.submitProblemCode(problemId, {
        code,
        language,
      });
      setSubmissionResult(res.data);
      if (res.data.status === 'ACCEPTED') {
        setProblem((prev) => ({ ...prev, is_solved: true }));
      }
      loadSubmissions();
    } catch (err) {
      setSubmissionResult({
        status: 'ERROR',
        error_message: err.response?.data?.error || 'Submission failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAICodeReview = async () => {
    if (isReviewing) return;
    setIsReviewing(true);
    setConsoleTab('result');
    setRunResult(null);
    setSubmissionResult(null);

    try {
      const res = await codingService.getAICodeReview({
        code,
        language,
        problemTitle: problem?.title,
        problemDescription: problem?.description,
      });
      setAiReview(res.data.review);
    } catch (err) {
      setAiReview('Failed to fetch AI code review.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleResetCode = () => {
    if (problem?.starter_code?.[language]) {
      setCode(problem.starter_code[language]);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Initializing Monaco IDE sandbox..." size="lg" />;
  }

  if (!problem) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-400">Problem not found.</p>
        <button
          onClick={() => navigate('/coding')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3 animate-fade-in">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/coding')}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {problem.title}
            </h2>
            <Badge variant={problem.difficulty} size="xs">
              {problem.difficulty}
            </Badge>
            {problem.is_solved && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="h-3 w-3" /> Solved
              </span>
            )}
          </div>
        </div>

        {/* Language selector & action buttons */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {Object.entries(LANGUAGE_CONFIGS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetCode}
            title="Reset code template"
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleAICodeReview}
            disabled={isReviewing || isRunning || isSubmitting}
            className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-200 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isReviewing ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>AI Code Review</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting || isReviewing}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-white text-white" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting || isRunning || isReviewing}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid (Problem Details + Monaco Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Pane: Problem Description & Submissions */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'description'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => {
                setActiveTab('submissions');
                loadSubmissions();
              }}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
            {activeTab === 'description' ? (
              <>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {problem.description}
                  </p>
                </div>

                {problem.input_format && (
                  <div className="space-y-1 pt-2">
                    <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Input Format
                    </h4>
                    <p className="text-slate-400 whitespace-pre-line bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {problem.input_format}
                    </p>
                  </div>
                )}

                {problem.output_format && (
                  <div className="space-y-1 pt-2">
                    <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Output Format
                    </h4>
                    <p className="text-slate-400 whitespace-pre-line bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {problem.output_format}
                    </p>
                  </div>
                )}

                {problem.constraints && (
                  <div className="space-y-1 pt-2">
                    <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Constraints
                    </h4>
                    <pre className="text-amber-300 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {problem.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Test Case */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Sample Test Case
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold">Input</p>
                      <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                        {problem.sample_input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold">Output</p>
                      <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                        {problem.sample_output}
                      </pre>
                    </div>
                  </div>
                  {problem.sample_explanation && (
                    <p className="text-slate-400 italic pt-1">
                      <strong className="text-slate-300 not-italic">Explanation:</strong> {problem.sample_explanation}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No previous submissions for this problem.</p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.status} size="xs">
                            {sub.status}
                          </Badge>
                          <span className="text-[11px] text-slate-400 uppercase font-semibold">
                            {sub.language}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Passed {sub.passed_test_cases}/{sub.total_test_cases} test cases • {sub.execution_time_ms} ms
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Console Drawer */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden min-h-0">
          {/* Monaco Editor Workspace */}
          <div className="flex-1 min-h-[320px] bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={LANGUAGE_CONFIGS[language]?.monaco || 'python'}
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Console / Testcase / Execution Result Drawer */}
          <div className="h-60 border-t border-slate-800 bg-slate-950 flex flex-col">
            {/* Drawer Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setConsoleTab('testcase')}
                  className={`text-xs font-bold transition-colors cursor-pointer ${
                    consoleTab === 'testcase' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Testcase Input
                </button>
                <button
                  onClick={() => setConsoleTab('result')}
                  className={`text-xs font-bold transition-colors cursor-pointer ${
                    consoleTab === 'result' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Execution Console
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                Judge0 Sandboxed Runner
              </span>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
              {consoleTab === 'testcase' ? (
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-400 mb-1.5">
                    Standard Input (stdin):
                  </label>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter input here..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Submission outcome */}
                  {submissionResult && (
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={submissionResult.status} size="sm">
                          {submissionResult.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {submissionResult.passed_test_cases} / {submissionResult.total_test_cases} Passed
                        </span>
                      </div>

                      {submissionResult.error_message && (
                        <p className="text-rose-400 text-xs whitespace-pre-wrap">
                          {submissionResult.error_message}
                        </p>
                      )}

                      {/* Test case cards */}
                      <div className="space-y-1.5 pt-1">
                        {submissionResult.test_case_results?.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                              tc.passed
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            <span>Test Case #{tc.test_case_number} {tc.is_hidden ? '(Hidden)' : ''}</span>
                            <span>{tc.passed ? '✓ Passed' : '✗ Failed'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Run Code Outcome */}
                  {runResult && !submissionResult && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={runResult.status} size="xs">
                          {runResult.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          Execution Time: {runResult.time_ms} ms
                        </span>
                      </div>

                      {runResult.stdout && (
                        <div>
                          <p className="text-[10px] text-slate-400 mb-0.5">Output:</p>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto">
                            {runResult.stdout}
                          </pre>
                        </div>
                      )}

                      {runResult.error && (
                        <div>
                          <p className="text-[10px] text-rose-400 mb-0.5">Errors / Warnings:</p>
                          <pre className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 overflow-x-auto">
                            {runResult.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gemini AI Code Review Outcome */}
                  {aiReview && (
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-sans font-bold text-xs">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>AI Code Review & Feedback</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                        {aiReview}
                      </p>
                    </div>
                  )}

                  {!runResult && !submissionResult && !aiReview && (
                    <p className="text-slate-500 text-center py-6 font-sans text-xs">
                      Click "Run Code" to test against custom input, "Submit Solution" for full evaluation, or "AI Code Review" for code analysis.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingWorkspace;
