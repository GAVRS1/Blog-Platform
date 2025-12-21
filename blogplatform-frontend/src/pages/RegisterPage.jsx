// src/pages/RegisterPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth';
import { checkUniqueEmail, checkUniqueUsername } from '@/utils/uniqueCheck';
import AvatarUploader from '@/components/AvatarUploader';
import toast from 'react-hot-toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1 } };

export default function RegisterPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [emailOk, setEmailOk] = useState(null); // null | true | false

  const [profile, setProfile] = useState({
    username: '',
    password: '',
    fullName: '',
    birthDate: '',
    bio: '',
    profilePictureUrl: '',
  });
  const [usernameOk, setUsernameOk] = useState(null);

  // валидации с защитой от лишних запросов
  async function validateUsername(value) {
    const username = value?.trim();
    if (!username) return setUsernameOk(null);
    try {
      const ok = await checkUniqueUsername(username);
      // Обновляем только если значение не поменялось за время запроса
      if (profile.username.trim() === username) {
        setUsernameOk(ok);
      }
    } catch {
      setUsernameOk(null);
    }
  }
  async function validateEmail(value) {
    const emailToCheck = value?.trim();
    if (!emailToCheck) return setEmailOk(null);
    try {
      const ok = await checkUniqueEmail(emailToCheck);
      if (email.trim() === emailToCheck) {
        setEmailOk(ok);
      }
    } catch {
      setEmailOk(null);
    }
  }

  useEffect(() => {
    if (!profile.username.trim()) {
      setUsernameOk(null);
      return;
    }
    const t = setTimeout(() => validateUsername(profile.username), 400);
    return () => clearTimeout(t);
  }, [profile.username]);

  useEffect(() => {
    if (!email.trim()) {
      setEmailOk(null);
      return;
    }
    const t = setTimeout(() => validateEmail(email), 400);
    return () => clearTimeout(t);
  }, [email]);

  const onAvatarUploaded = (url) => {
    setProfile((p) => ({ ...p, profilePictureUrl: url }));
  };

  function buildPayload() {
    // Собираем только непустые поля — это критично,
    // чтобы бэкенд не падал на null/"" в необязательных свойствах
    const trimmedEmail = email.trim();
    const trimmedUsername = profile.username.trim();
    const p = {
      email: trimmedEmail,
      password: profile.password,
      username: trimmedUsername,
    };
    if (profile.fullName) p.fullName = profile.fullName;
    if (profile.bio) p.bio = profile.bio;
    if (profile.profilePictureUrl) p.profilePictureUrl = profile.profilePictureUrl;
    if (profile.birthDate) {
      // birthDate приходит в формате YYYY-MM-DD -> переводим к ISO
      // OpenAPI ожидает "date-time" — допустим 00:00Z
      try {
        const iso = new Date(profile.birthDate).toISOString();
        p.birthDate = iso;
      } catch {
        // игнорируем некорректную дату
      }
    }
    return p;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Введите email');
    if (!profile.username || !profile.password) return toast.error('Укажите логин и пароль');

    if (emailOk === false) return toast.error('Email уже занят');
    if (usernameOk === false) return toast.error('Имя пользователя занято');

    setLoading(true);
    try {
      const payload = buildPayload();
      await authService.register(payload);

      toast.success('Регистрация выполнена. Проверьте почту и подтвердите email.');
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Ошибка регистрации';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-base-200 p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="card w-full max-w-xl shadow-xl bg-base-100">
        <div className="card-body p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">Регистрация</h1>
            <p className="text-base-content/60 mt-2">Создайте аккаунт</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`input input-bordered ${emailOk === false ? 'input-error' : ''}`}
                required
              />
              {emailOk === false && (
                <label className="label">
                  <span className="label-text-alt text-error">Email занят</span>
                </label>
              )}
            </div>

            {/* Username / Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Имя пользователя</span></label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                  className={`input input-bordered ${usernameOk === false ? 'input-error' : ''}`}
                  placeholder="username"
                  required
                />
                {usernameOk === false && (
                  <label className="label">
                    <span className="label-text-alt text-error">Имя занято</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Пароль</span></label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                  className="input input-bordered"
                  placeholder="●●●●●●●●"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Полное имя</span></label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  className="input input-bordered"
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Дата рождения</span></label>
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                  className="input input-bordered"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="form-control">
              <label className="label"><span className="label-text">О себе</span></label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="textarea textarea-bordered"
                placeholder="Пара слов о себе…"
                rows={3}
              />
            </div>

            {/* Avatar */}
            <div className="form-control">
              <label className="label"><span className="label-text">Аватар</span></label>
              <AvatarUploader onUploaded={onAvatarUploaded} />
              {profile.profilePictureUrl && (
                <div className="mt-2 text-sm opacity-70">
                  Загружено: <span className="link">{profile.profilePictureUrl}</span>
                </div>
              )}
            </div>

            <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
              Зарегистрироваться
            </button>

            <p className="text-sm text-base-content/60 text-center">
              Уже есть аккаунт? <Link className="link link-primary" to="/login">Войти</Link>
            </p>

            <div className="mt-2 text-xs opacity-60 text-center">
              После регистрации проверьте почту и подтвердите email по ссылке из письма.
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
