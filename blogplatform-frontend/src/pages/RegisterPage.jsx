// src/pages/RegisterPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/auth';
import { checkUniqueEmail, checkUniqueUsername } from '@/utils/uniqueCheck';
import AvatarUploader from '@/components/AvatarUploader';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

const container = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const stepAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState(sp.get('email') || '');
  const [emailOk, setEmailOk] = useState(null); // null | true | false
  const [code, setCode] = useState(sp.get('code') || '');

  const [profile, setProfile] = useState({
    username: '',
    password: '',
    fullName: '',
    birthDate: '',
    bio: '',
    profilePictureUrl: ''
  });
  const [usernameOk, setUsernameOk] = useState(null);

  // Авто-переход на шаг 2, если пришли по ссылке /verify?email=&code= и уже провалидировали там
  useEffect(() => {
    if (sp.get('verified') === 'true' && sp.get('email')) {
      setEmail(sp.get('email'));
      setStep(3); // можно сразу завершать регистрацию
    }
  }, [sp]);

  // Дебаунс-проверки uniq
  const debouncedCheckEmail = useMemo(
    () => debounce(async (value) => {
      if (!value) return setEmailOk(null);
      try {
        const ok = await checkUniqueEmail(value);
        setEmailOk(ok);
      } catch {
        setEmailOk(null);
      }
    }, 400),
    []
  );

  const debouncedCheckUsername = useMemo(
    () => debounce(async (value) => {
      if (!value) return setUsernameOk(null);
      try {
        const ok = await checkUniqueUsername(value);
        setUsernameOk(ok);
      } catch {
        setUsernameOk(null);
      }
    }, 400),
    []
  );

  useEffect(() => { debouncedCheckEmail(email); }, [email]);
  useEffect(() => { debouncedCheckUsername(profile.username); }, [profile.username]);

  // === HANDLERS ===
  const onRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Введите email');
    if (emailOk === false) return toast.error('Email уже занят');
    setLoading(true);
    try {
      await authService.requestEmailCode(email);
      toast.success('Код отправлен на почту');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Не удалось отправить код';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async (e) => {
    e.preventDefault();
    if (!email || !code) return toast.error('Введите email и код');
    setLoading(true);
    try {
      const res = await authService.verifyEmailCode(email, code);
      if (res?.verified) {
        toast.success('Email подтверждён');
        setStep(3);
      } else {
        toast.error('Неверный код');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка подтверждения кода';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onComplete = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email отсутствует');
    if (!profile.username || !profile.password) {
      return toast.error('Укажите логин и пароль');
    }
    if (usernameOk === false) return toast.error('Имя пользователя занято');

    setLoading(true);
    try {
      const payload = { email, ...profile };
      const result = await authService.completeRegistration(payload);

      // Если бэкенд не вернул token — предложим войти
      if (!result?.id && !result?.username) {
        toast.success('Регистрация завершена!');
        navigate('/');
      } else {
        // либо автологин выполнен (token установили внутри сервиса)
        toast.success('Добро пожаловать!');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onAvatarUploaded = (url) => {
    setProfile((p) => ({ ...p, profilePictureUrl: url }));
  };

  // === UI ===
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
            <p className="text-base-content/60 mt-2">Создайте аккаунт в три шага</p>
          </div>

          {/* Steps */}
          <div className="flex justify-center mb-6">
            <ul className="steps">
              <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Почта</li>
              <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Код</li>
              <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Профиль</li>
            </ul>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                variants={stepAnim}
                initial="hidden"
                animate="show"
                exit="exit"
                onSubmit={onRequestCode}
                className="space-y-5"
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
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

                <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
                  Отправить код
                </button>

                <p className="text-sm text-base-content/60 text-center">
                  Уже есть аккаунт?{' '}
                  <Link className="link link-primary" to="/login">Войти</Link>
                </p>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                variants={stepAnim}
                initial="hidden"
                animate="show"
                exit="exit"
                onSubmit={onVerifyCode}
                className="space-y-5"
              >
                <div className="alert alert-info">
                  Мы отправили код на <b>{email}</b>. Введите его ниже.
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Код подтверждения</span>
                  </label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input input-bordered tracking-widest text-center"
                    placeholder="000000"
                    required
                  />
                </div>

                <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
                  Подтвердить
                </button>

                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  disabled={loading}
                  onClick={onRequestCode}
                >
                  Отправить код ещё раз
                </button>

                <button
                  type="button"
                  className="btn btn-outline w-full"
                  disabled={loading}
                  onClick={() => setStep(1)}
                >
                  Назад к почте
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                variants={stepAnim}
                initial="hidden"
                animate="show"
                exit="exit"
                onSubmit={onComplete}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Имя пользователя</span>
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile(p => ({ ...p, username: e.target.value.trim() }))}
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
                    <label className="label">
                      <span className="label-text">Пароль</span>
                    </label>
                    <input
                      type="password"
                      value={profile.password}
                      onChange={(e) => setProfile(p => ({ ...p, password: e.target.value }))}
                      className="input input-bordered"
                      placeholder="●●●●●●●●"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Полное имя</span>
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                      className="input input-bordered"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Дата рождения</span>
                    </label>
                    <input
                      type="date"
                      value={profile.birthDate}
                      onChange={(e) => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                      className="input input-bordered"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">О себе</span>
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                    className="textarea textarea-bordered"
                    placeholder="Пара слов о себе..."
                    rows={3}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Аватар</span>
                  </label>
                  <AvatarUploader onUploaded={onAvatarUploaded} />
                  {profile.profilePictureUrl && (
                    <div className="mt-2 text-sm opacity-70">
                      Загружено: <span className="link">{profile.profilePictureUrl}</span>
                    </div>
                  )}
                </div>

                <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
                  Завершить регистрацию
                </button>

                <p className="text-sm text-base-content/60 text-center">
                  Уже есть аккаунт?{' '}
                  <Link className="link link-primary" to="/login">Войти</Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
