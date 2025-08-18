import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Ошибка входа';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary justify-center">Вход</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="form-control">
              <span className="label-text">Email</span>
              <input
                type="email"
                className="input input-bordered input-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text">Пароль</span>
              <input
                type="password"
                className="input input-bordered input-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Нет аккаунта?{' '}
            <Link to="/register" className="link link-primary">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}