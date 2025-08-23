// src/components/CreatePostModal.jsx (исправленная версия)
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Article');
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrl = null;

      if (file && type !== 'Article') {
        let mediaType = 'post_image';
        if (type === 'Photo') mediaType = 'post_image';
        else if (type === 'Video') mediaType = 'post_video';
        else if (type === 'Music') mediaType = 'post_audio';

        const mediaFormData = new FormData();
        mediaFormData.append('file', file);

        const uploadResponse = await api.post(
          `/Media/upload?type=${mediaType}`,
          mediaFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        mediaUrl = uploadResponse.data?.url;

        if (!mediaUrl) {
          throw new Error('Не удалось получить URL загруженного файла');
        }
      }

      const postFormData = new FormData();
      postFormData.append('title', title);
      postFormData.append('content', content);
      postFormData.append('contentType', type);

      if (mediaUrl) {
        if (type === 'Photo') {
          postFormData.append('ImageUrl', mediaUrl);
        } else if (type === 'Video') {
          postFormData.append('VideoUrl', mediaUrl);
        } else if (type === 'Music') {
          postFormData.append('AudioUrl', mediaUrl);
        }
      }

      const postResponse = await api.post('/posts', postFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Пост опубликован!');
      onCreated();
      onClose();
    } catch (err) {
      let errorMessage = 'Ошибка при публикации';
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.title || JSON.stringify(err.response.data) || errorMessage;
      } else if (err.request) {
        errorMessage = 'Нет ответа от сервера';
      } else {
        errorMessage = err.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card bg-base-100 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="card-body gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-primary">Создать пост</h3>
            <button 
              type="button" 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          
          <label className="form-control">
            <span className="label-text font-semibold text-sm sm:text-base mb-1">Заголовок</span>
            <input
              type="text"
              className="input input-bordered input-primary text-sm sm:text-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <label className="form-control">
            <span className="label-text font-semibold text-sm sm:text-base mb-1">Тип контента</span>
            <select
              className="select select-bordered select-primary text-sm sm:text-base"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              <option value="Article">Статья</option>
              <option value="Photo">Фото</option>
              <option value="Video">Видео</option>
              <option value="Music">Аудио</option>
            </select>
          </label>
          
          {type !== 'Article' && (
            <label className="form-control">
              <span className="label-text font-semibold text-sm sm:text-base mb-1">Файл</span>
              <div
                className={`w-full h-24 sm:h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-xs sm:text-sm transition-colors cursor-pointer
                  ${drag ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <span className="text-primary font-medium px-2 text-center break-all">{file.name}</span>
                ) : (
                  <div className="text-center px-2">
                    <span className="text-base-content/60 block mb-1">
                      Перетащите файл сюда
                    </span>
                    <label className="link link-primary cursor-pointer text-xs sm:text-sm">
                      или нажмите для выбора
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        disabled={loading} 
                      />
                    </label>
                  </div>
                )}
              </div>
            </label>
          )}
          
          <label className="form-control">
            <span className="label-text font-semibold text-sm sm:text-base mb-1">Текст</span>
            <textarea
              className="textarea textarea-bordered textarea-primary text-sm sm:text-base resize-none"
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-4">
            <button 
              type="button" 
              className="btn btn-ghost flex-1" 
              onClick={onClose} 
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
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