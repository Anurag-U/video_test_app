import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDemoAuth } from '../hooks/useDemoAuth.jsx';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  // Use appropriate auth hook based on mode
  let isAuthenticated, user, loading;

  try {
    if (isDemoMode) {
      const demoAuth = useDemoAuth();
      isAuthenticated = demoAuth.isAuthenticated;
      user = demoAuth.user;
      loading = demoAuth.loading;
    } else {
      const auth = useAuth();
      isAuthenticated = auth.isAuthenticated;
      user = auth.user;
      loading = auth.loading;
    }
  } catch (error) {
    // If there's an error with auth context, redirect to appropriate login
    const redirectPath = isDemoMode ? "/demo" : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = isDemoMode ? "/demo" : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
