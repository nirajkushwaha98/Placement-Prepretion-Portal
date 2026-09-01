import React, { useState, useEffect } from 'react';
import { adminService, codingService } from '../../api/services';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Terminal, Plus, Search, Edit, Trash2,
  Code2, CheckCircle2, AlertTriangle, Play
} from 'lucide-react';

const AdminCoding = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'MEDIUM',
    tags: 'Arrays, Two Pointers',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    sample_explanation: '',
    points: 50,
    test_cases: [
      { input: '', output: '', is_hidden: false },
      { input: '', output: '', is_hidden: true },
    ],
  });

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await codingService.getProblems(params);
      setProblems(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProblem(null);
    setFormData({
      title: '',
      slug: '',
      difficulty: 'MEDIUM',
      tags: 'Arrays, Dynamic Programming',
      description: '',
      input_format: '',
      output_format: '',
      constraints: '',
      sample_input: '',
      sample_output: '',
      sample_explanation: '',
      points: 50,
      test_cases: [
        { input: '', output: '', is_hidden: false },
        { input: '', output: '', is_hidden: true },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProblem(p);
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      difficulty: p.difficulty || 'MEDIUM',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
      description: p.description || '',
      input_format: p.input_format || '',
      output_format: p.output_format || '',
      constraints: p.constraints || '',
      sample_input: p.sample_input || '',
      sample_output: p.sample_output || '',
      sample_explanation: p.sample_explanation || '',
      points: p.points || 50,
      test_cases: p.test_cases || [
        { input: p.sample_input, output: p.sample_output, is_hidden: false }
      ],
    });
    setIsModalOpen(true);
  };

  const handleAddTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [...formData.test_cases, { input: '', output: '', is_hidden: true }],
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...formData.test_cases];
    updated[index][field] = value;
    setFormData({ ...formData, test_cases: updated });
  };

  const handleRemoveTestCase = (index) => {
    setFormData({
      ...formData,
      test_cases: formData.test_cases.filter((_, i) => i !== index),
    });
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const parsedTags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: parsedTags,
      };

      if (editingProblem) {
        await adminService.updateProblem(editingProblem.id, payload);
      } else {
        await adminService.createProblem(payload);
      }
      setIsModalOpen(false);
      fetchProblems();
    } catch (err) {
      console.error('Error saving problem:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coding problem?')) return;
    try {
      await adminService.deleteProblem(id);
      fetchProblems();
    } catch (err) {
      console.error('Error deleting problem:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Terminal className="h-6 w-6 text-blue-400" />
            Coding Problems Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, update problem descriptions, constraints, sample inputs, and hidden test cases.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Coding Problem</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchProblems(); }} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </form>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Problems List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Problem Bank ({problems.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching coding challenges..." size="lg" />
        ) : problems.length === 0 ? (
          <EmptyState
            icon={Terminal}
            title="No problems found"
            actionLabel="Add Problem"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={p.difficulty} size="xs">{p.difficulty}</Badge>
                    <span className="text-xs font-bold text-white">{p.title}</span>
                    <span className="text-xs text-slate-400">• {p.points} pts</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{p.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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
        title={editingProblem ? 'Edit Coding Problem' : 'Add New Coding Problem'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitProblem} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Valid Anagram"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Difficulty & Points</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Arrays, Two Pointers, Dynamic Programming"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Problem Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State the algorithmic problem clearly..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Sample Input</label>
              <textarea
                rows={2}
                value={formData.sample_input}
                onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                className="w-full font-mono rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Sample Output</label>
              <textarea
                rows={2}
                value={formData.sample_output}
                onChange={(e) => setFormData({ ...formData, sample_output: e.target.value })}
                className="w-full font-mono rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Test cases */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Test Cases for Judge0</label>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="px-2.5 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                + Add Test Case
              </button>
            </div>

            {formData.test_cases.map((tc, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                  className="flex-1 font-mono rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Expected Output"
                  value={tc.output}
                  onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                  className="flex-1 font-mono rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200"
                />
                <label className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                  <input
                    type="checkbox"
                    checked={tc.is_hidden}
                    onChange={(e) => handleTestCaseChange(idx, 'is_hidden', e.target.checked)}
                  />
                  Hidden
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveTestCase(idx)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoding;
