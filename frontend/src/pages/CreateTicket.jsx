import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Technical Issue',
  'Billing',
  'Account',
  'General Inquiry',
  'Other'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/tickets', {
        title,
        category,
        priority,
        description
      });

      if (res.data.success) {
        showToast('Ticket created successfully!', 'success');
        navigate(`/tickets/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/tickets"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Support Ticket</h1>
          <p className="text-sm text-slate-500">
            Submit your issue or question. Our engineering support team will assist you.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ticket Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot process credit card payment on checkout"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail, steps to reproduce, or any error messages received..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Minimum 10 characters.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/tickets"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
