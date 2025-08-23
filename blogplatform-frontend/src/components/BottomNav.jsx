// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, icon, children, onClick }) => {
  const content = (
    <motion.div
      className="flex flex-col items-center gap-0.5 py-2 px-1"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <span className="text-2xl">{icon}</span>
      {children && <span className="text-xs font-medium leading-tight">{children}</span>}
    </motion.div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex-1 flex justify-center text-base-content/70 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
      >
        {content}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex justify-center transition-all duration-200 rounded-xl ` +
        (isActive 
          ? 'text-primary bg-primary/15 shadow-lg' 
          : 'text-base-content/70 hover:text-primary hover:bg-primary/10')
      }
    >
      {content}
    </NavLink>
  );
};

export default function BottomNav({ onOpenCreatePost }) {
  return (
    <>
      {/* Основная панель навигации */}
      <motion.nav 
        className="lg:hidden fixed bottom-4 left-4 right-4 bg-base-100/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-300/50 h-18 flex items-center px-2 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Основные кнопки навигации */}
        <div className="flex items-center justify-around flex-1">
          <NavItem to="/" icon="🏠">
            Главная
          </NavItem>
          
          <NavItem 
            icon="➕" 
            onClick={onOpenCreatePost}
          >
            Создать
          </NavItem>

          <NavItem to="/profile" icon="👤">
            Профиль
          </NavItem>
        </div>
        {/* ThemeToggle удален из основной панели */}
      </motion.nav>
      
      {/* Отдельная миниатюрная круглая кнопка смены темы */}
      <motion.div
        className="lg:hidden fixed bottom-24 right-4 z-30" // Позиционирование выше и правее панели, z-30 меньше чем у модалок (z-50) и панели (z-40)
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-center p-2 bg-base-100/95 backdrop-blur-xl rounded-full shadow-2xl border border-base-300/50">
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {/* Используем ThemeToggle с mobile=true и уменьшенным размером */}
            <ThemeToggle mobile={true} />
          </motion.div>
        </div>
      </motion.div>

      {/* Отступ для основного контента под fixed nav */}
      <div className="lg:hidden h-24" />
    </>
  );
}