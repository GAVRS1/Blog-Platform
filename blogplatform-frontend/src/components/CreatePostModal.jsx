// src/components/CreatePostModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Article'); // 'Article', 'Photo', 'Video', 'Music'
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false); // Добавлено состояние загрузки

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Начинаем загрузку

    try {
      let mediaUrl = null;

      // --- НОВАЯ ЛОГИКА: Загрузка медиа через MediaController ---
      if (file && type !== 'Article') {
        // Определяем тип для MediaController на основе contentType
        let mediaType = 'post_image'; // Значение по умолчанию
        if (type === 'Photo') mediaType = 'post_image';
        else if (type === 'Video') mediaType = 'post_video';
        else if (type === 'Music') mediaType = 'post_audio';

        // Создаем FormData для загрузки файла
        const mediaFormData = new FormData();
        mediaFormData.append('file', file);

        // Загружаем файл через Media/upload
        // ВАЖНО: Убедитесь, что эндпоинт правильный и не содержит лишнего /api/
        const uploadResponse = await api.post(
          `/Media/upload?type=${mediaType}`,
          mediaFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log('Media upload response:', uploadResponse.data); // Для отладки

        // Извлекаем URL из ответа
        // Адаптируйте это в зависимости от структуры ответа вашего MediaController
        // Например: { url: "..." } или { uploadResult: { publicUrl: "..." } }
        mediaUrl = uploadResponse.data.url || uploadResponse.data.uploadResult?.publicUrl || uploadResponse.data.uploadResult?.url;

        if (!mediaUrl) {
          throw new Error('Не удалось получить URL загруженного файла');
        }

        // Опционально: корректируем URL, если нужно (например, заменить \ на /)
        mediaUrl = mediaUrl.replace(/\\/g, '/');
      }
      // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

      // --- Создание поста с URL медиа ---
      const postFormData = new FormData();
      postFormData.append('title', title);
      postFormData.append('content', content);
      postFormData.append('contentType', type);

      // Добавляем URL медиа в соответствующее поле
      if (mediaUrl) {
        // Определяем, в какое поле добавить URL, основываясь на типе
        // Убедитесь, что имена полей соответствуют ожидаемым в PostDto
        if (type === 'Photo') {
          postFormData.append('imageUrl', mediaUrl);
        } else if (type === 'Video') {
          postFormData.append('videoUrl', mediaUrl);
        } else if (type === 'Music') {
          postFormData.append('audioUrl', mediaUrl);
        }
        // Для 'Article' mediaUrl будет null, и поле добавлено не будет
      }

      // Отправляем данные поста (включая URL медиа) в PostsController
      // ВАЖНО: Убедитесь, что эндпоинт правильный и не содержит лишнего /api/
      await api.post('/posts', postFormData, { // Используем postFormData, а не оригинальный formData
        headers: { 'Content-Type': 'multipart/form-data' }, // Важно для FormData
      });

      toast.success('Пост опубликован!');
      onCreated(); // Вызываем onCreated, который может обновить ленту
      onClose();   // Закрываем модалку
    } catch (err) {
      console.error('Ошибка при создании поста:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при публикации';
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card bg-base-100 w-full max-w-lg shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="card-body gap-4">
          <h3 className="card-title text-primary">Создать пост</h3>
          
          <label className="form-control">
            <span className="label-text font-semibold">Заголовок</span>
            <input
              type="text"
              className="input input-bordered input-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading} // Блокируем во время загрузки
            />
          </label>
          
          <label className="form-control">
            <span className="label-text font-semibold">Тип контента</span>
            <select
              className="select select-bordered select-primary"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading} // Блокируем во время загрузки
            >
              <option value="Article">Статья</option>
              <option value="Photo">Фото</option>
              <option value="Video">Видео</option>
              <option value="Music">Аудио</option>
            </select>
          </label>
          
          {type !== 'Article' && (
            <label className="form-control">
              <span className="label-text font-semibold">Файл</span>
              <div
                className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-sm transition-colors
                  ${drag ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <span className="text-primary">{file.name}</span>
                ) : (
                  <span className="text-base-content/60">
                    Перетащите файл или <label className="link link-primary cursor-pointer">выберите</label>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} disabled={loading} />
                  </span>
                )}
              </div>
            </label>
          )}
          
          <label className="form-control">
            <span className="label-text font-semibold">Текст</span>
            <textarea
              className="textarea textarea-bordered textarea-primary"
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading} // Блокируем во время загрузки
            />
          </label>
          
          <div className="card-actions justify-end mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`} // Индикатор загрузки
              disabled={loading} 
            >
              {loading ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}