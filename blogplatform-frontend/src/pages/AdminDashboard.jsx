// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
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
          onAction={handleAction}
          onResolve={handleReportResolution}
          onDeletePost={handleDeleteReportedPost}
          onDeleteComment={handleDeleteReportedComment}
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

  async function handleAction(type, row) {
    try {
      const payload = {
        actionType: type,
        targetUserId: row.targetUserId,
        reportId: row.id,
        reason: 'Админ-действие из панели'
      };
      await adminService.createAction(payload);
      toast.success('Действие выполнено');
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

  async function handleDeleteReportedPost(row) {
    try {
      await adminService.deleteReportedPost(row.id);
      toast.success('Пост удалён');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось удалить пост');
    }
  }

  async function handleDeleteReportedComment(row) {
    try {
      await adminService.deleteReportedComment(row.id);
      toast.success('Комментарий удалён');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось удалить комментарий');
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

function ReportsTable({ data, onAction, onResolve, onDeletePost, onDeleteComment }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Reporter</th><th>User</th><th>Post</th><th>Comment</th><th>Status</th><th>Reason</th><th>Создано</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>#{r.reporterUserId}</td>
              <td>{r.targetUserId ? `#${r.targetUserId}` : '-'}</td>
              <td>{r.postId ? <a className="link" href={`/posts/${r.postId}`}>#{r.postId}</a> : '-'}</td>
              <td>{r.commentId || '-'}</td>
              <td>{r.status}</td>
              <td className="max-w-[240px] truncate" title={r.reason}>{r.reason}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td className="space-x-2">
                <button className="btn btn-xs btn-success" onClick={() => onResolve(r, 'Approved')}>Одобрить</button>
                {r.targetUserId && (
                  <>
                    <button className="btn btn-xs btn-error" onClick={() => onAction('Ban', r)}>Заблокировать</button>
                  </>
                )}
                {r.postId && (
                  <button className="btn btn-xs" onClick={() => onDeletePost(r)}>Удалить пост</button>
                )}
                {r.commentId && (
                  <button className="btn btn-xs" onClick={() => onDeleteComment(r)}>Удалить комментарий</button>
                )}
                <button className="btn btn-xs" onClick={() => onResolve(r, 'Rejected')}>Отклонить</button>
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
  return (
    <div className="space-y-4">
      <div className="bg-base-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Принудительные действия</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="input input-bordered input-sm w-40"
            placeholder="User ID"
            value={forceAction.userId}
            onChange={e => onForceChange({ ...forceAction, userId: e.target.value })}
          />
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
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Admin</th><th>Type</th><th>User</th><th>Reason</th><th>Создано</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>#{a.adminUserId}</td>
                <td>{a.actionType}</td>
                <td>{a.targetUserId || '-'}</td>
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
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>ActionId</th><th>Status</th><th>Message</th><th>Создано</th><th>Resolution</th><th>Решение</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>#{a.userId}</td>
              <td>{a.moderationActionId}</td>
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
                <button className="btn btn-xs btn-success" onClick={() => onResolve(a, 'Approved', resolutions[a.id] || '')}>Одобрить</button>
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
