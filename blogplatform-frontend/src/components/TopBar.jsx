// src/components/TopBar.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersService } from '@/services/users';
import { getAvatarUrl } from '@/utils/avatar';

const normalizeItems = data => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export default function TopBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const latestQuery = useRef('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let isActive = true;
    if (!trimmedQuery) {
      setResults([]);
      setIsOpen(false);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        latestQuery.current = trimmedQuery;
        const data = await usersService.search(trimmedQuery);
        if (!isActive || latestQuery.current !== trimmedQuery) return;
        setResults(normalizeItems(data));
        setIsOpen(true);
      } catch (error) {
        if (!isActive) return;
        setResults([]);
        setIsOpen(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  return (
    <div className="hidden md:block sticky top-0 z-30 border-b border-base-300 bg-base-200/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold">BlogPlatform</span>
          <span className="text-sm opacity-60">by. Gavrs</span>
        </div>
        <div className="relative w-full max-w-md">
          <label className="input input-bordered flex items-center gap-2 w-full">
            <i className="fas fa-search opacity-60" aria-hidden></i>
            <input
              type="text"
              className="grow"
              placeholder="Поиск авторов"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onFocus={() => trimmedQuery && setIsOpen(true)}
              aria-label="Поиск авторов"
            />
            {loading && <span className="loading loading-spinner loading-xs"></span>}
          </label>
          {isOpen && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl border border-base-300 bg-base-100 shadow-xl">
              {results.length ? (
                <ul className="max-h-80 overflow-auto py-2">
                  {results.map(user => {
                    const name = user?.profile?.fullName?.trim() || user?.fullName || user?.username || 'Пользователь';
                    const username = user?.username ? `@${user.username}` : '';
                    const avatarUrl = getAvatarUrl(user?.profile?.profilePictureUrl);
                    return (
                      <li key={user.id || user.userId || name}>
                        <Link
                          to={`/users/${user.id || user.userId}`}
                          className="flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-base-200"
                          onClick={() => setIsOpen(false)}>
                          <span className="flex items-center gap-3 min-w-0">
                            <img
                              src={avatarUrl}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-full object-cover"
                              loading="lazy"
                            />
                            <span className="font-medium truncate">{name}</span>
                          </span>
                          {username && <span className="text-xs opacity-60">{username}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm opacity-70">Пользователи не найдены</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
