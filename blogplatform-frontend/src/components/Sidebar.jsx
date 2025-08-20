import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `btn btn-ghost justify-start w-full text-left ` +
      (isActive ? 'btn-active' : '')
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="hidden lg:block sticky top-20 h-fit max-h-[calc(100vh-5rem)] w-64 flex-shrink-0">
      <div className="flex flex-col gap-3 p-2">
        <ThemeToggle />
        <NavItem to="/">🏠 Главная</NavItem>
        <NavItem to="/profile">👤 Профиль</NavItem>
        <NavItem to="/create-post" className="btn btn-primary">
          ✍️ Новый пост
        </NavItem>
      </div>
    </aside>
  );
}