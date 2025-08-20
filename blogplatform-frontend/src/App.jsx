// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';

// Компоненты
import Sidebar      from '@/components/Sidebar';
import BottomNav    from '@/components/BottomNav';
import AddPostFAB   from '@/components/AddPostFAB';
import withAuth     from '@/hocs/withAuth';

// Ленивые страницы
const HomePage       = lazy(() => import('@/pages/HomePage'));
const LoginPage      = lazy(() => import('@/pages/LoginPage'));
const RegisterPage   = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage    = lazy(() => import('@/pages/ProfilePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));

// Защищённые обёртки
const ProtectedProfile = withAuth(ProfilePage);

// Спиннер
const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
);

// Layout только для авторизованных страниц
function ProtectedLayout() {
  return (
    <div className="min-h-screen flex bg-base-200">
      <Sidebar />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <BottomNav />
      <AddPostFAB />
    </div>
  );
}

// Root-компонент
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищённые маршруты */}
          <Route element={<ProtectedLayout />}>
            <Route path="/"         element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/profile"  element={<ProtectedProfile />} />
          </Route>

          {/* Перенаправление остального */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    </ThemeProvider>
  );
}