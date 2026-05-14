import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
