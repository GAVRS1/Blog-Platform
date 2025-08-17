import { Navigate } from 'react-router-dom';

export default function withAuth(Component) {
    return function ProtectedRoute(props) {
    const token = localStorage.getItem('token');
    return token ? <Component {...props} /> : <Navigate to="/login" replace />;
    };
}