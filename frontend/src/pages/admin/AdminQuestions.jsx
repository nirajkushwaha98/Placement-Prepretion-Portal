import React, { useState, useEffect } from 'react';
import { adminService, aptitudeService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  HelpCircle, Plus, Search, Filter, Edit, Trash2,
  CheckCircle2, BookOpen, Calculator
} from 'lucide-react';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    topic: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_option_index: 0,
    explanation: '',
    difficulty: 'MEDIUM',
    marks: 1,
    negative_marks: 0.25,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const loadCategories = async () => {
    try {
      const res = await aptitudeService.getCategories();
      const catList = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.results || []);
      setCategories(catList);
      if (catList.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: catList[0].id }));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await aptitudeService.getQuestions(params);
      const qList = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.results || []);
      setQuestions(qList);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      category: categories[0]?.id || '',
      topic: '',
      question_text: '',
      options: ['', '', '', ''],
      correct_option_index: 0,
      explanation: '',
      difficulty: 'MEDIUM',
      marks: 1,
      negative_marks: 0.25,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category || categories[0]?.id,
      topic: q.topic || '',
      question_text: q.question_text || '',
      options: q.options || ['', '', '', ''],
      correct_option_index: q.correct_option_index ?? 0,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
      marks: q.marks || 1,
      negative_marks: q.negative_marks || 0.25,
    });
    setIsModalOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index] = value;
    setFormData({ ...formData, options: updated });
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingQuestion) {
        await adminService.updateQuestion(editingQuestion.id, formData);
      } else {
        await adminService.createQuestion(formData);
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await adminService.deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-400" />
            Aptitude Questions Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, categorize, edit options, and set detailed solutions for quantitative, logical, verbal, and DI questions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchQuestions(); }} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text or topic..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Question Bank ({questions.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching question repository..." size="lg" />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No questions found"
            actionLabel="Add Question"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={q.difficulty} size="xs">{q.difficulty}</Badge>
                    <span className="text-xs font-semibold text-indigo-400">{q.category_name}</span>
                    <span className="text-xs text-slate-400">• {q.topic}</span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    {q.options?.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-1.5 rounded-lg border ${
                          q.correct_option_index === i
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
                            : 'border-slate-800/80 bg-slate-900/50 text-slate-400'
                        }`}
                      >
                        <span className="font-bold mr-1">{String.fromCharCode(65 + i)}:</span> {opt}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-slate-400 italic pt-1 line-clamp-1">
                      <strong className="text-slate-300 not-italic">Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Aptitude Question' : 'Add New Aptitude Question'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Topic</label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Percentages / Syllogisms"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Question Text</label>
            <textarea
              rows={3}
              required
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Enter question statement..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 4 Options */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">Options & Correct Answer Selection</label>
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct_option"
                  checked={formData.correct_option_index === i}
                  onChange={() => setFormData({ ...formData, correct_option_index: i })}
                  className="cursor-pointer"
                />
                <span className="font-bold w-4">{String.fromCharCode(65 + i)}</span>
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Detailed Explanation</label>
            <textarea
              rows={3}
              required
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Step-by-step formula and solution..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Marks</label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Negative Marks</label>
              <input
                type="number"
                step="0.05"
                value={formData.negative_marks}
                onChange={(e) => setFormData({ ...formData, negative_marks: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminQuestions;
