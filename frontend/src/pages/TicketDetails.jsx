import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  AlertTriangle
} from 'lucide-react';

export const TicketDetails = () => {
  const { id } = useParams();
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit / Delete Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [updating, setUpdating] = useState(false);

  const fetchTicketAndComments = async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.data);
        setEditForm({
          title: ticketRes.data.data.title,
          description: ticketRes.data.data.description,
          category: ticketRes.data.data.category
        });
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load ticket details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketAndComments();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tickets/${id}/comments`, { message: newComment });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        showToast('Comment posted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    setUpdating(true);
    try {
      await api.delete(`/tickets/${id}`);
      showToast('Ticket deleted');
      navigate('/tickets');
    } catch (err) {
      showToast(err.message || 'Failed to delete ticket', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch(`/tickets/${id}`, editForm);
      if (res.data.success) {
        setTicket(res.data.data);
        setEditModal(false);
        showToast('Ticket updated successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update ticket', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400 mt-2">Loading ticket conversation...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-600 font-semibold">Ticket not found or access restricted.</p>
        <Link to="/tickets" className="text-sm text-blue-600 mt-2 inline-block">
          &larr; Back to tickets
        </Link>
      </div>
    );
  }

  const isOwner = ticket.createdBy?._id === user?._id;
  const canModify = isOwner && ticket.status === 'OPEN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>

        {canModify && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Ticket
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Ticket
            </button>
          </div>
        )}
      </div>

      {/* Ticket Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                {ticket.category}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p className="flex items-center gap-1 sm:justify-end">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {/* Submitter & Assigned Admin Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>
              Submitted by: <strong className="text-slate-800">{ticket.createdBy?.name}</strong> ({ticket.createdBy?.email})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>
              Assigned Engineer:{' '}
              {ticket.assignedAdmin ? (
                <strong className="text-slate-800">{ticket.assignedAdmin.name}</strong>
              ) : (
                <span className="text-slate-400 italic">Unassigned (Under queue triage)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Discussion & Comments Thread */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Communication & Comments</h2>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
            {comments.length}
          </span>
        </div>

        {/* Comments Chronological List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">
                No comments on this ticket yet. Add a message below to communicate with the team.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className={`p-4 rounded-2xl border transition-all ${
                  c.authorRole === 'ADMIN'
                    ? 'bg-indigo-50/40 border-indigo-100 ml-4 sm:ml-8'
                    : 'bg-slate-50 border-slate-200 mr-4 sm:mr-8'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {c.author?.name || 'User'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        c.authorRole === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.authorRole}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    • {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {c.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Add a Response</label>
          <textarea
            required
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your reply, updates, or additional information here..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submittingComment ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Ticket">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={updating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {updating ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Ticket Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
