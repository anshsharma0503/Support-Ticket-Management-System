import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Ticket, PlusCircle, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTickets = async () => {
      try {
        const res = await api.get('/tickets/my?limit=5');
        if (res.data.success) {
          setTickets(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTickets();
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Portal Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status, submit new requests, and communicate with support engineers
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create Support Ticket
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{openTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{inProgressTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{resolvedTickets}</p>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent Support Tickets</h2>
          <Link
            to="/tickets"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 mt-2">Loading recent tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No tickets yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any tickets. Have an inquiry or need technical help?
            </p>
            <Link
              to="/tickets/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create First Ticket
            </Link>
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
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
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
                      <Link
                        to={`/tickets/${t._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
