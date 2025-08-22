// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';

// Компонент NavItem оставлен без изменений
const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `btn btn-md justify-start w-full text-left text-base font-medium transition-all duration-200 ` +
      (isActive
        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
        : 'btn-ghost hover:bg-primary/10 hover:scale-[1.02]')
    }
  >
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {children}
    </motion.div>
  </NavLink>
);

// Изменен экспорт по умолчанию и добавлен пропс onOpenCreatePostModal
export default function Sidebar({ onOpenCreatePostModal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.profile?.profilePictureUrl
    ? getAvatarUrl(user.profile.profilePictureUrl)
    : '/avatar.png';

  if (user === undefined) return null;

  return (
    <motion.aside
      className="hidden lg:flex lg:flex-col lg:w-80 bg-base-100 border-r border-base-200/50 h-screen sticky top-0"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full">
        {/* Заголовок */}
        <motion.div 
          className="p-6 border-b border-base-200/50"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SocialNet
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Социальная сеть нового поколения
          </p>
        </motion.div>

        {/* Профиль пользователя */}
        {user && (
          <motion.div 
            className="p-6 border-b border-base-200/50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/profile" className="flex items-center gap-3 group">
              <motion.img
                src={avatarError ? '/default-avatar.png' : profileAvatarUrl}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors"
                onError={() => setAvatarError(true)}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base-content group-hover:text-primary transition-colors">
                  {user.fullName}
                </p>
                <p className="text-sm text-base-content/60 truncate">
                  @{user.username}
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Навигация */}
        <nav className="flex-1 p-6 space-y-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <NavItem to="/" icon="🏠">Главная лента</NavItem>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onOpenCreatePostModal}
              className="w-full group flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-300 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl"
            >
              <motion.div
                className="flex items-center gap-4 w-full"
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ➕
                </motion.span>
                <span className="font-medium">Создать пост</span>
                <motion.span
                  className="ml-auto text-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </motion.div>
            </button>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <NavItem to="/profile" icon="👤">Мой профиль</NavItem>
          </motion.div>
        </nav>

        {/* Нижняя часть */}
        <div className="p-6 border-t border-base-200/50 space-y-3">
          {/* Переключатель темы */}
          <motion.div 
            className="flex items-center gap-4 px-4 py-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-xl">🌙</span>
            <span className="font-medium text-base-content/70 flex-1">Тема</span>
            <ThemeToggle />
          </motion.div>

          {/* Выход */}
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium text-error hover:bg-error/10 transition-all duration-300"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🚪</span>
            <span>Выйти</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}