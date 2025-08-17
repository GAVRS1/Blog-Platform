import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import withAuth from '@/hocs/withAuth';
import ThemeToggle from '@/components/ThemeToggle';

// Ленивые страницы
const HomePage       = lazy(() => import('@/pages/HomePage'));
const LoginPage      = lazy(() => import('@/pages/LoginPage'));
const RegisterPage   = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage    = lazy(() => import('@/pages/ProfilePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));

const ProtectedProfile = withAuth(ProfilePage);

const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
          <nav className="navbar bg-primary text-primary-content shadow-lg">
            <div className="flex-1">
              <a href="/" className="btn btn-ghost text-xl normal-case">BlogPlatform</a>
            </div>
            <div className="flex-none gap-2">
              <a href="/" className="btn btn-ghost btn-sm rounded-btn">Главная</a>
              <a href="/profile" className="btn btn-ghost btn-sm rounded-btn">Профиль</a>
              <a href="/login" className="btn btn-ghost btn-sm rounded-btn">Войти</a>
              <ThemeToggle />
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/"         element={<HomePage />} />
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile"  element={<ProtectedProfile />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <Toaster position="top-center" />
      </BrowserRouter>
    </ThemeProvider>
  );
}