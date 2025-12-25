import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth';
import { useRegisterWizard } from './RegisterWizardContext';

const RESEND_COOLDOWN = 60; // сек

function useCooldown(lastSentAt) {
  const calc = () => {
    if (!lastSentAt) return 0;
    const diff = Math.max(0, RESEND_COOLDOWN - Math.floor((Date.now() - lastSentAt) / 1000));
    return diff;
  };
  const [cooldown, setCooldown] = useState(calc);

  useEffect(() => {
    setCooldown(calc());
    if (!lastSentAt) return undefined;
    const timer = setInterval(() => setCooldown(calc()), 1000);
    return () => clearInterval(timer);
  }, [lastSentAt]);

  return cooldown;
}

const container = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function StepCode() {
  const navigate = useNavigate();
  const { temporaryKey, email, markSentNow, lastSentAt, setIsVerified, resetWizard } = useRegisterWizard();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const cooldown = useCooldown(lastSentAt);
  const emailSafe = useMemo(() => email || 'указанный email', [email]);

  useEffect(() => {
    if (!temporaryKey) {
      navigate('/register', { replace: true });
    }
  }, [temporaryKey, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!code.trim()) return setError('Введите код из письма');

    setLoading(true);
    try {
      await authService.verifyEmail({ temporaryKey, code: code.trim() });
      setIsVerified(true);
      toast.success('Email подтверждён');
      navigate('/register/profile');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Код не принят';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setResendLoading(true);
    try {
      await authService.resendCode(temporaryKey);
      markSentNow();
      setInfo('Письмо отправлено повторно');
      toast.success('Код отправлен повторно');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Не удалось отправить письмо';
      setError(msg);
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeEmail = () => {
    resetWizard();
    navigate('/register');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-2 mb-6">
        <p className="text-sm uppercase tracking-wide text-primary font-semibold">Шаг 2 из 3</p>
        <h1 className="text-3xl font-bold">Подтвердите email</h1>
        <p className="text-base-content/70">
          Мы отправили код подтверждения на <span className="font-semibold">{emailSafe}</span>. Введите его ниже,
          чтобы перейти к заполнению профиля.
        </p>
      </div>

      {error && (
        <div className="alert alert-error my-4">
          <span>{error}</span>
        </div>
      )}
      {info && (
        <div className="alert alert-success my-4">
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-control">
          <label className="label"><span className="label-text">Код из письма</span></label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={10}
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Если письмо не пришло, проверьте спам или запросите новый код
            </span>
          </label>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <button className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
            Подтвердить
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
          >
            {resendLoading ? 'Отправляем…' : cooldown > 0 ? `Повторно через ${cooldown} c` : 'Отправить код ещё раз'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleChangeEmail}>
            Изменить email
          </button>
        </div>

        <div className="text-sm text-base-content/60 space-y-1">
          <p>Повторная отправка доступна не чаще, чем раз в {RESEND_COOLDOWN} секунд.</p>
          {lastSentAt && (
            <p className="opacity-70">
              Последняя попытка: {new Date(lastSentAt).toLocaleTimeString()}.
            </p>
          )}
        </div>
      </form>
    </motion.div>
  );
}
