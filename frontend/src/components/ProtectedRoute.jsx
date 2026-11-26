import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading, toast, showToast } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
              403
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-sm text-slate-600 mb-6">
              You do not have the required permissions ({requiredRole}) to view this resource.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <Toast toast={toast} />
    </div>
  );
};
