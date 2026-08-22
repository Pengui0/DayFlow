import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthPage } from '../pages/auth/AuthPage';
import { useAuth } from '../hooks/useAuth';

// Lazy or direct page imports
import EmployeeDashboard from '../pages/dashboard/EmployeeDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ProfilePage from '../pages/profile/ProfilePage';
import AttendancePage from '../pages/attendance/AttendancePage';
import LeavePage from '../pages/leave/LeavePage';
import PayrollPage from '../pages/payroll/PayrollPage';
import ReportsPage from '../pages/reports/ReportsPage';
import EmployeesPage from '../pages/admin/EmployeesPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';

function DashboardIndex() {
  const { role } = useAuth();
  return role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
}

export function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/auth"
        element={session ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />
      <Route
        path="/signin"
        element={session ? <Navigate to="/dashboard" replace /> : <SignIn />}
      />
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/dashboard" replace /> : <SignUp />}
      />

      {/* Protected App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/payroll" element={<PayrollPage />} />

        {/* Admin-only Protected Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={session ? '/dashboard' : '/auth'} replace />} />
    </Routes>
  );
}
