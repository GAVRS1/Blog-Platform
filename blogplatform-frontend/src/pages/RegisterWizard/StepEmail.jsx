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
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    window.onTurnstileSuccess = (token) => {
      setCaptchaToken(token);
      setError('');
    };
    window.onTurnstileExpired = () => setCaptchaToken('');
    window.onTurnstileError = () => setCaptchaToken('');

    return () => {
      delete window.onTurnstileSuccess;
      delete window.onTurnstileExpired;
      delete window.onTurnstileError;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email?.trim()) return setError('Введите email');
    if (!password) return setError('Укажите пароль, чтобы завершить регистрацию');
    if (!captchaToken) return setError('Подтвердите, что вы не робот');

    const trimmedEmail = email.trim();
    setLoading(true);
    try {
      const unique = await checkUniqueEmail(trimmedEmail);
      if (!unique) {
        const msg = 'Такой email уже зарегистрирован. Попробуйте войти или использовать другой адрес.';
        setEmailOk(false);
        setError(msg);
        toast.error(msg);
        return;
      }

      setEmailOk(true);
      const { temporaryKey } = await authService.startRegister(trimmedEmail, captchaToken);
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
            onChange={(e) => {
              setEmailOk(null);
              setError('');
              setEmail(e.target.value);
            }}
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Проверим адрес перед отправкой кода. Если он занят, предложим войти или сменить email.
            </span>
            <span className="label-text-alt text-base-content/60">
              {emailOk === false ? 'Email занят' : ''}
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

        <div className="form-control">
          <label className="label"><span className="label-text">Проверка</span></label>
          <div className="flex">
            <div
              className="cf-turnstile"
              data-sitekey="0x4AAAAAACVwAp_ecsh7kmeY"
              data-callback="onTurnstileSuccess"
              data-expired-callback="onTurnstileExpired"
              data-error-callback="onTurnstileError"
            ></div>
          </div>
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Подтвердите, что вы не робот, чтобы продолжить регистрацию
            </span>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <button className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
            Отправить код
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
