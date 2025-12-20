// Shared API base configuration
// VITE_API_BASE должен указывать на корень API без суффикса `/api`.
const rawBase = import.meta.env.VITE_API_BASE ?? '';

// Убираем лишние слэши и возможный хвостовой /api, чтобы REST префикс добавлялся один раз.
const cleanedBase = rawBase.replace(/\/+$/, '');
const API_BASE = cleanedBase.replace(/\/api$/i, '');

if (!API_BASE && import.meta.env.PROD) {
  console.warn(
    '[API] VITE_API_BASE не задан или заканчивается на /api. В прод-сборке будут использоваться относительные запросы; настрой backend proxy или переменную окружения без /api.'
  );
}

const API_PREFIX = '/api';

export { API_BASE, API_PREFIX };
