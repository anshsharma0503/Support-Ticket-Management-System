import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  MessageSquare,
  Activity,
  Send
} from 'lucide-react';

export const AdminTicketDetails = () => {
  const { id } = useParams();
  const { showToast } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'logs'
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingField, setUpdatingField] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const [ticketRes, commentsRes, logsRes] = await Promise.all([
        api.get(`/admin/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/admin/tickets/${id}/activity-logs`)
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.data);
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.data);
      }
      if (logsRes.data.success) {
        setActivityLogs(logsRes.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load ticket management details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingField(true);
    try {
      const res = await api.patch(`/admin/tickets/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setTicket(res.data.data);
        showToast(`Status updated to ${newStatus}`);
        // Refresh logs to show the new event
        const logsRes = await api.get(`/admin/tickets/${id}/activity-logs`);
        if (logsRes.data.success) setActivityLogs(logsRes.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingField(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setUpdatingField(true);
    try {
      const res = await api.patch(`/admin/tickets/${id}/priority`, { priority: newPriority });
      if (res.data.success) {
        setTicket(res.data.data);
        showToast(`Priority updated to ${newPriority}`);
        const logsRes = await api.get(`/admin/tickets/${id}/activity-logs`);
        if (logsRes.data.success) setActivityLogs(logsRes.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update priority', 'error');
    } finally {
      setUpdatingField(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tickets/${id}/comments`, { message: newComment });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        showToast('Official response posted');
        const logsRes = await api.get(`/admin/tickets/${id}/activity-logs`);
        if (logsRes.data.success) setActivityLogs(logsRes.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to post response', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400 mt-2">Loading ticket workspace...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-600 font-semibold">Ticket not found.</p>
        <Link to="/admin/tickets" className="text-sm text-indigo-600 mt-2 inline-block">
          &larr; Back to all tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ticket Queue
        </Link>
      </div>

      {/* Ticket Management Header */}
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

        {/* Administrative Triage Controls */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Update Status:
            </span>
            <select
              disabled={updatingField}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Update Priority:
            </span>
            <select
              disabled={updatingField}
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Issue Description
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {/* Submitter Info */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>
            Submitted by: <strong className="text-slate-800">{ticket.createdBy?.name}</strong> (
            {ticket.createdBy?.email})
          </span>
        </div>
      </div>

      {/* Tabs: Comments vs Activity Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments & Discussion ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Event Activity Audit Trail ({activityLogs.length})
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'comments' ? (
            <div className="space-y-6">
              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-6">
                    No comments on this ticket yet.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className={`p-4 rounded-2xl border ${
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
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          • {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Admin Comment Form */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Post Official Engineer Response
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Provide resolution steps, status update, or follow-up question for the user..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {submittingComment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Activity Logs Timeline */
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No activity logged for this ticket.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log._id} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">{log.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>Actor: {log.actor?.name}</span>
                        <span>• Role: {log.actorRole}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
