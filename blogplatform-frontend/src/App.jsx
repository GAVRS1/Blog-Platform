// src/App.jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import withAuth from '@/hocs/withAuth';
import CreatePostModal from '@/components/CreatePostModal';
import RealtimeMount from '@/components/RealtimeMount';
import CookieConsentModal from '@/components/CookieConsentModal';
import { useCookieConsent } from '@/hooks/useCookieConsent';

// Pages (lazy)
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterWizard = lazy(() => import('@/pages/RegisterWizard'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const MyItemsPage = lazy(() => import('@/pages/MyItemsPage'));

const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const DialogPage = lazy(() => import('@/pages/DialogPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

const FollowersPage = lazy(() => import('@/pages/FollowersPage'));
const FollowingPage = lazy(() => import('@/pages/FollowingPage'));
const AppealPage = lazy(() => import('@/pages/AppealPage'));
const MyBlocksPage = lazy(() => import('@/pages/MyBlocksPage'));

// Not Found
const NotFound = () => (
  <div className="min-h-[60vh] grid place-items-center text-center">
    <div>
      <h2 className="text-3xl font-bold">Страница не найдена</h2>
      <p className="opacity-60">Попробуйте вернуться на главную</p>
      <a href="/" className="btn btn-primary mt-4">На главную</a>
    </div>
  </div>
);

// Protected wrappers
const ProtectedHome = withAuth(HomePage);
const ProtectedProfile = withAuth(ProfilePage);
const ProtectedUserProfile = withAuth(UserProfilePage);
const ProtectedPostDetail = withAuth(PostDetailPage);
const ProtectedMyItems = withAuth(MyItemsPage);
const ProtectedMessages = withAuth(MessagesPage);
const ProtectedDialog = withAuth(DialogPage);
const ProtectedNotifications = withAuth(NotificationsPage);
const ProtectedSettings = withAuth(SettingsPage);
const ProtectedAdmin = withAuth(AdminDashboard);
const ProtectedFollowers = withAuth(FollowersPage);
const ProtectedFollowing = withAuth(FollowingPage);
const ProtectedBlocks = withAuth(MyBlocksPage);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ConsentWrappedApp />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function ConsentWrappedApp() {
  const { status, accept, decline } = useCookieConsent();
  const [modalOpen, setModalOpen] = useState(status === 'pending');
  const locked = status === 'pending';

  useEffect(() => {
    if (status === 'pending') {
      setModalOpen(true);
    }
  }, [status]);

  const handleAccept = () => {
    accept();
    setModalOpen(false);
  };

  const handleDecline = () => {
    decline();
    setModalOpen(false);
  };

  return (
    <>
      <CookieConsentModal
        open={modalOpen || status === 'pending'}
        status={status}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onRequestClose={() => !locked && setModalOpen(false)}
      />

      {status === 'accepted' ? (
        <AppLayout />
      ) : status === 'declined' ? (
        <ConsentBlocked onReview={() => setModalOpen(true)} />
      ) : (
        <ConsentPending />
      )}
    </>
  );
}

function AppLayout() {
  return (
    <>
      <RealtimeMount />
      <div className="min-h-screen bg-base-200">
        <Toaster position="top-center" />
        <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[280px,minmax(0,1fr),280px] gap-4 pt-4">
            <aside className="hidden md:block">
              <Sidebar />
            </aside>
            <main className="flex justify-center">
              <div className="w-full max-w-3xl">
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    {/* Public */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register/*" element={<RegisterWizard />} />
                    <Route path="/verify" element={<VerifyEmailPage />} />
                    <Route path="/appeal" element={<AppealPage />} />

                    {/* Private */}
                    <Route path="/" element={<ProtectedHome />} />
                    <Route path="/profile" element={<ProtectedProfile />} />
                    <Route path="/users/:id" element={<ProtectedUserProfile />} />
                    <Route path="/users/:id/followers" element={<ProtectedFollowers />} />
                    <Route path="/users/:id/following" element={<ProtectedFollowing />} />
                    <Route path="/posts/:id" element={<ProtectedPostDetail />} />
                    <Route path="/my" element={<ProtectedMyItems />} />

                    <Route path="/messages" element={<ProtectedMessages />} />
                    <Route path="/messages/:id" element={<ProtectedDialog />} />
                    <Route path="/notifications" element={<ProtectedNotifications />} />
                    <Route path="/settings" element={<ProtectedSettings />} />
                    <Route path="/admin" element={<ProtectedAdmin />} />
                    <Route path="/blocks" element={<ProtectedBlocks />} />

                    {/* other */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" />} />
                  </Routes>
                </Suspense>
              </div>
            </main>
            <div className="hidden md:block" aria-hidden="true" />
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <BottomNav />
        </div>

        <CreatePostModal />
      </div>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
}

function ConsentBlocked({ onReview }) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl font-bold">Доступ ограничен без cookies</h1>
        <p className="text-base opacity-80">
          Вы отклонили использование cookies. Мы не можем загрузить ленту, сообщения и другие разделы,
          пока не получим функциональные cookies для авторизации и защиты сессии.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={onReview}>
            Изменить решение
          </button>
          <a className="btn btn-outline w-full sm:w-auto" href="/appeal">
            Связаться с поддержкой
          </a>
        </div>
      </div>
    </div>
  );
}

function ConsentPending() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Требуется выбор по cookies</p>
        <p className="opacity-70">Мы приостанавливаем навигацию, пока вы не примете или не отклоните cookies.</p>
      </div>
    </div>
  );
}
