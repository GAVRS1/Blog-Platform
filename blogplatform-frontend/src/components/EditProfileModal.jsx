import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import AvatarUploader from './AvatarUploader';
import { checkUniqueUsername } from '@/utils/uniqueCheck';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';

export default function EditProfileModal({ onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    bio: '',
    birthDate: '',
  });
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  const debouncedCheck = debounce(async (value) => {
    if (!value || value === form.originalUsername) return;
    const ok = await checkUniqueUsername(value);
    setUsernameError(ok ? '' : 'Никнейм занят');
  }, 500);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setForm({
        username: data.username,
        originalUsername: data.username,
        fullName: data.profile?.fullName || '',
        bio: data.profile?.bio || '',
        birthDate: data.profile?.birthDate?.split('T')[0] || '',
      });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'username') debouncedCheck(value);
  };

  const handleSave = async () => {
    if (usernameError) return;
    try {
      await api.put('/users/profile', {
        username: form.username,
        fullName: form.fullName,
        bio: form.bio,
        birthDate: form.birthDate,
      });

      if (avatarBlob) {
        const fd = new FormData();
        fd.append('file', avatarBlob);
        fd.append('type', 'avatar');
        const { data: media } = await api.post('/media/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await api.put('/users/profile/avatar', { avatarUrl: media.url });
      }

      await queryClient.invalidateQueries(['me']);
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
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="input input-bordered"
          />
          {usernameError && <span className="text-error text-xs">{usernameError}</span>}
        </label>

        <label className="form-control">
          <span className="label-text">Имя и фамилия</span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="input input-bordered"
          />
        </label>

        <label className="form-control">
          <span className="label-text">Дата рождения</span>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            className="input input-bordered"
          />
        </label>

        <label className="form-control">
          <span className="label-text">О себе</span>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="textarea textarea-bordered"
          />
        </label>

        <AvatarUploader onCropped={setAvatarBlob} />

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSave}>
            Сохранить
          </button>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}