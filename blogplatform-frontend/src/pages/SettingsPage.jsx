// src/pages/SettingsPage.jsx
import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settings';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AUDIENCE = [
  { value: 'Everyone', label: 'Все' },
  { value: 'FriendsOnly', label: 'Только друзья' },
  { value: 'NoOne', label: 'Никто' }
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

  const savePrivacy = async () => {
    setSaving(true);
    try {
      const res = await settingsService.updatePrivacy(privacy);
      setPrivacy(res);
      toast.success('Приватность сохранена');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifs = async () => {
    setSaving(true);
    try {
      const res = await settingsService.updateNotifications(notifs);
      setNotifs(res);
      toast.success('Уведомления сохранены');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Настройки</h1>
        <p className="opacity-70">Приватность и уведомления</p>
      </div>

      {/* PRIVACY */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Приватность</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Кто может писать сообщения"
              value={privacy?.whoCanMessage}
              onChange={(v) => setPrivacy(p => ({ ...p, whoCanMessage: v }))}
            />
            <SelectField
              label="Кто может комментировать"
              value={privacy?.whoCanComment}
              onChange={(v) => setPrivacy(p => ({ ...p, whoCanComment: v }))}
            />
            <SelectField
              label="Кто видит профиль"
              value={privacy?.whoCanViewProfile}
              onChange={(v) => setPrivacy(p => ({ ...p, whoCanViewProfile: v }))}
            />
          </div>
          <div className="mt-4">
            <button className={`btn btn-primary ${saving ? 'loading' : ''}`} onClick={savePrivacy} disabled={saving}>
              Сохранить приватность
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Уведомления</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField
              label="Подписки"
              value={notifs?.onFollows}
              onChange={(v) => setNotifs(n => ({ ...n, onFollows: v }))}
            />
            <SelectField
              label="Лайки"
              value={notifs?.onLikes}
              onChange={(v) => setNotifs(n => ({ ...n, onLikes: v }))}
            />
            <SelectField
              label="Комментарии"
              value={notifs?.onComments}
              onChange={(v) => setNotifs(n => ({ ...n, onComments: v }))}
            />
            <SelectField
              label="Сообщения"
              value={notifs?.onMessages}
              onChange={(v) => setNotifs(n => ({ ...n, onMessages: v }))}
            />
          </div>
          <div className="mt-4">
            <button className={`btn btn-primary ${saving ? 'loading' : ''}`} onClick={saveNotifs} disabled={saving}>
              Сохранить уведомления
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SelectField({ label, value, onChange }) {
  return (
    <div className="form-control">
      <label className="label"><span className="label-text">{label}</span></label>
      <select className="select select-bordered" value={value || 'Everyone'} onChange={(e) => onChange(e.target.value)}>
        {AUDIENCE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
    </div>
  );
}