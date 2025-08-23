// src/components/EditProfileModal.jsx (исправленная версия)
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
      await api.put('/Users/profile', {
        username: form.username,
        fullName: form.fullName,
        bio: form.bio,
        birthDate: form.birthDate,
      });

      if (avatarBlob) {
        let fileExtension = 'jpg';
        let mimeType = 'image/jpeg';
        
        if (avatarBlob.type) {
          mimeType = avatarBlob.type;
          if (avatarBlob.type === 'image/png') {
            fileExtension = 'png';
          } else if (avatarBlob.type === 'image/gif') {
            fileExtension = 'gif';
          } else if (avatarBlob.type === 'image/webp') {
            fileExtension = 'webp';
          }
        }
        
        const fileName = `avatar_${Date.now()}.${fileExtension}`;
        const fileWithProperName = new File([avatarBlob], fileName, { type: mimeType });
        
        const formData = new FormData();
        formData.append('file', fileWithProperName);
        
        const { data: userData } = await api.get('/Auth/me');
        
        const uploadResponse = await api.post(
          `/Media/upload?type=avatar&userId=${userData.id}`, 
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        
        let avatarUrl = uploadResponse.data.url || uploadResponse.data.uploadResult?.publicUrl || uploadResponse.data.uploadResult?.url;
        
        if (avatarUrl) {
          avatarUrl = avatarUrl
            .replace(/\\/g, '/')
            .replace(/\.tmp$/, `.${fileExtension}`);
          
          await api.put('/Users/profile/avatar', avatarUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          throw new Error('Не удалось получить URL аватара');
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast.success('Профиль успешно обновлён!');
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="font-bold text-lg sm:text-xl">Редактировать профиль</h3>
            <button 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm sm:text-base">Никнейм</span>
              </div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`input input-bordered text-sm sm:text-base ${usernameError ? 'input-error' : ''}`}
                placeholder="Введите никнейм"
              />
              {usernameError && (
                <div className="label pt-1">
                  <span className="label-text-alt text-error text-xs">{usernameError}</span>
                </div>
              )}
            </label>
            
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm sm:text-base">Имя и фамилия</span>
              </div>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="input input-bordered text-sm sm:text-base"
                placeholder="Введите имя и фамилию"
              />
            </label>
            
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm sm:text-base">Дата рождения</span>
              </div>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                className="input input-bordered text-sm sm:text-base"
              />
            </label>
            
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm sm:text-base">О себе</span>
              </div>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={2}
                className="textarea textarea-bordered text-sm sm:text-base resize-none"
                placeholder="Расскажите о себе"
              />
            </label>
            
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm sm:text-base">Аватар</span>
              </label>
              <AvatarUploader onCropped={setAvatarBlob} />
              {avatarBlob && (
                <div className="mt-2">
                  <p className="text-xs sm:text-sm text-success">Аватар готов к загрузке</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button 
              className="btn flex-1" 
              onClick={onClose} 
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={loading || usernameError}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}