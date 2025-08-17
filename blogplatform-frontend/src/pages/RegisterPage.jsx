import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      await authService.register(form);
      toast.success('Регистрация успешна!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data || 'Ошибка регистрации');
    }
  };

  return (
    <div className="form-page">
      <h2>Регистрация</h2>
      <form onSubmit={handleRegister}>
        <input name="username" placeholder="Никнейм" required onChange={handleChange} />
        <input name="fullName" placeholder="Имя и фамилия" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Пароль" required onChange={handleChange} />
        <input name="birthDate" type="date" required onChange={handleChange} />
        <textarea name="bio" placeholder="О себе" rows={3} onChange={handleChange} />
        <button type="submit">Создать аккаунт</button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}