// src/hocs/withAuth.js
import { Navigate } from 'react-router-dom';

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const token = localStorage.getItem('token');
    // без токена – только на /login
    return token ? <Component {...props} /> : <Navigate to="/login" replace />;
  };
}