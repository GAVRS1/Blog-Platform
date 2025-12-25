import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth';
import { checkUniqueEmail } from '@/utils/uniqueCheck';
import { useRegisterWizard } from './RegisterWizardContext';

const container = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function StepEmail() {
  const navigate = useNavigate();
  const {
    email,
    password,
    setEmail,
    setPassword,
    setTemporaryKey,
    setIsVerified,
    markSentNow,
    resetWizard,
  } = useRegisterWizard();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailOk, setEmailOk] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (!email?.trim()) {
      setEmailOk(null);
      return;
    }
    const value = email.trim();
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const ok = await checkUniqueEmail(value);
        if (email.trim() === value) {
          setEmailOk(ok);
        }
      } catch {
        setEmailOk(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email?.trim()) return setError('Введите email');
    if (!password) return setError('Укажите пароль, чтобы завершить регистрацию');

    setLoading(true);
    try {
      const { temporaryKey } = await authService.startRegister(email.trim());
      setTemporaryKey(temporaryKey);
      setIsVerified(false);
      markSentNow();
      toast.success('Код отправлен на почту');
      navigate('/register/code');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Не удалось отправить код';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    resetWizard();
    navigate('/login');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-2 mb-6">
        <p className="text-sm uppercase tracking-wide text-primary font-semibold">Шаг 1 из 3</p>
        <h1 className="text-3xl font-bold">Укажите email и пароль</h1>
        <p className="text-base-content/70">
          Мы отправим временный код на вашу почту. Пароль понадобится на финальном шаге.
        </p>
      </div>

      {error && (
        <div className="alert alert-error my-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-control">
          <label className="label"><span className="label-text">Email</span></label>
          <input
            type="email"
            className={`input input-bordered ${emailOk === false ? 'input-error' : ''}`}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              На этот адрес придёт письмо с кодом подтверждения
            </span>
            <span className="label-text-alt text-base-content/60">
              {checkingEmail ? 'Проверяем...' : emailOk === false ? 'Email занят' : ''}
            </span>
          </label>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Пароль</span></label>
          <input
            type="password"
            className="input input-bordered"
            placeholder="●●●●●●●●"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Пароль сохранится до завершения регистрации
            </span>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <button className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
            Отправить код
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleExit}>
            Выйти
          </button>
          <div className="text-sm text-base-content/60 md:ml-auto">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="link link-primary" onClick={resetWizard}>
              Войти
            </Link>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
