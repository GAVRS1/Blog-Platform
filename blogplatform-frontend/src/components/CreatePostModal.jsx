import { useState } from 'react';
import api from '../api/axios';

export default function CreatePostModal({ onClose, onCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('Article');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('contentType', type);
    if (file) formData.append('file', file);

    await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    onCreated();
    onClose();
    };

    return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Создать пост</h2>
        <form onSubmit={handleSubmit}>
            <label>Заголовок</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required />

            <label>Тип контента</label>
            <select value={type} onChange={e => setType(e.target.value)}>
            <option value="Article">Статья</option>
            <option value="Photo">Фото</option>
            <option value="Video">Видео</option>
            <option value="Music">Аудио</option>
            </select>

            {type !== 'Article' && (
            <label>
                Файл
                <input type="file" onChange={e => setFile(e.target.files[0])} />
            </label>
            )}

            <label>Текст</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required />

            <div className="modal-actions">
            <button type="submit">Опубликовать</button>
            <button type="button" onClick={onClose}>Отмена</button>
            </div>
        </form>
        </div>
    </div>
    );
}