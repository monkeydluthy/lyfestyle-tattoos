import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AdminSpinner() {
  return (
    <div className="admin-loading" role="status">
      <span className="admin-spinner" aria-hidden="true" />
      <span className="admin-sr">Loading</span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AdminSpinner />;

  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
