import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, icon, children }) => (
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
  return (
    <>
      <motion.nav 
        className="lg:hidden fixed bottom-4 left-4 right-4 bg-base-100/90 backdrop-blur-md rounded-2xl shadow-2xl border border-base-300/50 h-20 flex items-center px-2 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <NavItem to="/" icon="🏠">Главная</NavItem>
        <ThemeToggleNavItem />
        <NavItem to="/profile" icon="👤">Профиль</NavItem>
      </motion.nav>
      <div className="lg:hidden h-28" />
    </>
  );
}
