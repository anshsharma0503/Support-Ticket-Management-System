import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Activity,
  UserCheck,
  Shield,
  LifeBuoy
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tickets', path: '/tickets', icon: Ticket },
    { name: 'New Ticket', path: '/tickets/new', icon: PlusCircle },
    { name: 'Profile', path: '/profile', icon: UserCheck }
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Tickets', path: '/admin/tickets', icon: Ticket },
    { name: 'Activity Audit Logs', path: '/admin/activity-logs', icon: Activity },
    { name: 'My Tickets (User)', path: '/tickets', icon: LifeBuoy },
    { name: 'Profile', path: '/profile', icon: UserCheck }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      {isAdmin && (
        <div className="mb-4 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-700 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          <span>Admin Workspace Active</span>
        </div>
      )}

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 mt-auto">
        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-0.5">QuickDesk v1.0</p>
          <p>Production Ready System</p>
        </div>
      </div>
    </aside>
  );
};
