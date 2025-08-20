import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const debouncedCheckUsername = debounce(async (value) => {
    if (!value) return;
    const ok = await checkUniqueUsername(value);
    setErrors((e) => ({ ...e, username: ok ? '' : 'Никнейм занят' }));
  }, 500);

  const debouncedCheckEmail = debounce(async (value) => {
    if (!value) return;
    const ok = await checkUniqueEmail(value);
    setErrors((e) => ({ ...e, email: ok ? '' : 'Email занят' }));
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'username') debouncedCheckUsername(value);
    if (name === 'email') debouncedCheckEmail(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (errors.username || errors.email) return;
    try {
      await authService.register(form);
      toast.success('Регистрация успешна!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-12 px-4">
      <motion.div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Регистрация
          </h2>
          <p className="text-gray-600">
            Создайте свой аккаунт в BlogPlatform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold"
            >
              Создать аккаунт
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary hover:text-secondary font-semibold">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}