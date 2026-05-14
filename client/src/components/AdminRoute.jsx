import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading && !user) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
