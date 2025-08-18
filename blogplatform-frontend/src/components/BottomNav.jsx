// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavItem = ({ to, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-1 flex justify-center items-center py-2 transition-colors rounded-lg ` +
      (isActive ? 'text-primary bg-primary/10' : 'text-base-content/60')
    }
  >
    <span className="text-2xl">{icon}</span>
  </NavLink>
);

export default function BottomNav() {
  return (
    <>
      {/* сама панель-окно */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-base-100 rounded-2xl shadow-2xl border border-base-300 h-16 flex items-center px-2 z-40">
        <NavItem to="/"        icon="🏠" />
        <NavItem to="/profile" icon="👤" />
      </nav>

      {/* фоновый отступ, чтобы контент не залезал под панель */}
      <div className="lg:hidden h-24" />
    </>
  );
}