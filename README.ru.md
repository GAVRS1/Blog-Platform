# Blog Platform

[English version → README.en.md](README.en.md)

## Обзор

Blog Platform — это мультипроектное решение для публикации статей и медиа‑контента. В составе есть backend API, web‑frontend и вспомогательные библиотеки. Основной стек: .NET (ASP.NET Core) для сервера и Vite для фронтенда.

## Быстрый старт

1. Настройте строку подключения и параметры сервиса в `BlogContent.WebAPI/BlogContent.WebAPI/appsettings.json`.
2. Запустите backend API.
3. Запустите frontend приложение.

Подробные шаги — в разделе **Инструкции по запуску** ниже.

## Зависимости

### Backend

- .NET SDK (подходящей версии для решения)
- PostgreSQL

### Frontend

- Node.js (рекомендуется LTS)
- npm (идет вместе с Node.js)

## Структура проекта

```
BlogContent.Core/         # Доменные модели, перечисления, общие утилиты
BlogContent.Data/         # Доступ к данным и EF Core контекст/репозитории
BlogContent.Services/     # Бизнес-логика
BlogContent.WebAPI/       # ASP.NET Core Web API backend
BlogContent.WPF/          # Опциональный desktop-клиент (WPF)
blogplatform-frontend/    # Web frontend (Vite)
```

## Инструкции по запуску

### Backend (ASP.NET Core Web API)

1. Обновите строку подключения к БД в:
   - `BlogContent.WebAPI/BlogContent.WebAPI/appsettings.json`
2. (Опционально) Примените миграции, если они есть:
   ```bash
   dotnet ef database update --project BlogContent.Data
   ```
3. Запустите API:
   ```bash
   dotnet run --project BlogContent.WebAPI/BlogContent.WebAPI
   ```

Адрес запуска будет указан в выводе ASP.NET Core.

### Frontend (Vite)

1. Установите зависимости:
   ```bash
   cd blogplatform-frontend
   npm install
   ```
2. Запустите dev‑сервер:
   ```bash
   npm run dev
   ```

По умолчанию фронтенд доступен на `http://localhost:5173`.
