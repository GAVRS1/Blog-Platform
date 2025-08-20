import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-1 flex justify-center items-center py-2 rounded-lg ` +
      (isActive ? 'text-primary bg-primary/10' : 'text-base-content/60')
    }
  >
    <motion.span
      className="text-2xl"
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {icon}
    </motion.span>
  </NavLink>
);

export default function BottomNav() {
  return (
    <>
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-base-100 rounded-2xl shadow-2xl border border-base-300 h-16 flex items-center px-2 z-40">
        <NavItem to="/" icon="🏠" />
        <ThemeToggle mobile />
        <NavItem to="/profile" icon="👤" />
      </nav>
      <div className="lg:hidden h-24" />
    </>
  );
}