// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileTabs from '@/components/ProfileTabs';
import EditProfileModal from '@/components/EditProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';
import { getUserStatusLabel, isUserBanned } from '@/utils/userStatus';

export default function ProfilePage() {
  const { user: me, setUser } = useAuth();
  const [fresh, setFresh] = useState(null);
  const [counters, setCounters] = useState({ followers: 0, following: 0 });
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    if (!me?.id) return;
    (async () => {
      try {
        const [u, cnt] = await Promise.all([
          usersService.getById(me.id),
          usersService.counters(me.id)
        ]);
        setFresh(u);
        setCounters(cnt);
      } catch (e) {
        toast.error('Не удалось загрузить профиль');
      }
    })();
  }, [me?.id]);

  const onSaved = (updated) => {
    setFresh(updated);
    setUser?.(prev => ({ ...prev, ...updated }));
  };

  if (!me) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  const u = fresh || me;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-100 shadow w-full max-w-3xl mx-auto">
        <div className="card-body p-4 sm:p-5">
          {isUserBanned(u?.status) && (
            <div className="alert alert-error mb-4">
              <span>Профиль заблокирован. Доступ к функциям ограничен.</span>
            </div>
          )}
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="avatar max-w-full">
              <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img
                  src={getAvatarUrl(u?.profile?.profilePictureUrl)}
                  alt={u.username}
                  className="max-w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 max-w-full min-w-0">
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                <div className="text-2xl font-bold break-words max-w-full">@{u.username}</div>
                <div className="badge">{getUserStatusLabel(u.status)}</div>
              </div>
              <div className="mt-1 opacity-80 break-words max-w-full">{u?.profile?.fullName}</div>
              <div className="mt-2 text-sm opacity-70 break-words max-w-full">{u?.profile?.bio}</div>

              <div className="mt-3 flex flex-wrap items-center gap-4 max-w-full">
                <Link to={`/users/${u.id}/followers`} className="link">
                  <b>{counters.followers}</b> подписчиков
                </Link>
                <Link to={`/users/${u.id}/following`} className="link">
                  <b>{counters.following}</b> подписок
                </Link>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <button className="btn btn-outline btn-sm" onClick={() => setOpenEdit(true)}>
                Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs user={u} />

      {/* Modal */}
      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        initial={u}
        onSaved={onSaved}
      />
    </div>
  );
}
