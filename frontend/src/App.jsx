import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { UserDashboard } from './pages/UserDashboard';
import { MyTickets } from './pages/MyTickets';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetails } from './pages/TicketDetails';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminTicketDetails } from './pages/admin/AdminTicketDetails';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect based on user state */}
          <Route path="/" element={<HomeRedirect />} />

          {/* User / Customer Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/tickets/new" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Administrator Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/tickets/:id" element={<AdminTicketDetails />} />
            <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          </Route>

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
