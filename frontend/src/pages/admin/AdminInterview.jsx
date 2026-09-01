import React, { useState, useEffect } from 'react';
import { adminService, interviewService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  MessageCircle, Plus, Search, Edit, Trash2,
  BookOpen, Sparkles
} from 'lucide-react';

const AdminInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    model_answer: '',
    tips: '',
    key_talking_points: 'Technical concept, Trade-offs, Real-world example',
    difficulty: 'MEDIUM',
    company_tag: 'General',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await interviewService.getCategories();
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

      const res = await interviewService.getQuestions(params);
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
      question: '',
      model_answer: '',
      tips: '',
      key_talking_points: 'Key point 1, Key point 2, Key point 3',
      difficulty: 'MEDIUM',
      company_tag: 'General',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category || categories[0]?.id,
      question: q.question || '',
      model_answer: q.model_answer || '',
      tips: q.tips || '',
      key_talking_points: Array.isArray(q.key_talking_points) ? q.key_talking_points.join(', ') : q.key_talking_points || '',
      difficulty: q.difficulty || 'MEDIUM',
      company_tag: q.company_tag || 'General',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const points = formData.key_talking_points
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        key_talking_points: points,
      };

      if (editingQuestion) {
        await adminService.updateInterviewQuestion(editingQuestion.id, payload);
      } else {
        await adminService.createInterviewQuestion(payload);
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
    if (!window.confirm('Delete this interview question?')) return;
    try {
      await adminService.deleteInterviewQuestion(id);
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting interview question:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-purple-400" />
            Interview Questions Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage HR, technical, behavioral, and company-specific interview prompts with reference model answers.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Interview Question</span>
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
            placeholder="Search interview questions..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </form>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-purple-500 focus:outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Question List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interview Question Bank ({questions.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching interview prompts..." size="lg" />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
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
                    <span className="text-xs font-bold text-purple-400">{q.category_name}</span>
                    <span className="text-xs text-slate-400">• Tag: {q.company_tag}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-relaxed">
                    {q.question}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <strong className="text-purple-400">Model Answer:</strong> {q.model_answer}
                  </p>
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Interview Question' : 'Add Interview Question'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Target Tag</label>
              <input
                type="text"
                value={formData.company_tag}
                onChange={(e) => setFormData({ ...formData, company_tag: e.target.value })}
                placeholder="e.g. Google / Amazon / General"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Question Prompt</label>
            <textarea
              rows={2}
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Explain how database indexing works internally."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Reference Model Answer</label>
            <textarea
              rows={4}
              required
              value={formData.model_answer}
              onChange={(e) => setFormData({ ...formData, model_answer: e.target.value })}
              placeholder="High quality reference explanation..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Answering Strategy / Tips</label>
            <input
              type="text"
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="e.g. Use STAR method and highlight quantifiable metrics"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Key Talking Points (comma separated)</label>
            <input
              type="text"
              value={formData.key_talking_points}
              onChange={(e) => setFormData({ ...formData, key_talking_points: e.target.value })}
              placeholder="B-Tree structure, O(log N) lookups, Write overhead"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInterview;
