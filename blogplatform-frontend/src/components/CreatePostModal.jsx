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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('contentType', type);
    if (file) formData.append('file', file);

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Пост опубликован!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data || 'Ошибка при публикации');
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
            />
          </label>

          <label className="form-control">
            <span className="label-text font-semibold">Тип контента</span>
            <select
              className="select select-bordered select-primary"
              value={type}
              onChange={(e) => setType(e.target.value)}
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
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
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
            />
          </label>

          <div className="card-actions justify-end mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Опубликовать
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}