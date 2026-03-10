import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/superadmin" replace />;
    if (user.role === 'ADMIN')       return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
