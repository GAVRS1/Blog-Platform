// src/pages/SettingsPage.jsx
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { settingsService } from '@/services/settings';
import { blocksService } from '@/services/blocks';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';

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
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, n, blocks] = await Promise.all([
          settingsService.getPrivacy(),
          settingsService.getNotifications(),
          blocksService.list()
        ]);
        setPrivacy(p);
        setNotifs(n);
        setBlockedUsers(blocks || []);
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

  const refreshBlocks = async () => {
    setLoadingBlocks(true);
    try {
      const blocks = await blocksService.list();
      setBlockedUsers(blocks || []);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить чёрный список');
    } finally {
      setLoadingBlocks(false);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await blocksService.unblock(userId);
      toast.success('Пользователь удалён из чёрного списка');
      await refreshBlocks();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось удалить пользователя из чёрного списка');
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

        {/* BLACKLIST */}
        <div className="card bg-base-100 shadow h-full">
          <div className="card-body h-full">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Чёрный список</h2>
              <button className="btn btn-sm" onClick={refreshBlocks} disabled={loadingBlocks}>
                {loadingBlocks ? 'Обновление...' : 'Обновить'}
              </button>
            </div>

            {blockedUsers.length === 0 ? (
              <div className="text-sm opacity-70 mt-4">Список пуст</div>
            ) : (
              <div className="mt-4 space-y-3">
                {blockedUsers.map((blocked) => (
                  <div key={blocked.id} className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full ring ring-error ring-offset-base-100 ring-offset-2">
                        <img src={getAvatarUrl(blocked.profile?.profilePictureUrl)} alt="" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{blocked.profile?.fullName || blocked.username}</div>
                      <div className="text-xs opacity-70">@{blocked.username}</div>
                      {blocked.reason && (
                        <div className="text-xs opacity-60 truncate">Причина: {blocked.reason}</div>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => unblockUser(blocked.id)}
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
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
