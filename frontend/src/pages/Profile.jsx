import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Calendar, Key } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                Role: {user?.role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined: {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-base font-bold text-slate-900">Security & Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Authentication Method</p>
                <p className="text-xs text-slate-500 mt-0.5">Secure JWT inside HTTP-only, SameSite Cookies</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Role-Based Access Control</p>
                <p className="text-xs text-slate-500 mt-0.5">Enforced across frontend routes and REST controllers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
