import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LifeBuoy, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                QuickDesk
              </span>
              <span className="block text-[11px] font-medium text-slate-400 -mt-1 tracking-wide">
                SUPPORT PORTAL
              </span>
            </div>
          </Link>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm border border-blue-200">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      {user.role === 'ADMIN' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span className="text-indigo-600 font-semibold">Administrator</span>
                        </>
                      ) : (
                        'Customer'
                      )}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
