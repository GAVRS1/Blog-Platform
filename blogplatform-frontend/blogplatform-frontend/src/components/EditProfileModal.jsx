// src/components/EditProfileModal.jsx
import { useState, useEffect } from 'react';
import AvatarUploader from './AvatarUploader';
import api from '../api/axios';

export default function EditProfileModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    bio: '',
    birthDate: '',
    file: null
  });

  useEffect(() => {
    api.get('/users/me').then(res => {
      setForm({
        username: res.data.username || '',
        fullName: res.data.fullName || '',
        bio: res.data.bio || '',
        birthDate: res.data.birthDate || '',
        file: null
      });
    });
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = file =>
    setForm({ ...form, file });

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(form).forEach(k => data.append(k, form[k]));
    await api.put('/users/me', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Редактировать профиль</h2>

        <label>Никнейм</label>
        <input name="username" value={form.username} onChange={handleChange} />

        <label>ФИО</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} />

        <label>О себе</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />

        <label>Дата рождения</label>
        <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} />

        <label>Аватар</label>
        <AvatarUploader onFile={handleFile} />

        <div className="modal-actions">
          <button onClick={handleSave}>Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}