import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { aptitudeService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight,
  Send, Sparkles, Check, X, BookOpen, RefreshCw, BarChart2, LogOut,
  ShieldAlert, ShieldCheck
} from 'lucide-react';

const formatOptionText = (text) => {
  if (text === null || text === undefined) return '';
  const str = String(text).trim();
  if (str.startsWith(',') && /^[,\d]+$/.test(str)) {
    return '₹' + str.replace(/^,/, '');
  }
  return str;
};

const AptitudeRunner = ({ isReviewMode = false }) => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isReview = isReviewMode || !!attemptId || location.pathname.includes('/review/');
  const targetId = attemptId || testId;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { question_id: selected_index }
  const [timeSpent, setTimeSpent] = useState({}); // { question_id: seconds }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Result state
  const [result, setResult] = useState(null);

  // Quit Test Confirmation State
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pendingNavPath, setPendingNavPath] = useState(null);

  // Anti-Copy & Anti-Cheat Toast Warning State
  const [copyWarning, setCopyWarning] = useState(null);
  const copyWarningTimeoutRef = useRef(null);

  const showCopyBlockedWarning = (msg = 'Test ke dauran question select ya copy karna prohibited hai!') => {
    if (copyWarningTimeoutRef.current) {
      clearTimeout(copyWarningTimeoutRef.current);
    }
    setCopyWarning(msg);
    copyWarningTimeoutRef.current = setTimeout(() => {
      setCopyWarning(null);
    }, 2800);
  };

  useEffect(() => {
    loadTestQuestions();
  }, [testId, attemptId, location.pathname]);

  // Intercept navigation, browser back button, reload, and enforce Anti-Copy during active test
  useEffect(() => {
    if (result || loading || isReview) return;

    // 1. Prevent accidental page reload or tab close
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 2. Intercept browser Back button
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
      setPendingNavPath('/aptitude');
      setShowQuitModal(true);
    };
    window.addEventListener('popstate', handlePopState);

    // 3. Intercept sidebar & navbar link clicks during test
    const handleDocumentClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin);
          if (url.origin === window.location.origin && !url.pathname.startsWith('/aptitude/test/')) {
            e.preventDefault();
            e.stopPropagation();
            setPendingNavPath(url.pathname);
            setShowQuitModal(true);
          }
        } catch {
          // ignore invalid URLs
        }
      }
    };
    document.addEventListener('click', handleDocumentClick, true);

    // 4. Anti-Copy & Anti-Selection Enforcements
    const handleCopy = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
      showCopyBlockedWarning('Copying test questions is strictly prohibited!');
    };

    const handleCut = (e) => {
      e.preventDefault();
      showCopyBlockedWarning('Cut action is prohibited during the test!');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      showCopyBlockedWarning('Right-click context menu is disabled during the test!');
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) {
        sel.removeAllRanges();
      }
    };

    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = (e.key || '').toLowerCase();

      // Block Ctrl/Cmd + C (Copy)
      if (isCtrlOrCmd && key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        showCopyBlockedWarning('Copy shortcut (Ctrl+C / Cmd+C) is disabled during the test!');
        return;
      }

      // Block Ctrl/Cmd + A (Select All)
      if (isCtrlOrCmd && key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        showCopyBlockedWarning('Select-all (Ctrl+A / Cmd+A) is disabled during the test!');
        return;
      }

      // Block Ctrl/Cmd + X (Cut)
      if (isCtrlOrCmd && key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        showCopyBlockedWarning('Cut shortcut is disabled during the test!');
        return;
      }

      // Block Ctrl/Cmd + U (View Source)
      if (isCtrlOrCmd && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl/Cmd + P (Print)
      if (isCtrlOrCmd && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        showCopyBlockedWarning('Printing the test is disabled during the test!');
        return;
      }

      // Block DevTools shortcuts: F12, Ctrl/Cmd + Shift + I/J/C
      if (
        e.key === 'F12' ||
        (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyBlockedWarning('Developer tools inspection is restricted during the test!');
        return;
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (copyWarningTimeoutRef.current) {
        clearTimeout(copyWarningTimeoutRef.current);
      }
    };
  }, [result, loading, isReview]);

  const handleConfirmQuit = () => {
    try {
      sessionStorage.removeItem('active_practice_test');
    } catch {
      // ignore
    }
    const dest = pendingNavPath || '/aptitude';
    setShowQuitModal(false);
    navigate(dest);
  };

  const handleCancelQuit = () => {
    setPendingNavPath(null);
    setShowQuitModal(false);
  };

  // Timer countdown
  useEffect(() => {
    if (result || timeLeft <= 0 || loading || isReview) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });

      // Track time on current question
      if (questions[currentIndex]) {
        const qId = questions[currentIndex].id;
        setTimeSpent((prev) => ({
          ...prev,
          [qId]: (prev[qId] || 0) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, loading, currentIndex, questions, isReview]);

  const loadTestQuestions = async () => {
    try {
      setLoading(true);

      if (isReview) {
        // Load existing completed test attempt for solution review!
        const res = await aptitudeService.getAttemptDetail(targetId);
        if (res?.data) {
          setResult(res.data);
        }
      } else if (testId === 'custom') {
        const stored = sessionStorage.getItem('active_practice_test');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTest(parsed);
          setQuestions(parsed.questions || []);
          setTimeLeft((parsed.duration_minutes || 15) * 60);
        } else {
          navigate('/aptitude');
        }
      } else {
        const res = await aptitudeService.getTestDetail(testId);
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.duration_minutes || 20) * 60);
        sessionStorage.setItem('active_practice_test', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Error loading test/review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleSubmitTest = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);

    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.id,
        selected_option_index: userAnswers[q.id] !== undefined ? userAnswers[q.id] : null,
        time_spent: timeSpent[q.id] || 0,
      }));

      const totalTimeElapsed = (test?.duration_minutes ? test.duration_minutes * 60 : 900) - timeLeft;

      const res = await aptitudeService.submitAttempt({
        test_id: testId !== 'custom' ? testId : null,
        test_title: test?.title || 'Aptitude Test',
        category_id: test?.category || null,
        time_taken_seconds: Math.max(1, totalTimeElapsed),
        answers: payloadAnswers,
        questions: questions,
      });

      setResult(res.data);
    } catch (err) {
      console.error('Error submitting test attempt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner text="Preparing test session & timer..." size="lg" />;
  }

  // ================= RESULT VIEW =================
  if (result) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
        {/* Results Header Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Evaluation Recap
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                {result.test_title || 'Aptitude Test Completed'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted on {new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/aptitude')}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Back to Aptitude Hub
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          {/* Metric Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Score</p>
              <p className="text-2xl font-black text-white mt-1">{result.score} / {result.total_marks}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Percentage</p>
              <p className={`text-2xl font-black mt-1 ${result.percentage >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.percentage}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {result.correct_count} / {result.correct_count + result.incorrect_count + result.unattempted_count}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Time Taken</p>
              <p className="text-2xl font-black text-blue-400 mt-1">{Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s</p>
            </div>
          </div>

          {/* AI Personalized Feedback Box */}
          {result.feedback_summary && (
            <div className="rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                  Personalized Diagnostic Feedback
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.feedback_summary}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Question by Question Solution Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            Detailed Solutions & Explanations ({result.answers?.length || 0} Questions)
          </h3>

          {result.answers?.map((ans, idx) => (
            <div
              key={ans.id || idx}
              className={`rounded-2xl border p-5 bg-slate-900/90 shadow-md ${
                ans.is_correct
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : ans.selected_option_index === null
                  ? 'border-slate-800'
                  : 'border-rose-500/30 bg-rose-950/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">
                  Question {idx + 1} • <span className="text-blue-400">{ans.topic || 'General'}</span>
                </span>
                <Badge variant={ans.is_correct ? 'success' : ans.selected_option_index === null ? 'warning' : 'danger'} size="xs">
                  {ans.is_correct ? 'Correct' : ans.selected_option_index === null ? 'Unattempted' : 'Incorrect'}
                </Badge>
              </div>

              <h4 className="text-sm font-semibold text-white mb-4 leading-relaxed">
                {ans.question_text}
              </h4>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {ans.options?.map((opt, optIdx) => {
                  const isUserChoice = ans.selected_option_index === optIdx;
                  const isCorrectChoice = ans.correct_option_index === optIdx;

                  let optClass = 'border-slate-800 bg-slate-950/50 text-slate-300';
                  if (isCorrectChoice) {
                    optClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold';
                  } else if (isUserChoice && !isCorrectChoice) {
                    optClass = 'border-rose-500/50 bg-rose-500/10 text-rose-300';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold uppercase text-[10px] w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-slate-300">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{formatOptionText(opt)}</span>
                      </div>

                      {isCorrectChoice && (
                        <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> {isUserChoice ? 'Your Answer (Correct)' : 'Correct Answer'}
                        </span>
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1">
                          <X className="h-3.5 w-3.5" /> Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step by step Explanation */}
              {ans.explanation && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <p className="font-bold text-blue-400 text-[11px] uppercase tracking-wider mb-1">
                    Step-by-Step Explanation:
                  </p>
                  <p className="leading-relaxed">{ans.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= ACTIVE TEST RUNNER VIEW =================
  const currentQ = questions[currentIndex];
  if (!currentQ) {
    return <EmptyState title="No questions available in this test." onAction={() => navigate('/aptitude')} actionLabel="Back" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in select-none test-anti-copy">
      {/* Floating Security Warning Toast */}
      {copyWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-rose-950/95 border border-rose-500/60 text-white shadow-2xl shadow-rose-950/70 backdrop-blur-xl animate-fade-in transition-all">
          <div className="p-1.5 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-200">Security Warning: Action Restricted</p>
            <p className="text-[11px] text-rose-300 font-medium">{copyWarning}</p>
          </div>
        </div>
      )}

      {/* Test Running Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md sticky top-20 z-20 select-none">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            {test?.category_name || 'Aptitude Test'}
          </span>
          <h2 className="text-base font-extrabold text-white truncate max-w-md">
            {test?.title || 'Practice Test'}
          </h2>
        </div>

        {/* Controls: Anti-Cheat Badge + Countdown Timer + Quit Button */}
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold select-none shadow-sm"
            title="Anti-cheat active: Question copy and selection are prohibited"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Copy Protected</span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm shadow-md ${
            timeLeft < 180
              ? 'border-rose-500/50 bg-rose-500/15 text-rose-400 animate-pulse'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingNavPath('/aptitude');
              setShowQuitModal(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            title="Quit Test"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Quit Test</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Question Pane + Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Question Card */}
        <div
          className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between select-none test-anti-copy"
          onCopy={(e) => {
            e.preventDefault();
            showCopyBlockedWarning('Copying test questions is strictly prohibited!');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            showCopyBlockedWarning('Right-click is disabled during the test!');
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={currentQ.difficulty || 'MEDIUM'} size="xs">
                  {currentQ.difficulty || 'Medium'}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">
                  {currentQ.topic || 'General'}
                </span>
              </div>
            </div>

            <h3
              className="text-base font-semibold text-slate-100 leading-relaxed mb-6 select-none cursor-default test-anti-copy"
              style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
            >
              {currentQ.question_text}
            </h3>

            {/* Options selection */}
            <div className="space-y-3 select-none test-anti-copy">
              {currentQ.options?.map((optionText, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer active:scale-98 select-none test-anti-copy ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/15 text-white shadow-md shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{formatOptionText(optionText)}</span>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800/80 mt-8">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Send className="h-4 w-4" /> Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Navigation Palette */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Question Palette
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;

                let btnClass = 'border-slate-800 bg-slate-950 text-slate-400';
                if (isCurrent) {
                  btnClass = 'border-blue-500 bg-blue-600 text-white font-bold ring-2 ring-blue-500/30';
                } else if (isAnswered) {
                  btnClass = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                <span>Answered ({Object.keys(userAnswers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                <span>Unanswered ({questions.length - Object.keys(userAnswers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Current Question</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitTest}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Finish & Submit Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quit Test Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Quit Test?</h3>
                <p className="text-xs text-slate-400">Are you sure you want to exit this test session?</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">Questions Answered:</span>
              <span className="font-bold text-emerald-400">
                {Object.keys(userAnswers).length} of {questions.length}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelQuit}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleConfirmQuit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Yes, Quit Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeRunner;
