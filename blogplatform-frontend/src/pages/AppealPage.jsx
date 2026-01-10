// src/pages/AppealPage.jsx
import { useState } from 'react';
import { appealsService } from '@/services/appeals';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AppealPage() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Опишите причину апелляции');
    setBusy(true);
    try {
      await appealsService.create(message.trim());
      setDone(true);
      toast.success('Апелляция отправлена, ожидайте решения');
      setMessage('');
    } catch (e1) {
      toast.error(e1.response?.data || 'Не удалось отправить апелляцию');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="card bg-base-100 shadow">
        <form className="card-body" onSubmit={submit}>
          <h1 className="card-title">Апелляция</h1>
          <p className="opacity-70">Если ваш аккаунт ограничен или вы не согласны с модерацией, опишите ситуацию.</p>

          <div className="form-control">
            <label className="label"><span className="label-text">Сообщение</span></label>
            <textarea
              className="textarea textarea-bordered"
              rows={5}
              placeholder="Опишите, почему решение следует пересмотреть…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {done && <div className="alert alert-info">Мы получили вашу апелляцию. Ответ придёт в уведомления.</div>}

          <div className="card-actions justify-end">
            <button className={`btn btn-primary ${busy ? 'loading' : ''}`} disabled={busy}>Отправить</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
