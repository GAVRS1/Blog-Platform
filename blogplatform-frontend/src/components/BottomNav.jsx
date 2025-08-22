// src/components/BottomNav.jsx - УЛУЧШЕННАЯ ВЕРСИЯ
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, icon, children, isSpecial = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col justify-center items-center py-2 px-1 rounded-2xl transition-all duration-300 relative ${
        isSpecial 
          ? 'flex-shrink-0 w-14 h-14'
          : 'flex-1'
      } ${
        isActive 
          ? 'text-primary' 
          : 'text-base-content/60 hover:text-primary/80'
      }`
    }
  >
    {({ isActive }) => (
      <motion.div
        className={`flex flex-col items-center gap-1 relative ${
          isSpecial ? 'justify-center h-full' : ''
        }`}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <span className={`${isSpecial ? 'text-3xl' : 'text-2xl'}`}>
          {icon}
        </span>
        {children && !isSpecial && (
          <span className="text-xs font-medium">{children}</span>
        )}
        {isActive && !isSpecial && (
          <motion.div
            className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            layoutId="activeIndicator"
          />
        )}
      </motion.div>
    )}
  </NavLink>
);

const CreatePostButton = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      onClick={() => navigate('/create-post')}
      className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg relative overflow-hidden"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <motion.span
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        ➕
      </motion.span>
      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};

const ThemeToggleNavItem = () => (
  <motion.div
    className="flex justify-center items-center py-2 px-1"
    whileTap={{ scale: 0.85 }}
    whileHover={{ scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 400 }}
  >
    <ThemeToggle mobile />
  </motion.div>
);

export default function BottomNav() {
  return (
    <>
      <motion.nav 
        className="lg:hidden fixed bottom-4 left-4 right-4 bg-base-100/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-300/50 h-20 flex items-center px-4 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      >
        {/* Главная */}
        <NavItem to="/" icon="🏠">
          Главная
        </NavItem>

        {/* Смена темы */}
        <ThemeToggleNavItem />

        {/* Создать пост */}
        <div className="flex-shrink-0 mx-2">
          <CreatePostButton />
        </div>

        {/* Профиль */}
        <NavItem to="/profile" icon="👤">
          Профиль
        </NavItem>
      </motion.nav>
      
      {/* Отступ для навигации */}
      <div className="lg:hidden h-28" />
    </>
  );
}
