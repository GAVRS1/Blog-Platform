// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { usersService } from '@/services/users';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const tabs = ['reports', 'actions', 'appeals'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('reports');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [statusFilter, setStatusFilter] = useState('');
  const [forceAction, setForceAction] = useState({ userId: '', reason: '' });

  const isAdmin = user && user.status === 'Admin';

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  async function load(page = 1) {
    setLoading(true);
    try {
      if (tab === 'reports') {
        const res = await adminService.listReports(statusFilter || undefined, page, 20);
        setData(res);
      } else if (tab === 'actions') {
        const res = await adminService.listActions(page, 20);
        setData(res);
      } else if (tab === 'appeals') {
        const res = await adminService.listAppeals(statusFilter || undefined, page, 20);
        setData(res);
      }
    } catch (e) {
      toast.error(e.response?.data || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Доступ запрещён</h2>
          <p className="opacity-70 mt-2">Эта страница только для администраторов</p>
          <Link to="/" className="btn btn-primary mt-4">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
      </div>

      <div role="tablist" className="tabs tabs-bordered mb-4">
        {tabs.map(t => (
          <a key={t} role="tab" className={`tab ${tab === t ? 'tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'reports' ? 'Репорты' : t === 'actions' ? 'Действия' : 'Апелляции'}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-3">
        {(tab === 'reports' || tab === 'appeals') && (
          <select className="select select-bordered select-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Все статусы</option>
            {tab === 'reports' && ['Pending','Approved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            {tab === 'appeals' && ['Pending','Approved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button className="btn btn-sm" onClick={() => load(data.page)}>Обновить</button>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && tab === 'reports' && (
        <ReportsTable
          data={data}
          onConfirm={handleConfirmReport}
          onResolve={handleReportResolution}
        />
      )}
      {!loading && tab === 'actions' && (
        <ActionsTable
          data={data}
          forceAction={forceAction}
          onForceChange={setForceAction}
          onForceBan={handleForceBan}
          onForceUnban={handleForceUnban}
        />
      )}
      {!loading && tab === 'appeals' && <AppealsTable data={data} onResolve={handleResolve} />}
    </motion.div>
  );

  async function handleConfirmReport(row, action) {
    try {
      if (action === 'ban') {
        const payload = {
          actionType: 'Ban',
          targetUserId: row.targetUserId,
          reportId: row.id,
          reason: 'Админ-действие из панели'
        };
        await adminService.createAction(payload);
      } else if (action === 'deletePost') {
        await adminService.deleteReportedPost(row.id);
      } else if (action === 'deleteComment') {
        await adminService.deleteReportedComment(row.id);
      }

      await adminService.resolveReport(row.id, 'Approved');
      toast.success('Жалоба подтверждена');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось выполнить действие');
    }
  }

  async function handleResolve(row, decision, resolution) {
    try {
      await adminService.resolveAppeal(row.id, decision, resolution);
      toast.success('Апелляция решена');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось решить апелляцию');
    }
  }

  async function handleReportResolution(row, status) {
    try {
      await adminService.resolveReport(row.id, status);
      toast.success('Жалоба обновлена');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось обновить жалобу');
    }
  }

  async function handleForceBan() {
    try {
      await adminService.forceBanUser(forceAction.userId, forceAction.reason);
      toast.success('Пользователь заблокирован');
      setForceAction({ userId: '', reason: '' });
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось заблокировать пользователя');
    }
  }

  async function handleForceUnban() {
    try {
      await adminService.forceUnbanUser(forceAction.userId, forceAction.reason);
      toast.success('Пользователь разблокирован');
      setForceAction({ userId: '', reason: '' });
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось разблокировать пользователя');
    }
  }
}

function ReportsTable({ data, onConfirm, onResolve }) {
  const [selectedActions, setSelectedActions] = useState({});

  const handleActionChange = (id, value) => {
    setSelectedActions(prev => ({ ...prev, [id]: value }));
  };

  const getDefaultAction = (report) => {
    if (report.targetUserId) return 'ban';
    if (report.postId) return 'deletePost';
    if (report.commentId) return 'deleteComment';
    return 'approve';
  };

  const getAvailableActions = (report) => {
    const options = [];
    if (report.targetUserId) options.push({ value: 'ban', label: 'Бан пользователя' });
    if (report.postId) options.push({ value: 'deletePost', label: 'Удалить пост' });
    if (report.commentId) options.push({ value: 'deleteComment', label: 'Удалить комментарий' });
    if (!options.length) options.push({ value: 'approve', label: 'Подтвердить жалобу' });
    return options;
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100">
      <table className="table table-zebra text-sm min-w-[980px]">
        <thead>
          <tr>
            <th>Репортёр</th>
            <th>Пользователь</th>
            <th>Пост</th>
            <th>Комментарий</th>
            <th>Статус</th>
            <th>Причина</th>
            <th>Создано</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(r => (
            <tr key={r.id}>
              <td>
                {r.reporterUserId ? (
                  <Link className="link" to={`/users/${r.reporterUserId}`}>
                    {r.reporterUsername || `ID ${r.reporterUserId}`}
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {r.targetUserId ? (
                  <Link className="link" to={`/users/${r.targetUserId}`}>
                    {r.targetUsername || `ID ${r.targetUserId}`}
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {r.postId ? <a className="link" href={`/posts/${r.postId}`}>Открыть</a> : '-'}
              </td>
              <td>{r.commentId ? 'Есть' : '-'}</td>
              <td>{r.status}</td>
              <td className="max-w-[240px] truncate" title={r.reason}>{r.reason}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    className="select select-bordered select-xs min-w-[180px]"
                    value={selectedActions[r.id] ?? getDefaultAction(r)}
                    onChange={e => handleActionChange(r.id, e.target.value)}
                  >
                    {getAvailableActions(r).map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => onConfirm(r, selectedActions[r.id] ?? getDefaultAction(r))}
                    >
                      Подтвердить
                    </button>
                    <button className="btn btn-xs" onClick={() => onResolve(r, 'Rejected')}>Отклонить</button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination data={data} />
    </div>
  );
}

function ActionsTable({ data, forceAction, onForceChange, onForceBan, onForceUnban }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');

  useEffect(() => {
    if (!forceAction.userId) {
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchOpen(false);
      setSelectedUserName('');
    }
  }, [forceAction.userId]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await usersService.search(query, 1, 10);
        const items = Array.isArray(res) ? res : res?.items ?? [];
        setSearchResults(items);
        setIsSearchOpen(true);
      } catch (e) {
        setSearchResults([]);
        setIsSearchOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSelectedUserName('');
    if (forceAction.userId) {
      onForceChange({ ...forceAction, userId: '' });
    }
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSelectUser = (user) => {
    const userId = user?.id ?? user?.userId ?? '';
    const username = user?.username ?? user?.userName ?? `ID ${userId}`;
    onForceChange({ ...forceAction, userId });
    setSearchQuery(username);
    setSelectedUserName(username);
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-base-200 rounded-2xl p-4">
        <h3 className="font-semibold mb-3">Принудительные действия</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px,1fr,auto,auto] md:items-center">
          <div className="relative">
            <input
              className="input input-bordered input-sm w-full"
              placeholder="Пользователь"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length) setIsSearchOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsSearchOpen(false), 150);
              }}
            />
            {selectedUserName && forceAction.userId && (
              <div className="text-xs opacity-70 mt-1">
                Выбран: {selectedUserName} (ID {forceAction.userId})
              </div>
            )}
            {isSearchOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-base-300 bg-base-100 shadow-lg">
                {isSearching && (
                  <div className="px-3 py-2 text-xs opacity-70">Поиск...</div>
                )}
                {!isSearching && !searchResults.length && (
                  <div className="px-3 py-2 text-xs opacity-70">Совпадений не найдено</div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <ul className="max-h-56 overflow-auto">
                    {searchResults.map(user => {
                      const userId = user?.id ?? user?.userId;
                      const username = user?.username ?? user?.userName ?? 'Без имени';
                      return (
                        <li key={userId}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-base-200"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelectUser(user);
                            }}
                          >
                            {username} (ID {userId})
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          <input
            className="input input-bordered input-sm flex-1 min-w-[200px]"
            placeholder="Причина (необязательно)"
            value={forceAction.reason}
            onChange={e => onForceChange({ ...forceAction, reason: e.target.value })}
          />
          <button className="btn btn-sm btn-error" onClick={onForceBan} disabled={!forceAction.userId}>
            Заблокировать
          </button>
          <button className="btn btn-sm" onClick={onForceUnban} disabled={!forceAction.userId}>
            Разблокировать
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100">
        <table className="table table-zebra text-sm min-w-[840px]">
          <thead>
            <tr>
              <th>Админ</th>
              <th>Тип</th>
              <th>Пользователь</th>
              <th>Причина</th>
              <th>Создано</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(a => (
              <tr key={a.id}>
                <td>
                  {a.adminUserId ? (
                    <Link className="link" to={`/users/${a.adminUserId}`}>
                      {a.adminUsername || `ID ${a.adminUserId}`}
                    </Link>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{a.actionType}</td>
                <td>
                  {a.targetUserId ? (
                    <Link className="link" to={`/users/${a.targetUserId}`}>
                      {a.targetUsername || `ID ${a.targetUserId}`}
                    </Link>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="max-w-[240px] truncate" title={a.reason}>{a.reason}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination data={data} />
      </div>
    </div>
  );
}

function AppealsTable({ data, onResolve }) {
  const [resolutions, setResolutions] = useState({});

  const handleResolutionChange = (id, value) => {
    setResolutions(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100">
      <table className="table table-zebra text-sm min-w-[980px]">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Статус</th>
            <th>Сообщение</th>
            <th>Создано</th>
            <th>Решение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(a => (
            <tr key={a.id}>
              <td>
                {a.userId ? (
                  <Link className="link" to={`/users/${a.userId}`}>
                    {a.username || `ID ${a.userId}`}
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td>{a.status}</td>
              <td className="max-w-[300px] truncate" title={a.message}>{a.message}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
              <td>
                <input
                  className="input input-bordered input-xs w-full min-w-[180px]"
                  placeholder="Введите решение"
                  value={resolutions[a.id] ?? a.resolution ?? ''}
                  onChange={e => handleResolutionChange(a.id, e.target.value)}
                />
              </td>
              <td className="space-x-2">
                <button className="btn btn-xs btn-success" onClick={() => onResolve(a, 'Approved', resolutions[a.id] || '')}>Подтвердить</button>
                <button className="btn btn-xs btn-error" onClick={() => onResolve(a, 'Rejected', resolutions[a.id] || '')}>Отклонить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination data={data} />
    </div>
  );
}

function Pagination({ data }) {
  const pages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 20)));
  if (pages <= 1) return null;
  return (
    <div className="join mt-4">
      {Array.from({ length: pages }).map((_, i) => (
        <a key={i} href={`?page=${i + 1}`} className={`join-item btn btn-sm ${data.page === (i + 1) ? 'btn-primary' : ''}`}>{i + 1}</a>
      ))}
    </div>
  );
}
