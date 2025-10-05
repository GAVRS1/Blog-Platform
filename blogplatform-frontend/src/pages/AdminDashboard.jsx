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
            {tab === 'reports' && ['Open','UnderReview','Resolved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            {tab === 'appeals' && ['Submitted','InReview','Approved','Denied'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button className="btn btn-sm" onClick={() => load(data.page)}>Обновить</button>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && tab === 'reports' && <ReportsTable data={data} onAction={handleAction} />}
      {!loading && tab === 'actions' && <ActionsTable data={data} />}
      {!loading && tab === 'appeals' && <AppealsTable data={data} onResolve={handleResolve} />}
    </motion.div>
  );

  async function handleAction(type, row) {
    try {
      const payload = { actionType: type, targetUserId: row.targetUserId, postId: row.postId, reason: 'Админ-действие из панели' };
      await adminService.createAction(payload);
      toast.success('Действие выполнено');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось выполнить действие');
    }
  }

  async function handleResolve(row, decision) {
    try {
      await adminService.resolveAppeal(row.id, decision);
      toast.success('Апелляция решена');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось решить апелляцию');
    }
  }
}

function ReportsTable({ data, onAction }) {
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
              <td>#{r.reporterId}</td>
              <td>{r.targetUserId ? `#${r.targetUserId}` : '-'}</td>
              <td>{r.postId ? <a className="link" href={`/posts/${r.postId}`}>#{r.postId}</a> : '-'}</td>
              <td>{r.commentId || '-'}</td>
              <td>{r.status}</td>
              <td className="max-w-[240px] truncate" title={r.reason}>{r.reason}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td className="space-x-2">
                {r.postId && (
                  <button className="btn btn-xs btn-error" onClick={() => onAction('DeletePost', r)}>Удалить пост</button>
                )}
                {r.targetUserId && (
                  <>
                    <button className="btn btn-xs btn-warning" onClick={() => onAction('SuspendUser', r)}>Заморозить</button>
                    <button className="btn btn-xs btn-error" onClick={() => onAction('BanUser', r)}>Забанить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination data={data} />
    </div>
  );
}

function ActionsTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Admin</th><th>Type</th><th>User</th><th>Post</th><th>Reason</th><th>Создано</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>#{a.adminId}</td>
              <td>{a.actionType}</td>
              <td>{a.targetUserId || '-'}</td>
              <td>{a.postId || '-'}</td>
              <td className="max-w-[240px] truncate" title={a.reason}>{a.reason}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination data={data} />
    </div>
  );
}

function AppealsTable({ data, onResolve }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>ActionId</th><th>Status</th><th>Message</th><th>Создано</th><th>Решение</th>
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
              <td className="space-x-2">
                <button className="btn btn-xs btn-success" onClick={() => onResolve(a, 'Approved')}>Одобрить</button>
                <button className="btn btn-xs btn-error" onClick={() => onResolve(a, 'Denied')}>Отклонить</button>
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