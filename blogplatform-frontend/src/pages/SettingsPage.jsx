// src/pages/SettingsPage.jsx
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { settingsService } from '@/services/settings';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AUDIENCE = [
  { value: 'Everyone', label: 'Все' },
  { value: 'FriendsOnly', label: 'Только друзья' },
  { value: 'NoOne', label: 'Никто' }
];

const NOTIFICATION_OPTIONS = [
  { value: 'true', label: 'Вкл' },
  { value: 'false', label: 'Выкл' }
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState(null);
  const [notifs, setNotifs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, n] = await Promise.all([
          settingsService.getPrivacy(),
          settingsService.getNotifications()
        ]);
        setPrivacy(p);
        setNotifs(n);
      } catch {
        toast.error('Не удалось загрузить настройки');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updatedPrivacy = await settingsService.updatePrivacy(privacy);
      const updatedNotifs = await settingsService.updateNotifications(notifs);
      setPrivacy(updatedPrivacy);
      setNotifs(updatedNotifs);
      toast.success('Настройки сохранены');
    } catch {
      toast.error('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold mb-2">Настройки</h1>
        <p className="opacity-70">Приватность и уведомления</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRIVACY */}
        <div className="card bg-base-100 shadow h-full">
          <div className="card-body h-full">
            <h2 className="card-title">Приватность</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-y-3">
              <AudienceSelectField
                label="Кто может писать сообщения"
                value={privacy?.whoCanMessage}
                onChange={(v) => setPrivacy(p => ({ ...p, whoCanMessage: v }))}
              />
              <AudienceSelectField
                label="Кто может комментировать"
                value={privacy?.whoCanComment}
                onChange={(v) => setPrivacy(p => ({ ...p, whoCanComment: v }))}
              />
              <AudienceSelectField
                label="Кто видит профиль"
                value={privacy?.whoCanViewProfile}
                onChange={(v) => setPrivacy(p => ({ ...p, whoCanViewProfile: v }))}
              />
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="card bg-base-100 shadow h-full">
          <div className="card-body h-full">
            <h2 className="card-title">Уведомления</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NotificationSelectField
                label="Подписки"
                value={notifs?.onFollows}
                onChange={(v) => setNotifs(n => ({ ...n, onFollows: v }))}
              />
              <NotificationSelectField
                label="Лайки"
                value={notifs?.onLikes}
                onChange={(v) => setNotifs(n => ({ ...n, onLikes: v }))}
              />
              <NotificationSelectField
                label="Комментарии"
                value={notifs?.onComments}
                onChange={(v) => setNotifs(n => ({ ...n, onComments: v }))}
              />
              <NotificationSelectField
                label="Сообщения"
                value={notifs?.onMessages}
                onChange={(v) => setNotifs(n => ({ ...n, onMessages: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <button className="btn btn-outline btn-error w-full sm:w-auto" onClick={authService.logout}>
          Выйти из аккаунта
        </button>
        <button className={`btn btn-primary w-full sm:w-auto ${saving ? 'loading' : ''}`} onClick={saveSettings} disabled={saving}>
          Сохранить
        </button>
      </div>
    </motion.div>
  );
}

function AudienceSelectField({ label, value, onChange }) {
  return (
    <div className="form-control min-w-0">
      <label className="label min-w-0">
        <span className="label-text whitespace-normal break-words leading-tight max-w-full block">{label}</span>
      </label>
      <select
        className="select select-bordered"
        value={value || 'Everyone'}
        onChange={(e) => onChange(e.target.value)}
      >
        {AUDIENCE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
    </div>
  );
}

function NotificationSelectField({ label, value, onChange }) {
  return (
    <div className="form-control">
      <label className="label min-w-0">
        <span className="label-text whitespace-normal break-words">{label}</span>
      </label>
      <select
        className="select select-bordered"
        value={String(value ?? true)}
        onChange={(e) => onChange(e.target.value === 'true')}
      >
        {NOTIFICATION_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
