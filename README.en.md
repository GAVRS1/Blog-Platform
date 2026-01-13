# Blog Platform

[Русская версия → README.ru.md](README.ru.md)

## Overview

Blog Platform is a multi-project solution for publishing articles and media content. It includes a backend API, a web frontend, and supporting libraries. The stack centers on .NET (ASP.NET Core) for the backend and Vite for the frontend.

## Quick start

1. Configure the backend connection string and service settings (see `BlogContent.WebAPI/BlogContent.WebAPI/appsettings.json`).
2. Start the backend API.
3. Start the frontend web app.

Detailed steps are in the **Run instructions** section below.

## Dependencies

### Backend

- .NET SDK (compatible with the solution)
- PostgreSQL

### Frontend

- Node.js (LTS recommended)
- npm (ships with Node.js)

## Project structure

```
BlogContent.Core/         # Domain models, enums, shared utilities
BlogContent.Data/         # Data access and EF Core context/repositories
BlogContent.Services/     # Business logic services
BlogContent.WebAPI/       # ASP.NET Core Web API backend
BlogContent.WPF/          # Optional desktop client (WPF)
blogplatform-frontend/    # Web frontend (Vite)
```

## Run instructions

### Backend (ASP.NET Core Web API)

1. Update the database connection string in:
   - `BlogContent.WebAPI/BlogContent.WebAPI/appsettings.json`
2. (Optional) Apply migrations if available:
   ```bash
   dotnet ef database update --project BlogContent.Data
   ```
3. Run the API:
   ```bash
   dotnet run --project BlogContent.WebAPI/BlogContent.WebAPI
   ```

The API will start on the configured ASP.NET Core URL (see console output or launch settings).

### Frontend (Vite)

1. Install dependencies:
   ```bash
   cd blogplatform-frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

The frontend will be available on `http://localhost:5173` by default.
