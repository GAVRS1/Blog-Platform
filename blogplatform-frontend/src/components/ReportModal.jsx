// src/components/ReportModal.jsx
import { useState } from 'react';
import { reportsService } from '@/services/reports';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const REASONS = [
  { value: 'Spam', label: 'Спам' },
  { value: 'Harassment', label: 'Оскорбления/преследование' },
  { value: 'Hate', label: 'Ненависть/дискриминация' },
  { value: 'Nudity', label: 'Неприемлемые материалы' },
  { value: 'Violence', label: 'Призывы к насилию' },
  { value: 'Copyright', label: 'Нарушение авторских прав' },
  { value: 'Other', label: 'Другое' }
];

export default function ReportModal({ open, onClose, subject }) {
  // subject: { type:'post'|'user'|'comment', postId?, userId?, commentId? }
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Выберите причину');
    setBusy(true);
    try {
      const payload = {
        reason,
        details: details?.trim() || undefined,
        targetUserId: subject?.type === 'user' ? subject.userId : undefined,
        postId: subject?.type === 'post' ? subject.postId : undefined,
        commentId: subject?.type === 'comment' ? subject.commentId : undefined
      };
      await reportsService.create(payload);
      toast.success('Жалоба отправлена');
      onClose?.();
      // очищаем
      setReason('Spam');
      setDetails('');
    } catch (e1) {
      const msg = e1.response?.data?.message || 'Не удалось отправить жалобу';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 grid place-items-center px-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-lg bg-base-100 shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Пожаловаться</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Причина</span></label>
                <select className="select select-bordered" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Подробности (необязательно)</span></label>
                <textarea
                  rows={4}
                  className="textarea textarea-bordered"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Опишите, что именно не так…"
                />
              </div>

              <div className="card-actions justify-end">
                <button className={`btn btn-primary ${busy ? 'loading' : ''}`} disabled={busy}>
                  Отправить
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
