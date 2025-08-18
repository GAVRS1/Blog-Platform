// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import withAuth from '@/hocs/withAuth';

// Ленивые страницы
const HomePage       = lazy(() => import('@/pages/HomePage'));
const LoginPage      = lazy(() => import('@/pages/LoginPage'));
const RegisterPage   = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage    = lazy(() => import('@/pages/ProfilePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));

// Просто обёртка для защищённых маршрутов
const ProtectedProfile = withAuth(ProfilePage);

// Спиннер загрузки
const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
);

// Главный layout
function Layout() {
  return (
    <div className="min-h-screen flex bg-base-200">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block" />

      {/* Центральная лента */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
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
          {/* Корневой layout */}
          <Route element={<Layout />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/profile"   element={<ProtectedProfile />} />
            <Route path="/post/:id"  element={<PostDetailPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    </ThemeProvider>
  );
}