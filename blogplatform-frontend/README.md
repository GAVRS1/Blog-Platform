# Blog Platform Frontend

## API base URL

- В продакшене фронту нужен origin бэкенда. Устанавливай переменную окружения **`VITE_API_BASE`** (без `/api` в конце, axios добавит его сам). Тот же корень используется для SignalR-подключений `/hubs/...`.
- Для деплоя на Netlify задай переменную в настройках сайта или через `netlify.toml`/Dashboard. Минимально достаточно `VITE_API_BASE="https://blogcontent-webapi.onrender.com"`.
- Если переменная не задана в прод-сборке, приложение продолжит ходить на относительный `/api`, но в консоли появится предупреждение. Чтобы это работало, должен быть настроен прокси (см. ниже).

## Прокси для Netlify

- `netlify.toml` содержит redirect `from = "/api/*"` → `https://blogcontent-webapi.onrender.com/api/:splat` со статусом `200`, чтобы относительные запросы `/api` отправлялись на бэкенд.
- При необходимости подставь свой origin бэкенда в этот redirect и синхронизируй его со значением `VITE_API_BASE`.

## Локальный запуск

```bash
npm install
npm run dev
```
