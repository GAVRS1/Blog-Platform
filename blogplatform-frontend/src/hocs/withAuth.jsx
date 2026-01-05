// src/hocs/withAuth.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user } = useAuth();

    if (user === undefined) {
      return (
        <div className="flex w-full items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" aria-label="Загрузка профиля"></span>
        </div>
      );
    }

    // без токена – только на /login
    return user ? <Component {...props} /> : <Navigate to="/login" replace />;
  };
}
