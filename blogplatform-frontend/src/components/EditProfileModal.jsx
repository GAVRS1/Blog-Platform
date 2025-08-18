import { useState, useEffect } from 'react';
import api from '@/api/axios';
import AvatarUploader from './AvatarUploader';
import toast from 'react-hot-toast';

export default function EditProfileModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    bio: '',
    birthDate: '',
  });
  const [avatarBlob, setAvatarBlob] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const { username, profile } = res.data;
      setForm({
        username,
        fullName: profile.fullName,
        bio: profile.bio,
        birthDate: profile.birthDate?.split('T')[0] || '',
      });
    });
  }, []);

  const handleSave = async () => {
    try {
      // 1. обновляем текстовые поля
      await api.put('/users/profile', {
        fullName: form.fullName,
        bio: form.bio,
        birthDate: form.birthDate,
      });

      // 2. если выбран новый аватар – грузим
      if (avatarBlob) {
        const fd = new FormData();
        fd.append('file', avatarBlob);
        fd.append('type', 'avatar');
        const { data } = await api.post('/media/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await api.put('/users/profile/avatar', { avatarUrl: data.url });
      }

      toast.success('Профиль обновлён!');
      onSaved();
    } catch (e) {
      toast.error('Ошибка при сохранении');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-lg mb-4">Редактировать профиль</h3>

        <label className="form-control">
          <span className="label-text">Никнейм</span>
          <input
            className="input input-bordered"
            value={form.username}
            disabled
          />
        </label>

        <label className="form-control">
          <span className="label-text">Имя и фамилия</span>
          <input
            className="input input-bordered"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
          />
        </label>

        <label className="form-control">
          <span className="label-text">О себе</span>
          <textarea
            className="textarea textarea-bordered"
            rows={3}
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </label>

        <label className="form-control">
          <span className="label-text">Дата рождения</span>
          <input
            type="date"
            className="input input-bordered"
            value={form.birthDate}
            onChange={e => setForm({ ...form, birthDate: e.target.value })}
          />
        </label>

        <AvatarUploader onCropped={setAvatarBlob} />

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
          <button className="btn" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}