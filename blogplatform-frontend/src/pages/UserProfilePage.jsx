// src/pages/UserProfilePage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProfileTabs from '@/components/ProfileTabs';
import FollowButton from '@/components/FollowButton';
import BlockButton from '@/components/BlockButton';
import ReportModal from '@/components/ReportModal';
import { usersService } from '@/services/users';
import { followsService } from '@/services/follows';
import { blocksService } from '@/services/blocks';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';
import { getUserStatusLabel, isUserBanned } from '@/utils/userStatus';

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const [user, setUser] = useState(null);
  const [counters, setCounters] = useState({ followers: 0, following: 0 });
  const [rel, setRel] = useState(null);
  const [blockRel, setBlockRel] = useState(null);
  const [limitedProfile, setLimitedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLimitedProfile(false);
      try {
        const u = await usersService.getById(userId);
        setUser(u);
        const [cnt, r, b] = await Promise.all([
          usersService.counters(userId),
          followsService.relationship(userId),
          blocksService.relationship(userId).catch((err) => {
            if (err.response?.status === 404) {
              return null;
            }
            throw err;
          })
        ]);
        setCounters(cnt);
        setRel(r);
        setBlockRel(b);
      } catch (e) {
        const status = e.response?.status;
        if (status === 403) {
          try {
            const publicUser = await usersService.getPublicById(userId);
            setUser(publicUser);
            setCounters({ followers: 0, following: 0 });
            setRel(null);
            setBlockRel(null);
            setLimitedProfile(true);
          } catch (publicError) {
            const publicStatus = publicError.response?.status;
            if (publicStatus === 404) {
              toast.error('Пользователь не найден');
            } else {
              toast.error('Профиль скрыт настройками приватности');
            }
          }
        } else {
          toast.error('Пользователь не найден');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-center opacity-70">
        <div>
          <div className="text-4xl">🙈</div>
          <div className="mt-2">Профиль недоступен</div>
        </div>
      </div>
    );
  }

  const blockedByMe = !!blockRel?.iBlocked;
  const blockedMe = !!blockRel?.blockedMe;
  const isRestricted = limitedProfile;

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow w-full max-w-3xl mx-auto">
        <div className="card-body p-4 sm:p-5">
          {isUserBanned(user?.status) && (
            <div className="alert alert-error mb-4">
              <span>Профиль заблокирован. Контент недоступен.</span>
            </div>
          )}
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="avatar max-w-full">
              <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img
                  src={getAvatarUrl(user?.profile?.profilePictureUrl)}
                  alt={user.username}
                  className="max-w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 max-w-full min-w-0">
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                <div className="text-2xl font-bold break-words max-w-full">@{user.username}</div>
                {!isRestricted && <div className="badge">{getUserStatusLabel(user.status)}</div>}

                {/* Если есть блокировки — скрываем follow/message */}
                {!isRestricted && !blockedByMe && !blockedMe && (
                  <>
                    <FollowButton userId={user.id} className="ml-2" />
                    {rel?.areFriends && <div className="badge badge-success">Друзья</div>}
                  </>
                )}
              </div>

              <div className="mt-1 opacity-80 break-words max-w-full">{user?.profile?.fullName}</div>
              {!isRestricted && (
                <div className="mt-2 text-sm opacity-70 break-words max-w-full">
                  {user?.profile?.bio}
                </div>
              )}

              {!isRestricted && (
                <div className="mt-3 flex flex-wrap items-center gap-4 max-w-full">
                  <Link to={`/users/${user.id}/followers`} className="link">
                    <b>{counters.followers}</b> подписчиков
                  </Link>
                  <Link to={`/users/${user.id}/following`} className="link">
                    <b>{counters.following}</b> подписок
                  </Link>
                </div>
              )}

              {isRestricted && (
                <div className="mt-3 text-sm opacity-70">Пользователь ограничил доступ</div>
              )}

              {!isRestricted && (blockedByMe || blockedMe) && (
                <div className="alert alert-warning mt-3">
                  {blockedByMe && <span>Вы заблокировали этого пользователя — вы не увидите его контент и не сможете писать ему.</span>}
                  {blockedMe && <span>Этот пользователь заблокировал вас — доступ ограничен.</span>}
                </div>
              )}
            </div>

            {!isRestricted && (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {!blockedByMe && !blockedMe && (
                  <Link to={`/messages/${user.id}`} className="btn btn-sm btn-outline">Написать</Link>
                )}
                <BlockButton userId={user.id} />
                <button className="btn btn-sm btn-ghost" onClick={() => setReportOpen(true)}>Пожаловаться</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Если заблокированы друг другом — вкладки могут быть пусты/ограничены, бэкенд вернёт 403 на приватные вещи */}
      {!isRestricted && <ProfileTabs user={user} />}

      {!isRestricted && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          subject={{ type: 'user', userId: user.id }}
        />
      )}
    </div>
  );
}
