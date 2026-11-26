import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ open: false, ticket: null });
  const [editModal, setEditModal] = useState({ open: false, ticket: null, title: '', description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useAuth();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (category) params.append('category', category);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/tickets/my?${params.toString()}`);
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleDeleteTicket = async () => {
    if (!deleteModal.ticket) return;
    setSubmitting(true);
    try {
      await api.delete(`/tickets/${deleteModal.ticket._id}`);
      showToast('Ticket deleted successfully');
      setDeleteModal({ open: false, ticket: null });
      fetchTickets();
    } catch (err) {
      showToast(err.message || 'Failed to delete ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/tickets/${editModal.ticket._id}`, {
        title: editModal.title,
        description: editModal.description,
        category: editModal.category
      });
      showToast('Ticket updated successfully');
      setEditModal({ open: false, ticket: null, title: '', description: '', category: '' });
      fetchTickets();
    } catch (err) {
      showToast(err.message || 'Failed to update ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (ticket) => {
    setEditModal({
      open: true,
      ticket,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Support Tickets</h1>
          <p className="text-sm text-slate-500">
            View, search, filter and manage all your submitted requests
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket title or description..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Billing">Billing</option>
            <option value="Account">Account</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Other">Other</option>
          </select>

          {(status || priority || category || search) && (
            <button
              onClick={() => {
                setStatus('');
                setPriority('');
                setCategory('');
                setSearch('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 mt-2">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-600 font-medium">No tickets match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Title</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Priority</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Created Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 block max-w-sm truncate"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/tickets/${t._id}`}
                          title="View Ticket"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Can edit only when status is OPEN */}
                        {t.status === 'OPEN' && (
                          <button
                            onClick={() => openEditModal(t)}
                            title="Edit Ticket"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Can delete only when status is OPEN */}
                        {t.status === 'OPEN' && (
                          <button
                            onClick={() => setDeleteModal({ open: true, ticket: t })}
                            title="Delete Ticket"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total tickets)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, ticket: null })}
        title="Delete Support Ticket"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Are you sure you want to delete this ticket?</p>
              <p className="mt-1 text-rose-700 text-xs">
                "{deleteModal.ticket?.title}" and all its discussion comments will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModal({ open: false, ticket: null })}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTicket}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, ticket: null, title: '', description: '', category: '' })}
        title="Edit Support Ticket"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={editModal.title}
              onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={editModal.category}
              onChange={(e) => setEditModal({ ...editModal, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Technical Issue">Technical Issue</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={editModal.description}
              onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModal({ open: false, ticket: null, title: '', description: '', category: '' })}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
