import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    urgentPriority: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/tickets?limit=5')
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (ticketsRes.data.success) {
          setRecentTickets(ticketsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-2xl font-bold">Support Operations Overview</h1>
          <p className="text-slate-300 text-sm mt-0.5">
            Monitor real-time ticket triage, resolution metrics, and system activity logs
          </p>
        </div>
        <Link
          to="/admin/tickets"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          Manage All Tickets <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
            <Ticket className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
          <span className="text-xs text-slate-500 mt-1 block">All-time volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open (Unprocessed)</span>
            <Clock className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-extrabold text-sky-600">{stats.open}</p>
          <span className="text-xs text-sky-700 mt-1 block">Requires engineer review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{stats.inProgress}</p>
          <span className="text-xs text-amber-700 mt-1 block">Actively being worked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</p>
          <span className="text-xs text-emerald-700 mt-1 block">Successfully closed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High / Urgent</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600">
            {stats.highPriority + stats.urgentPriority}
          </p>
          <span className="text-xs text-rose-700 mt-1 block">Critical SLA focus</span>
        </div>
      </div>

      {/* Recent Tickets Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incoming Support Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recent tickets submitted across all users</p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Go to Management View &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 mt-2">Loading operations data...</p>
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No tickets in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Title</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Priority</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <p className="font-medium text-slate-800">{t.createdBy?.name}</p>
                      <p className="text-slate-400">{t.createdBy?.email}</p>
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
                      <Link
                        to={`/admin/tickets/${t._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Manage &rarr;
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
