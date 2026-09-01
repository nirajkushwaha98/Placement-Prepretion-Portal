import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  MessageSquare, Sparkles, Send, ArrowLeft, CheckCircle2,
  AlertTriangle, Lightbulb, RefreshCw, BookOpen, Clock, Award
} from 'lucide-react';

const MockInterview = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]);

  // Session timer
  useEffect(() => {
    if (evaluationResult) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluationResult]);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      try {
        const res = await interviewService.getQuestionById(questionId);
        if (res?.data && res.data.id) {
          setQuestion(res.data);
          return;
        }
      } catch (err) {
        console.warn('Direct fetch by id failed, attempting query search:', err);
      }

      const res = await interviewService.getQuestions({ id: questionId });
      const qList = Array.isArray(res?.data) ? res.data : (res?.data?.results || []);
      const found = qList.find((item) => String(item.id) === String(questionId)) || qList[0];
      setQuestion(found);
    } catch (err) {
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;

    try {
      setIsEvaluating(true);
      const res = await interviewService.submitAttempt({
        question_id: questionId,
        student_answer: studentAnswer,
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;

  if (loading) {
    return <LoadingSpinner text="Setting up mock interview studio..." size="lg" />;
  }

  if (!question) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-400">Question not found.</p>
        <button
          onClick={() => navigate('/interview')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs"
        >
          Back to Question Bank
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/interview')}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Mock Interview Simulator
            </span>
            <h2 className="text-sm font-extrabold text-white truncate max-w-md">
              {question.category_name} • {question.company_tag}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
          <Clock className="h-3.5 w-3.5 text-purple-400" />
          <span>{formatTimer(timeElapsed)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={question.difficulty} size="xs">
            {question.difficulty}
          </Badge>
          <span className="text-xs text-slate-400">Target Role Question</span>
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          "{question.question}"
        </h1>

        {question.tips && (
          <div className="pt-2 text-xs text-slate-300 border-t border-slate-800/80 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-400">Preparation Tip:</strong> {question.tips}
            </p>
          </div>
        )}
      </div>

      {/* Answer Input or Result Display */}
      {!evaluationResult ? (
        <form onSubmit={handleSubmitAnswer} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Verbal / Written Response:
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {wordCount} words (Recommend: 50–200 words)
            </span>
          </div>

          <textarea
            rows={8}
            required
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your structured answer here. Use the STAR technique (Situation, Task, Action, Result) for behavioral questions or structured conceptual analogies for technical questions..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              Our AI evaluates relevance, technical depth, clarity, and communication quality.
            </p>

            <button
              type="submit"
              disabled={isEvaluating || !studentAnswer.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isEvaluating ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Submit for AI Evaluation</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* AI Evaluation Scorecard */
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-6">
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-xl shadow-purple-600/20 text-white shrink-0">
                  <span className="text-2xl font-black">{evaluationResult.overall_score}</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">/ 100</span>
                </div>
                <div>
                  <Badge variant={evaluationResult.overall_score >= 70 ? 'success' : 'warning'} size="sm">
                    {evaluationResult.overall_score >= 70 ? 'Strong Interview Response' : 'Needs Polish & Structure'}
                  </Badge>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    AI Evaluation Scorecard
                  </h3>
                  <p className="text-xs text-slate-400">
                    {evaluationResult.feedback?.communication_quality}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEvaluationResult(null);
                  setStudentAnswer('');
                  setTimeElapsed(0);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 self-end sm:self-center cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Practice Again</span>
              </button>
            </div>

            {/* 4 Score Metrics Pillars (out of 10) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Relevance</p>
                <p className="text-xl font-black text-blue-400 mt-1">{evaluationResult.relevance_score} / 10</p>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clarity & Flow</p>
                <p className="text-xl font-black text-purple-400 mt-1">{evaluationResult.clarity_score} / 10</p>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Depth</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{evaluationResult.technical_score} / 10</p>
              </div>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confidence</p>
                <p className="text-xl font-black text-amber-400 mt-1">{evaluationResult.confidence_score} / 10</p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-2">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Strong Elements
                </h5>
                <div className="space-y-1.5 text-xs text-emerald-200">
                  {evaluationResult.feedback?.strengths?.map((s, i) => (
                    <p key={i}>• {s}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 space-y-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Suggestions to Improve
                </h5>
                <div className="space-y-1.5 text-xs text-amber-200">
                  {evaluationResult.feedback?.improvements?.map((imp, i) => (
                    <p key={i}>• {imp}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Answer vs Model Answer Comparison */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Your Answer vs Model Reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Your Answer:</p>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{evaluationResult.student_answer}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="font-bold text-purple-400 uppercase tracking-wider text-[10px] mb-2">Model Reference:</p>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{question.model_answer}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
