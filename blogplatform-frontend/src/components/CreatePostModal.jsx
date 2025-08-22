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
  const [loading, setLoading] = useState(false); // Состояние загрузки

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

        // --- Исправлен путь API (убран дублирующийся /api) ---
        const uploadResponse = await api.post(
          `/Media/upload?type=${mediaType}`, // <-- Путь без /api/
          mediaFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log('Media upload response:', uploadResponse.data); // Для отладки

        mediaUrl = uploadResponse.data?.url; 

        if (!mediaUrl) {
          // Добавим больше информации об ошибке для отладки
          console.error('Не удалось извлечь Url из ответа:', uploadResponse.data);
          throw new Error('Не удалось получить URL загруженного файла. Проверьте консоль.');
        }
        console.log('Извлеченный mediaUrl:', mediaUrl); // Для отладки
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
  if (type === 'Photo') {
    postFormData.append('ImageUrl', mediaUrl); // <-- 'ImageUrl' с большой 'I'
  } else if (type === 'Video') {
    postFormData.append('VideoUrl', mediaUrl); // <-- 'VideoUrl' с большой 'V'
  } else if (type === 'Music') {
    postFormData.append('AudioUrl', mediaUrl); // <-- 'AudioUrl' с большой 'A'
  }
  // Для 'Article' mediaUrl будет null, и поле добавлено не будет
}
      // --- Исправлен путь API (убран дублирующийся /api) ---
      // Отправляем данные поста (включая URL медиа) в PostsController
      const postResponse = await api.post('/posts', postFormData, { // <-- Путь без /api/
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Post creation response:', postResponse.data); // Для отладки

      toast.success('Пост опубликован!');
      onCreated(); // Вызываем onCreated, который может обновить ленту
      onClose();   // Закрываем модалку
    } catch (err) {
      console.error('Ошибка при создании поста:', err);
      // Попробуем получить более подробное сообщение об ошибке от сервера
      let errorMessage = 'Ошибка при публикации';
      if (err.response) {
        // Сервер ответил кодом состояния вне диапазона 2xx
        errorMessage = err.response.data?.message || err.response.data?.title || JSON.stringify(err.response.data) || errorMessage;
      } else if (err.request) {
        // Запрос был сделан, но ответа не получено
        errorMessage = 'Нет ответа от сервера';
      } else {
        // Что-то пошло не так при настройке запроса
        errorMessage = err.message || errorMessage;
      }
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
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
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