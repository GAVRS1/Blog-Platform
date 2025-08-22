// src/components/CreatePostModal.jsx - УЛУЧШЕННАЯ ВЕРСИЯ  
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Article');
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const postTypes = [
    { value: 'Article', label: 'Статья', icon: '📝' },
    { value: 'Photo', label: 'Фото', icon: '📸' },
    { value: 'Video', label: 'Видео', icon: '🎬' },
    { value: 'Music', label: 'Музыка', icon: '🎵' },
  ];

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Введите заголовок поста');
      return;
    }

    setLoading(true);

    try {
      let mediaUrl = null;

      if (file && type !== 'Article') {
        let mediaType = 'post_image';
        if (type === 'Video') mediaType = 'post_video';
        if (type === 'Music') mediaType = 'post_audio';

        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        mediaFormData.append('type', mediaType);

        const mediaResponse = await api.post('/media/upload', mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        mediaUrl = mediaResponse.data.url;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        type,
        mediaUrl,
      };

      await api.post('/posts', postData);
      
      toast.success('Пост создан успешно!');
      onCreated?.();
      onClose();
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании поста';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDrag(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-base-200">
            <h2 className="text-2xl font-bold text-base-content">Создать пост</h2>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-base-200 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">✕</span>
            </motion.button>
          </div>

          {/* Содержимое */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 overflow-y-auto flex-1">
              {/* Выбор типа поста */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-base-content/70 mb-3">
                  Тип поста
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {postTypes.map((postType) => (
                    <motion.button
                      key={postType.value}
                      type="button"
                      onClick={() => setType(postType.value)}
                      className={`p-3 rounded-2xl border transition-all duration-200 ${
                        type === postType.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-base-300 hover:border-primary/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-1">{postType.icon}</div>
                      <div className="text-xs font-medium">{postType.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Заголовок */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-base-content/70 mb-2">
                  Заголовок *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="О чем ваш пост?"
                  className="w-full px-4 py-3 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  maxLength={100}
                />
                <div className="text-xs text-base-content/50 mt-1">
                  {title.length}/100
                </div>
              </div>

              {/* Содержание */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-base-content/70 mb-2">
                  Содержание
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Расскажите подробнее..."
                  rows={4}
                  className="w-full px-4 py-3 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-base-content/50 mt-1">
                  {content.length}/1000
                </div>
              </div>

              {/* Загрузка файла */}
              {type !== 'Article' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-base-content/70 mb-2">
                    Медиа файл
                  </label>
                  
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      drag ? 'border-primary bg-primary/5' : 'border-base-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Предпросмотр"
                          className="max-h-48 mx-auto rounded-xl object-cover"
                        />
                        <motion.button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 bg-error text-white rounded-full p-1 text-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✕
                        </motion.button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">
                          {type === 'Photo' && '📸'}
                          {type === 'Video' && '🎬'}
                          {type === 'Music' && '🎵'}
                        </div>
                        <p className="text-base-content/60 mb-2">
                          Перетащите файл сюда или нажмите для выбора
                        </p>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          accept={
                            type === 'Photo' ? 'image/*' :
                            type === 'Video' ? 'video/*' :
                            type === 'Music' ? 'audio/*' : '*'
                          }
                          className="hidden"
                          id="file-input"
                        />
                        <motion.label
                          htmlFor="file-input"
                          className="btn btn-outline btn-primary cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Выбрать файл
                        </motion.label>
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="mt-3 text-sm text-base-content/60">
                      Выбран: {file.name} ({Math.round(file.size / 1024)} КБ)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 p-6 border-t border-base-200">
              <motion.button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Отмена
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !title.trim()}
                className="btn btn-primary flex-1"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading loading-spinner loading-sm" />
                    Публикация...
                  </div>
                ) : (
                  'Опубликовать'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
