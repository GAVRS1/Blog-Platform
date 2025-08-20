import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import { useNavigate } from 'react-router-dom';

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

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.profile?.profilePictureUrl
    ? getAvatarUrl(user.profile.profilePictureUrl)
    : '/avatar.png';

  if (user === undefined) return null;

  return (
    <aside className="hidden lg:block sticky top-6 h-fit max-h-[calc(100vh-3rem)] w-64 flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      <motion.div 
        className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Профиль пользователя */}
        <motion.div 
          className="flex flex-col items-center mb-8 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.img
            src={avatarUrl}
            alt={user?.username || 'User'}
            className="w-20 h-20 rounded-full border-4 border-primary/20 shadow-lg cursor-pointer"
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.1, borderColor: 'var(--primary)' }}
            whileTap={{ scale: 0.95 }}
          />
          <h3 className="font-bold text-lg mt-3 text-base-content">
            {user?.profile?.fullName || 'Пользователь'}
          </h3>
          <p className="text-sm text-base-content/60">
            @{user?.username || 'username'}
          </p>
        </motion.div>

        {/* Навигация */}
        <nav className="space-y-3 mb-6">
          <NavItem to="/">🏠 Главная</NavItem>
          <NavItem to="/profile">👤 Профиль</NavItem>
          <NavItem to="/my-posts">📝 Мои посты</NavItem>
          <NavItem to="/liked">❤️ Понравившиеся</NavItem>
        </nav>

        {/* Переключатель темы */}
        <div className="flex justify-center pt-4 border-t border-base-300/50">
          <ThemeToggle />
        </div>
      </motion.div>
    </aside>
  );
}
