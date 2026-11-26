import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
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

      const res = await api.get(`/admin/tickets?${params.toString()}`);
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch admin tickets:', err);
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

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      fetchTickets();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/priority`, { priority: newPriority });
      showToast(`Priority updated to ${newPriority}`);
      fetchTickets();
    } catch (err) {
      showToast(err.message || 'Failed to update priority', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Support Tickets</h1>
        <p className="text-sm text-slate-500">
          Admin overview: view, triage, assign, and update status/priority for all customer tickets
        </p>
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
              placeholder="Search by ticket title, description, or keyword..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500"
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
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500"
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
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500"
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

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 mt-2">Loading ticket records...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-medium">
            No tickets match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Title</th>
                  <th className="px-6 py-3.5 font-semibold">Customer</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Priority</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Created Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/tickets/${t._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 block max-w-xs truncate"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-800">{t.createdBy?.name}</p>
                      <p className="text-slate-400">{t.createdBy?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.priority}
                        onChange={(e) => handlePriorityChange(t._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-slate-200 font-medium bg-white focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-slate-200 font-semibold bg-white focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/tickets/${t._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </Link>
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
