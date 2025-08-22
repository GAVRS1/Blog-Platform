// src/App.jsx
import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import AddPostFAB from '@/components/AddPostFAB';
import withAuth from '@/hocs/withAuth';
import CreatePostModal from '@/components/CreatePostModal';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const MyItemsPage = lazy(() => import('@/pages/MyItemsPage'));

const ProtectedProfile = withAuth(ProfilePage);

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

const MainLayoutWithModal = ({ children, onOpenCreatePostModal, showCreatePostModal, setShowCreatePostModal }) => {
  const queryClient = new QueryClient();
  
  const handlePostCreated = () => {
    setShowCreatePostModal(false);
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8 max-w-7xl mx-auto">
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <Sidebar onOpenCreatePostModal={onOpenCreatePostModal} />
          </div>
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>
          <div className="w-64 flex-shrink-0 hidden xl:block">
            <div className="sticky top-6 bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6">
              <h3 className="font-bold text-lg mb-4">Рекомендации</h3>
              <p className="text-base-content/60 text-sm">
                Здесь будут отображаться рекомендуемые пользователи и тренды
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
      <AddPostFAB />
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default function App() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  const handleOpenCreatePostModal = () => {
    setShowCreatePostModal(true);
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <MainLayoutWithModal
                    showCreatePostModal={showCreatePostModal}
                    setShowCreatePostModal={setShowCreatePostModal}
                    onOpenCreatePostModal={handleOpenCreatePostModal}
                  >
                    <HomePage />
                  </MainLayoutWithModal>
                }
              />
              <Route
                path="/profile"
                element={
                  <MainLayoutWithModal
                    showCreatePostModal={showCreatePostModal}
                    setShowCreatePostModal={setShowCreatePostModal}
                    onOpenCreatePostModal={handleOpenCreatePostModal}
                  >
                    <ProtectedProfile />
                  </MainLayoutWithModal>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <MainLayoutWithModal
                    showCreatePostModal={showCreatePostModal}
                    setShowCreatePostModal={setShowCreatePostModal}
                    onOpenCreatePostModal={handleOpenCreatePostModal}
                  >
                    <UserProfilePage />
                  </MainLayoutWithModal>
                }
              />
              <Route path="/my-posts" element={
                <MainLayoutWithModal
                  showCreatePostModal={showCreatePostModal}
                  setShowCreatePostModal={setShowCreatePostModal}
                  onOpenCreatePostModal={handleOpenCreatePostModal}
                >
                  <MyItemsPage
                    title="Мои посты"
                    endpoint="posts/user/me"
                  />
                </MainLayoutWithModal>
              } />
              <Route path="/my-likes" element={
                <MainLayoutWithModal
                  showCreatePostModal={showCreatePostModal}
                  setShowCreatePostModal={setShowCreatePostModal}
                  onOpenCreatePostModal={handleOpenCreatePostModal}
                >
                  <MyItemsPage
                    title="Мои лайки"
                    endpoint="likes/me"
                  />
                </MainLayoutWithModal>
              } />
              <Route path="/my-comments" element={
                <MainLayoutWithModal
                  showCreatePostModal={showCreatePostModal}
                  setShowCreatePostModal={setShowCreatePostModal}
                  onOpenCreatePostModal={handleOpenCreatePostModal}
                >
                  <MyItemsPage
                    title="Мои комментарии"
                    endpoint="comments/me"
                  />
                </MainLayoutWithModal>
              } />
              <Route
                path="/post/:id"
                element={
                  <MainLayoutWithModal
                    showCreatePostModal={showCreatePostModal}
                    setShowCreatePostModal={setShowCreatePostModal}
                    onOpenCreatePostModal={handleOpenCreatePostModal}
                  >
                    <PostDetailPage />
                  </MainLayoutWithModal>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--fallback-b1,oklch(var(--b1)))',
                color: 'var(--fallback-bc,oklch(var(--bc)))',
                border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}