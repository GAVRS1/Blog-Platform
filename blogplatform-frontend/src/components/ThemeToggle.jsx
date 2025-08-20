import { useTheme } from '@/context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ mobile = false }) {
  const { dark, toggle } = useTheme();
  
  return (
    <motion.button
      title="Сменить тему"
      className={`btn btn-circle ${mobile ? 'btn-sm' : 'btn-md'} btn-ghost relative overflow-hidden`}
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={dark ? 'sun' : 'moon'}
          className={`${mobile ? 'text-lg' : 'text-xl'} absolute`}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {dark ? '☀️' : '🌙'}
        </motion.span>
      </AnimatePresence>
      
      {/* Фоновая анимация */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
