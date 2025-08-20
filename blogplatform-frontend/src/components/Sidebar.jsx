import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `btn btn-sm btn-ghost justify-start w-full text-left ` +
      (isActive ? 'bg-primary/20 text-primary' : '')
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="hidden lg:block sticky top-20 h-fit max-h-[calc(100vh-5rem)] w-52 flex-shrink-0">
      <div className="flex flex-col gap-2 p-2">
        <NavItem to="/">🏠 Главная</NavItem>
        <NavItem to="/profile">👤 Профиль</NavItem>
        <ThemeToggle />
      </div>
    </aside>
  );
}