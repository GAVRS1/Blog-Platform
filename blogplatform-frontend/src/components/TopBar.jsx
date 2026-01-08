// src/components/TopBar.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usersService } from '@/services/users';
import { getAvatarUrl } from '@/utils/avatar';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;

export default function TopBar() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let active = true;

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await usersService.search(trimmedQuery);
        const items = Array.isArray(data) ? data : data?.items || [];
        if (active) {
          setResults(items);
        }
      } catch (error) {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    setQuery('');
    setResults([]);
  }, [location.pathname]);

  const showDropdown = trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div className="sticky top-0 z-50 border-b border-base-300/60 bg-base-100/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-2">
            <Link to="/" className="text-xl font-bold tracking-tight">
              BlogPlatform
            </Link>
            <span className="text-sm opacity-70">by. Gavrs</span>
          </div>

          <div className="relative w-full md:max-w-md">
            <label className="input input-bordered flex items-center gap-2 w-full">
              <i className="fas fa-search opacity-60" aria-hidden />
              <input
                type="search"
                className="grow"
                placeholder="Поиск пользователей..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {loading && <span className="loading loading-spinner loading-xs" />}
            </label>

            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl border border-base-200 bg-base-100 shadow-xl">
                {results.length === 0 && !loading ? (
                  <div className="px-4 py-3 text-sm opacity-70">Пользователи не найдены</div>
                ) : (
                  <ul className="max-h-72 overflow-auto">
                    {results.map((user) => (
                      <li key={user.id}>
                        <Link
                          to={`/users/${user.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-base-200"
                        >
                          <div className="avatar">
                            <div className="w-10 rounded-full">
                              <img src={getAvatarUrl(user?.profile?.profilePictureUrl)} alt={user.username} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">@{user.username}</div>
                            <div className="text-xs opacity-70 truncate">{user?.profile?.fullName}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
