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
  async upload(file, type = 'image') {
    if (!(file instanceof File)) {
      throw new Error('mediaService.upload: "file" должен быть File');
    }
    // Строго нормализуем тип под API
    const t = (type || 'image').toLowerCase();
    const safeType = ['image', 'video', 'audio', 'file'].includes(t) ? t : 'image';

    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post(`/Media/upload`, form, {
      params: { type: safeType },
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!data || !data.url) {
      throw new Error('Сервер не вернул URL загруженного файла');
    }
    return data;
  },
};
