// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NavItem = ({ to, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-1 flex justify-center items-center py-2 transition-colors ` +
      (isActive ? 'text-primary' : 'text-base-content/60')
    }
  >
    <span className="text-2xl">{icon}</span>
  </NavLink>
);

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 h-16 flex">
      <NavItem to="/"        icon="🏠" />
      <NavItem to="/profile" icon="👤" />
    </nav>
  );
}