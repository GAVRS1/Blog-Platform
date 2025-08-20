import { useTheme } from '@/context/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle({ mobile }) {
  const { dark, toggle } = useTheme();
  return (
    <motion.button
      className={`btn btn-ghost ${mobile ? 'btn-circle text-2xl' : 'w-full'}`}
      onClick={toggle}
      whileTap={{ rotate: 180 }}
    >
      {dark ? '☀️' : '🌙'}
    </motion.button>
  );
}