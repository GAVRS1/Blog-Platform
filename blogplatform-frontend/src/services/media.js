// src/services/media.js
import api from '@/api/axios';

/**
 * Унифицированная загрузка медиа на сервер.
 * По API: POST /api/Media/upload (multipart/form-data) с полями file и type
 * Возвращаемое значение ожидаем как минимум { url: string, thumbnailUrl?: string }
 */
export const mediaService = {
  /**
   * @param {File} file
   * @param {'image'|'video'|'audio'|'file'|'other'} type
   * @returns {{ url: string, thumbnailUrl?: string, mediaType?: number, sizeBytes?: number, mimeType?: string, type?: string }}
   */
  async upload(file, type = 'image', options = {}) {
    if (!(file instanceof File)) {
      throw new Error('mediaService.upload: "file" должен быть File');
    }
    // Строго нормализуем тип под API
    const t = (type || '').toLowerCase();
    const safeType = ['image', 'video', 'audio', 'file', 'other'].includes(t) ? t : undefined;

    const { isPublic = false } = options;
    const endpoint = isPublic ? '/Media/upload/public' : '/Media/upload';

    const form = new FormData();
    form.append('file', file);

    if (safeType) {
      form.append('type', safeType);
    }

    let data;
    try {
      ({ data } = await api.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));
    } catch (error) {
      if (error?.response) {
        console.error('[mediaService.upload] Upload failed', {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error('[mediaService.upload] Upload failed', error);
      }
      throw error;
    }

    if (!data || !data.url) {
      throw new Error('Сервер не вернул URL загруженного файла');
    }
    return data;
  },

  /**
   * Публичная загрузка (без обязательного токена) — используется на экранах регистрации.
   * @param {File} file
   * @param {'image'|'video'|'audio'|'file'|'other'} type
   */
  async uploadPublic(file, type = 'image') {
    return this.upload(file, type, { isPublic: true });
  },

  /**
   * Пакетная загрузка до 10 файлов.
   * @param {File[]} files
   * @param {('image'|'video'|'audio'|'file'|'other')[]|undefined} types
   * @param {{ isPublic?: boolean }} options
   */
  async uploadBatch(files, types = [], options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('mediaService.uploadBatch: передайте файлы');
    }
    if (files.length > 10) {
      throw new Error('Можно загрузить не более 10 файлов за раз');
    }

    const { isPublic = false } = options;
    const endpoint = isPublic ? '/Media/upload/public/batch' : '/Media/upload/batch';
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    types.forEach((t) => {
      if (t) form.append('types', t);
    });

    const { data } = await api.post(endpoint, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },
};
