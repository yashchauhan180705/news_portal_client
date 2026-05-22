import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader text="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin routes accessible by both admin and employee
  if (adminOnly && user.role !== 'admin' && user.role !== 'employee') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
