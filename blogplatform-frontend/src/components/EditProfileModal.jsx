// src/components/EditProfileModal.jsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import AvatarUploader from './AvatarUploader';
import { checkUniqueUsername } from '@/utils/uniqueCheck';
import debounce from 'lodash.debounce';
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
  const [loading, setLoading] = useState(false);

  const debouncedCheck = debounce(async (value) => {
    if (!value || value === form.originalUsername) return;
    try {
      const ok = await checkUniqueUsername(value);
      setUsernameError(ok ? '' : 'Никнейм занят');
    } catch (error) {
      console.error('Ошибка проверки никнейма:', error);
    }
  }, 500);

  useEffect(() => {
    api.get('/Auth/me').then(({ data }) => {
      setForm({
        username: data.username || '',
        originalUsername: data.username || '',
        fullName: data.profile?.fullName || '',
        bio: data.profile?.bio || '',
        birthDate: data.profile?.birthDate?.split('T')[0] || '',
      });
    }).catch(error => {
      toast.error('Не удалось загрузить данные профиля');
      console.error('Ошибка загрузки профиля:', error);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'username') debouncedCheck(value);
  };

  const handleSave = async () => {
    if (usernameError) return;
    setLoading(true);
    try {
      // Обновляем основные данные профиля
      await api.put('/Users/profile', {
        username: form.username,
        fullName: form.fullName,
        bio: form.bio,
        birthDate: form.birthDate,
      });

      // Если есть новый аватар, загружаем его
      if (avatarBlob) {
        const formData = new FormData();
        formData.append('file', avatarBlob, 'avatar.jpg');
        
        // Получаем текущего пользователя для userId
        const { data: userData } = await api.get('/Auth/me');
        
        // Загружаем файл
        const { data: uploadResult } = await api.post(
          `/Media/upload?type=avatar&userId=${userData.id}`, 
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        
        console.log('Upload result:', uploadResult); // Для отладки
        
        // Обновляем аватар пользователя - используем publicUrl
        const avatarUrl = uploadResult.publicUrl || uploadResult.url;
        if (avatarUrl) {
          await api.put('/Users/profile/avatar', avatarUrl);
        } else {
          throw new Error('Не удалось получить URL аватара');
        }
      }

      // Инвалидируем кэш для обновления данных пользователя
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast.success('Профиль успешно обновлён!');
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-lg mb-4">Редактировать профиль</h3>
        <div className="space-y-4">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Никнейм</span>
            </div>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`input input-bordered ${usernameError ? 'input-error' : ''}`}
              placeholder="Введите никнейм"
            />
            {usernameError && (
              <div className="label">
                <span className="label-text-alt text-error">{usernameError}</span>
              </div>
            )}
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Имя и фамилия</span>
            </div>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Введите имя и фамилию"
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Дата рождения</span>
            </div>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              className="input input-bordered"
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">О себе</span>
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="textarea textarea-bordered"
              placeholder="Расскажите о себе"
            />
          </label>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Аватар</span>
            </label>
            <AvatarUploader onCropped={setAvatarBlob} />
            {avatarBlob && (
              <div className="mt-2">
                <p className="text-sm text-success">Аватар готов к загрузке</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-action">
          <button 
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={loading || usernameError}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn" onClick={onClose} disabled={loading}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}