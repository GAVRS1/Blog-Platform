// src/pages/RegisterPage.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth';
import { checkUniqueUsername, checkUniqueEmail } from '@/utils/uniqueCheck';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    birthDate: '',
    bio: '',
  });
  const [errors, setErrors] = useState({ username: '', email: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedCheckUsername = debounce(async (value) => {
    if (!value) return;
    const ok = await checkUniqueUsername(value);
    setErrors((e) => ({ ...e, username: ok ? '' : 'Никнейм занят' }));
  }, 500);

  const debouncedCheckEmail = debounce(async (value) => {
    if (!value) return;
    const ok = await checkUniqueEmail(value);
    setErrors((e) => ({ ...e, email: ok ? '' : 'Email уже используется' }));
  }, 500);

  useEffect(() => {
    if (form.username) debouncedCheckUsername(form.username);
  }, [form.username]);

  useEffect(() => {
    if (form.email) debouncedCheckEmail(form.email);
  }, [form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (errors.username || errors.email) {
      toast.error('Исправьте ошибки в форме');
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Аккаунт создан!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-4">
      <motion.div
        className="card bg-base-100/80 backdrop-blur-sm shadow-2xl w-full max-w-lg border border-base-300/50"
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
            <h1 className="text-3xl font-bold text-primary mb-2">Регистрация</h1>
            <p className="text-base-content/60">Создайте свой аккаунт</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                className="form-control"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="label">
                  <span className="label-text text-base-content font-medium">Полное имя</span>
                </label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  className="input input-bordered bg-base-100 border-base-300 focus:border-primary text-base-content"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </motion.div>

              <motion.div
                className="form-control"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="label">
                  <span className="label-text text-base-content font-medium">Никнейм</span>
                </label>
                <input
                  type="text"
                  placeholder="username"
                  className={`input input-bordered bg-base-100 border-base-300 focus:border-primary text-base-content ${
                    errors.username ? 'input-error' : ''
                  }`}
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                />
                {errors.username && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.username}</span>
                  </label>
                )}
              </motion.div>
            </div>

            <motion.div
              className="form-control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className={`input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-base-content ${
                  errors.email ? 'input-error' : ''
                }`}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </motion.div>

            <motion.div
              className="form-control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">Пароль</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary text-base-content pr-12"
                  value={form.password}
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

            <motion.div
              className="form-control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">Дата рождения</span>
              </label>
              <input
                type="date"
                className="input input-bordered bg-base-100 border-base-300 focus:border-primary text-base-content"
                value={form.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
            </motion.div>

            <motion.div
              className="form-control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="label">
                <span className="label-text text-base-content font-medium">О себе</span>
              </label>
              <textarea
                placeholder="Расскажите о себе..."
                className="textarea textarea-bordered bg-base-100 border-base-300 focus:border-primary text-base-content"
                rows="3"
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              ></textarea>
            </motion.div>

            <motion.button
              type="submit"
              className="btn btn-primary w-full text-white font-medium shadow-lg hover:shadow-xl mt-6"
              disabled={loading || errors.username || errors.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Создаем аккаунт...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Зарегистрироваться
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            className="divider text-base-content/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            или
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-base-content/60">
              Уже есть аккаунт?{' '}
              <Link 
                to="/login" 
                className="link link-primary font-medium hover:text-primary/80"
              >
                Войти
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}