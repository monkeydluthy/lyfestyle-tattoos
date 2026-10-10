import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import './admin.css';

const Login = lazy(() => import('./Login'));
const Dashboard = lazy(() => import('./Dashboard'));
const Upload = lazy(() => import('./Upload'));
const Works = lazy(() => import('./Works'));

function AdminSpinner() {
  return (
    <div className="admin-loading" role="status">
      <span className="admin-spinner" aria-hidden="true" />
      <span className="admin-sr">Loading</span>
    </div>
  );
}

function AdminRobots() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const created = !existing;
    const meta = existing || document.createElement('meta');
    if (created) {
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previous = created ? null : meta.getAttribute('content');
    meta.setAttribute('content', 'noindex,nofollow');
    return () => {
      if (created) {
        meta.remove();
        return;
      }
      if (previous == null) meta.removeAttribute('content');
      else meta.setAttribute('content', previous);
    };
  }, []);

  return null;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="works"
        element={
          <ProtectedRoute>
            <Works />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function AdminApp() {
  return (
    <AuthProvider>
      <AdminRobots />
      <div className="admin-shell">
        <Suspense fallback={<AdminSpinner />}>
          <AdminRoutes />
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default AdminApp;
