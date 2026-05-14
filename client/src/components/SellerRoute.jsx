import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function SellerRoute({ children }) {
  const { user } = useAuthStore();
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  return children;
}
