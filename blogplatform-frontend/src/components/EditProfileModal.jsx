// src/components/EditProfileModal.jsx
import { useEffect, useState } from 'react';
import { usersService } from '@/services/users';
import AvatarUploader from '@/components/AvatarUploader';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfileModal({ open, onClose, initial, onSaved }) {
  const [model, setModel] = useState(() => ({
    fullName: initial?.profile?.fullName || '',
    bio: initial?.profile?.bio || '',
    birthDate: initial?.profile?.birthDate ? initial.profile.birthDate.substring(0, 10) : '',
    profilePictureUrl: initial?.profile?.profilePictureUrl || ''
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setModel({
      fullName: initial?.profile?.fullName || '',
      bio: initial?.profile?.bio || '',
      birthDate: initial?.profile?.birthDate ? initial.profile.birthDate.substring(0, 10) : '',
      profilePictureUrl: initial?.profile?.profilePictureUrl || ''
    });
  }, [initial]);

  const onAvatarUploaded = (url) => {
    setModel((m) => ({ ...m, profilePictureUrl: url }));
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: model.fullName?.trim(),
        bio: model.bio?.trim(),
        birthDate: model.birthDate || null,
        profilePictureUrl: model.profilePictureUrl || null
      };
      const updated = await usersService.updateProfile(payload);
      toast.success('Профиль обновлён');
      onSaved?.(updated);
      onClose?.();
    } catch (e1) {
      toast.error(e1.response?.data || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
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
            onSubmit={save}
            className="card w-full max-w-2xl bg-base-100 shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Редактировать профиль</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="text-sm opacity-70 mb-2">Аватар</div>
                  <AvatarUploader onUploaded={onAvatarUploaded} />
                  {model.profilePictureUrl && (
                    <div className="mt-2 text-xs opacity-70">
                      Аватар загружен
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Полное имя</span></label>
                    <input
                      className="input input-bordered"
                      value={model.fullName}
                      onChange={(e) => setModel(m => ({ ...m, fullName: e.target.value }))}
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text">О себе</span></label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={model.bio}
                      onChange={(e) => setModel(m => ({ ...m, bio: e.target.value }))}
                      placeholder="Пара слов о себе…"
                      rows={4}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text">Дата рождения</span></label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={model.birthDate}
                      onChange={(e) => setModel(m => ({ ...m, birthDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end">
                <button className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                  Сохранить
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
