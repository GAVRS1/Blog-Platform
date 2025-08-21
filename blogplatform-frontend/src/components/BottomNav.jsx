// src/components/BottomNav.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import CreatePostModal from '@/components/CreatePostModal';

const NavItem = ({ to, icon, children, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex-1 flex flex-col justify-center items-center py-2 px-1 rounded-xl transition-all duration-200 text-base-content/60 hover:text-primary/80 hover:bg-primary/5"
      >
        <motion.div
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <span className="text-2xl">{icon}</span>
          {children && <span className="text-xs font-medium">{children}</span>}
        </motion.div>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col justify-center items-center py-2 px-1 rounded-xl transition-all duration-200 ` +
        (isActive ? 'text-primary bg-primary/10 shadow-lg' : 'text-base-content/60 hover:text-primary/80 hover:bg-primary/5')
      }
    >
      <motion.div
        className="flex flex-col items-center gap-1"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-2xl">{icon}</span>
        {children && <span className="text-xs font-medium">{children}</span>}
      </motion.div>
    </NavLink>
  );
};

const ThemeToggleNavItem = () => (
  <div className="flex-1 flex justify-center items-center py-2 px-1">
    <motion.div
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <ThemeToggle mobile />
    </motion.div>
  </div>
);

export default function BottomNav() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePostSuccess = () => {
    setShowCreatePost(false);
  };

  return (
    <>
      <motion.nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100/80 backdrop-blur-sm border-t border-base-300/50 px-2 py-2 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavItem to="/" icon="🏠">
            Главная
          </NavItem>

          <NavItem onClick={() => setShowCreatePost(true)} icon="➕">
            Создать
          </NavItem>

          <NavItem to="/profile" icon="👤">
            Профиль
          </NavItem>

          <NavItem to="/search" icon="🔍">
            Поиск
          </NavItem>

          <ThemeToggleNavItem />
        </div>
      </motion.nav>

      {/* Модальное окно создания поста */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onCreated={handleCreatePostSuccess}
        />
      )}
    </>
  );
}