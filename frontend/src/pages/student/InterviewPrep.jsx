import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  MessageSquare, UserCheck, Code, Users, FileText,
  Terminal, Building, Sparkles, CheckCircle2, ChevronRight,
  BookOpen, Play, Search, History
} from 'lucide-react';

const iconMap = {
  UserCheck, Code, Users, FileText, Terminal, Building, MessageSquare
};

const InterviewPrep = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Model answer modal
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    loadCategoriesAndHistory();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, search]);

  const loadCategoriesAndHistory = async () => {
    try {
      setLoading(true);
      const [catRes, histRes] = await Promise.all([
        interviewService.getCategories(),
        interviewService.getHistory(),
      ]);
      const catList = Array.isArray(catRes?.data)
        ? catRes.data
        : (catRes?.data?.results || []);
      const histList = Array.isArray(histRes?.data)
        ? histRes.data
        : (histRes?.data?.results || []);

      setCategories(catList);
      if (catList.length > 0 && !selectedCategory) {
        setSelectedCategory(catList[0].id);
      }
      setHistory(histList);
    } catch (err) {
      console.error('Error loading interview data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const res = await interviewService.getQuestions(params);
      const qList = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.results || []);
      setQuestions(qList);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading interview question bank..." size="lg" />;
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-purple-400" />
          Interview Preparation & AI Mock Evaluator
        </h1>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || MessageSquare;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded bg-slate-950/40">
                {cat.question_count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Question Bank & Practice Simulator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Available Questions ({questions.length})
          </h3>
        </div>

        {questions.length === 0 ? (
          <EmptyState title="No questions found in this category." />
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={q.difficulty} size="xs">
                      {q.difficulty}
                    </Badge>
                    <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {q.company_tag || 'General'}
                    </span>
                    <span className="text-xs text-slate-400">{q.category_name}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {q.tips && (
                    <p className="text-xs text-slate-400 line-clamp-1 italic">
                      <strong className="text-slate-300 not-italic">Strategy Tip:</strong> {q.tips}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setActiveQuestion(q)}
                    className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                    <span>Model Answer</span>
                  </button>

                  <button
                    onClick={() => navigate(`/interview/practice/${q.id}`)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Practice AI Mock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Answer Modal */}
      <Modal
        isOpen={!!activeQuestion}
        onClose={() => setActiveQuestion(null)}
        title="Model Answer & Recommended Strategy"
        maxWidth="max-w-2xl"
      >
        {activeQuestion && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                {activeQuestion.category_name} • {activeQuestion.company_tag}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {activeQuestion.question}
              </h4>
            </div>

            <div>
              <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Ideal Model Response
              </h5>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line">
                {activeQuestion.model_answer}
              </div>
            </div>

            {activeQuestion.tips && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 leading-relaxed">
                <strong className="text-blue-400 font-bold block mb-1">Answering Strategy:</strong>
                {activeQuestion.tips}
              </div>
            )}

            {activeQuestion.key_talking_points?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Key Points to Cover:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeQuestion.key_talking_points.map((pt, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  const qId = activeQuestion.id;
                  setActiveQuestion(null);
                  navigate(`/interview/practice/${qId}`);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                Practice This Question Now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewPrep;
