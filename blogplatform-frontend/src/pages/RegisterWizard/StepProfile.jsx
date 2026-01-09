import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AvatarUploader from '@/components/AvatarUploader';
import { checkUniqueUsername } from '@/utils/uniqueCheck';
import { authService } from '@/services/auth';
import { useRegisterWizard } from './RegisterWizardContext';

const container = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function StepProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile, temporaryKey, password, email, isVerified, resetWizard } = useRegisterWizard();

  const [loading, setLoading] = useState(false);
  const [usernameOk, setUsernameOk] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!temporaryKey) {
      navigate('/register', { replace: true });
      return;
    }
    if (!isVerified) {
      navigate('/register/code', { replace: true });
    }
    if (!password) {
      navigate('/register', { replace: true });
    }
  }, [temporaryKey, isVerified, password, navigate]);

  useEffect(() => {
    if (!profile.username?.trim()) {
      setUsernameOk(null);
      return;
    }
    const value = profile.username.trim();
    setUsernameOk(null);
    const timer = setTimeout(async () => {
      try {
        const ok = await checkUniqueUsername(value);
        if (profile.username.trim() === value) setUsernameOk(ok);
      } catch {
        setUsernameOk(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [profile.username]);

  const onAvatarUploaded = (url) => {
    updateProfile({ profilePictureUrl: url });
  };

  function buildPayload() {
    const username = profile.username.trim();
    const payload = {
      temporaryKey,
      password,
      username,
    };
    if (profile.fullName) payload.fullName = profile.fullName;
    if (profile.bio) payload.bio = profile.bio;
    if (profile.profilePictureUrl) payload.profilePictureUrl = profile.profilePictureUrl;
    if (profile.birthDate) {
      try {
        payload.birthDate = new Date(profile.birthDate).toISOString();
      } catch {
        // ignore invalid
      }
    }
    return payload;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!profile.username?.trim()) return setError('Введите имя пользователя');
    if (usernameOk === false) {
      const msg = 'Имя пользователя уже занято';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!password) return setError('Пароль не найден, начните заново');

    setLoading(true);
    try {
      const payload = buildPayload();
      await authService.completeRegister(payload);
      toast.success('Регистрация завершена');
      resetWizard();
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Ошибка сохранения профиля';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/register/code');
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-2 mb-6">
        <p className="text-sm uppercase tracking-wide text-primary font-semibold">Шаг 3 из 3</p>
        <h1 className="text-3xl font-bold">Заполните профиль</h1>
        <p className="text-base-content/70">
          Email <span className="font-semibold">{email || 'не указан'}</span> подтверждён. Осталось выбрать имя
          пользователя и рассказать о себе.
        </p>
      </div>

      {error && (
        <div className="alert alert-error my-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Имя пользователя</span></label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => updateProfile({ username: e.target.value })}
              className={`input input-bordered ${usernameOk === false ? 'input-error' : ''} ${usernameOk ? 'input-success' : ''}`}
              placeholder="username"
              required
            />
            <label className="label">
              <span
                className={`label-text-alt ${
                  usernameOk === false ? 'text-error' : usernameOk ? 'text-success' : 'text-base-content/60'
                }`}
              >
                {usernameOk === false
                  ? 'Имя занято'
                  : usernameOk
                    ? 'Имя свободно'
                    : 'Будет отображаться в ссылке профиля'}
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Полное имя</span></label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => updateProfile({ fullName: e.target.value })}
              className="input input-bordered"
              placeholder="Иван Иванов"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Дата рождения</span></label>
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e) => updateProfile({ birthDate: e.target.value })}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Аватар</span></label>
            <AvatarUploader onUploaded={onAvatarUploaded} usePublicUpload />
            {profile.profilePictureUrl && (
              <span className="label-text-alt text-success mt-1">
                Загружено: {profile.profilePictureUrl}
              </span>
            )}
          </div>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">О себе</span></label>
          <textarea
            value={profile.bio}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            className="textarea textarea-bordered"
            placeholder="Пара слов о себе…"
            rows={3}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <button className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
            Завершить регистрацию
          </button>
          <button type="button" className="btn btn-outline" onClick={handleBack}>
            Назад
          </button>
        </div>
      </form>
    </motion.div>
  );
}
