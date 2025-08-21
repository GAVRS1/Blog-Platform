// src/pages/LoginPage.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка входа';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-4">
      <motion.div
        className="card bg-base-100/80 backdrop-blur-sm shadow-2xl w-full max-w-md border border-base-300/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body p-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-primary mb-2">Вход</h1>
            <p className="text-base-content/60">Добро пожаловать обратно!</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="form-control"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-base-content"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              className="form-control"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">Пароль</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-base-content pr-12"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="btn btn-primary w-full text-white font-medium shadow-lg hover:shadow-xl"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Входим...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Войти
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            className="divider text-base-content/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            или
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-base-content/60">
              Нет аккаунта?{' '}
              <Link 
                to="/register" 
                className="link link-primary font-medium hover:text-primary/80"
              >
                Зарегистрироваться
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}