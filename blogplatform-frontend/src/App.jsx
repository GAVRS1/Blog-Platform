// src/App.jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import withAuth from '@/hocs/withAuth';
import CreatePostModal from '@/components/CreatePostModal';
import RealtimeMount from '@/components/RealtimeMount';
import CookieConsentModal from '@/components/CookieConsentModal';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { isPublicNavPath } from '@/config/navigation';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();
  const showNav = !isPublicNavPath(location.pathname);

  return (
    <>
      <RealtimeMount />
      <div className="min-h-screen bg-base-200">
        <Toaster position="top-center" />
        {showNav && <TopBar />}
        {showNav && (
          <div className="md:hidden fixed top-0 inset-x-0 z-50 border-b border-base-300 bg-base-200 text-base-content shadow-sm">
            <div className="relative flex items-center justify-between px-3 py-2 overflow-hidden">
              <button
                type="button"
                className={`btn btn-ghost btn-circle ${mobileSearchOpen ? 'opacity-0 pointer-events-none' : ''}`}
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Открыть меню">
                <i className="fas fa-bars"></i>
              </button>
              <div className={`font-semibold transition-opacity ${mobileSearchOpen ? 'opacity-0' : 'opacity-100'}`}>
                BlogPlatform by.Gavrs
              </div>
              <button
                type="button"
                className={`btn btn-ghost btn-circle ${mobileSearchOpen ? 'opacity-0 pointer-events-none' : ''}`}
                onClick={() => setMobileSearchOpen(prev => !prev)}
                aria-expanded={mobileSearchOpen}
                aria-label="Поиск">
                <i className="fas fa-magnifying-glass"></i>
              </button>
              <AnimatePresence>
                {mobileSearchOpen && (
                  <motion.div
                    className="absolute inset-y-0 left-0 right-0 flex items-center px-3"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}>
                    <label className="input input-bordered flex items-center gap-2 w-full">
                      <i className="fas fa-search opacity-60"></i>
                      <input type="text" className="grow" placeholder="Поиск авторов" autoFocus />
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-circle ml-2"
                      onClick={() => setMobileSearchOpen(false)}
                      aria-label="Закрыть поиск">
                      <i className="fas fa-xmark"></i>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-2 pt-14 md:pt-0 md:px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[280px,minmax(0,1fr)] lg:grid-cols-[280px,minmax(0,1fr),280px] gap-4 pt-4">
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
            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>

        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-base-200 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-end px-4 py-3 border-b border-base-300">
                <button
                  type="button"
                  className="btn btn-ghost btn-circle"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Закрыть меню">
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="px-4 py-4">
                <Sidebar
                  placements={['mobile']}
                  onNavigate={() => setMobileSidebarOpen(false)}
                  containerClassName="static"
                />
              </div>
            </div>
          </div>
        )}

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
