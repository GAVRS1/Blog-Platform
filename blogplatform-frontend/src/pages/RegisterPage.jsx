import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Валидация полей
      if (!form.email || !form.password || !form.username) {
        toast.error('Заполните все обязательные поля');
        return;
      }

      if (form.password.length < 6) {
        toast.error('Пароль должен содержать не менее 6 символов');
        return;
      }

      // Регистрация пользователя
      await authService.register(form);
      toast.success('Регистрация успешна!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Ошибка регистрации';
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary justify-center">Регистрация</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <label className="form-control">
              <span className="label-text">Никнейм</span>
              <input
                type="text"
                name="username"
                required
                onChange={handleChange}
                className="input input-bordered input-primary"
              />
            </label>

            <label className="form-control">
              <span className="label-text">Имя и фамилия</span>
              <input
                type="text"
                name="fullName"
                required
                onChange={handleChange}
                className="input input-bordered input-primary"
              />
            </label>

            <label className="form-control">
              <span className="label-text">Email</span>
              <input
                type="email"
                name="email"
                required
                onChange={handleChange}
                className="input input-bordered input-primary"
              />
            </label>

            <label className="form-control">
              <span className="label-text">Пароль</span>
              <input
                type="password"
                name="password"
                required
                onChange={handleChange}
                className="input input-bordered input-primary"
              />
            </label>

            <label className="form-control">
              <span className="label-text">Дата рождения</span>
              <input
                type="date"
                name="birthDate"
                required
                onChange={handleChange}
                className="input input-bordered input-primary"
              />
            </label>

            <label className="form-control">
              <span className="label-text">О себе</span>
              <textarea
                name="bio"
                rows={3}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary"
              />
            </label>

            <button type="submit" className="btn btn-primary w-full">
              Зарегистрироваться
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="link link-primary">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}