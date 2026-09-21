import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * PrivateRoute — wraps a set of routes that require authentication.
 *
 * While the auth state is being resolved (loading === true), renders a
 * full-screen centred loading indicator so there is no flash-of-redirect.
 * Once resolved:
 *   - authenticated  → renders the matched child route via <Outlet />
 *   - unauthenticated → redirects to /login
 */
export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-eco-green-600 text-lg font-medium">Loading…</span>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
