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
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary justify-center">Регистрация</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { name: 'username', label: 'Никнейм', type: 'text' },
              { name: 'fullName', label: 'Имя и фамилия', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Пароль', type: 'password' },
              { name: 'birthDate', label: 'Дата рождения', type: 'date' },
            ].map((f) => (
              <label key={f.name} className="form-control">
                <span className="label-text">{f.label}</span>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  required={f.name !== 'bio'}
                  className="input input-bordered input-primary"
                />
                {errors[f.name] && (
                  <span className="text-error text-xs">{errors[f.name]}</span>
                )}
              </label>
            ))}
            <label className="form-control">
              <span className="label-text">О себе</span>
              <textarea
                name="bio"
                rows={3}
                value={form.bio}
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