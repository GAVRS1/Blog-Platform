// src/services/media.js
import api from '@/api/axios';

export const mediaService = {
  /**
   * Upload file with server-side validation.
   * @param {File} file
   * @param {"avatar"|"post_image"|"post_video"|"post_audio"|"chat_image"|"chat_video"|"chat_audio"|"chat_file"} type
   * @returns {{ url: string }}
   */
  upload: async (file, type) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/media/upload?type=${encodeURIComponent(type)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};