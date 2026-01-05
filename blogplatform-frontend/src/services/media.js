// src/services/media.js
import api from '@/api/axios';

/**
 * Унифицированная загрузка медиа на сервер.
 * По OpenAPI у тебя: POST /api/Media/upload?type={string}
 * Возвращаемое значение ожидаем как минимум { url: string, thumbnailUrl?: string }
 */
export const mediaService = {
  /**
   * @param {File} file
   * @param {'image'|'video'|'audio'|'file'} type
   * @returns {{ url: string, thumbnailUrl?: string, mediaType?: number, sizeBytes?: number, mimeType?: string }}
   */
  async upload(file, type = 'image', options = {}) {
    if (!(file instanceof File)) {
      throw new Error('mediaService.upload: "file" должен быть File');
    }
    // Строго нормализуем тип под API
    const t = (type || 'image').toLowerCase();
    const safeType = ['image', 'video', 'audio', 'file'].includes(t) ? t : 'image';

    const { isPublic = false } = options;
    const endpoint = isPublic ? '/Media/upload/public' : '/Media/upload';

    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post(endpoint, form, {
      params: { type: safeType },
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!data || !data.url) {
      throw new Error('Сервер не вернул URL загруженного файла');
    }
    return data;
  },

  /**
   * Публичная загрузка (без обязательного токена) — используется на экранах регистрации.
   * @param {File} file
   * @param {'image'|'video'|'audio'|'file'} type
   */
  async uploadPublic(file, type = 'image') {
    return this.upload(file, type, { isPublic: true });
  },
};
