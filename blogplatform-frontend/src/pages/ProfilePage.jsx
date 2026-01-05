// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileTabs from '@/components/ProfileTabs';
import EditProfileModal from '@/components/EditProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';

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
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-start gap-4">
              <div className="avatar">
                <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img src={getAvatarUrl(u?.profile?.profilePictureUrl)} alt={u.username} />
                </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-2xl font-bold">@{u.username}</div>
                <div className="badge">{u.status}</div>
              </div>
              <div className="mt-1 opacity-80">{u?.profile?.fullName}</div>
              <div className="mt-2 text-sm opacity-70">{u?.profile?.bio}</div>

              <div className="mt-3 flex items-center gap-4">
                <Link to={`/users/${u.id}/followers`} className="link">
                  <b>{counters.followers}</b> подписчиков
                </Link>
                <Link to={`/users/${u.id}/following`} className="link">
                  <b>{counters.following}</b> подписок
                </Link>
              </div>
            </div>

            <div>
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
