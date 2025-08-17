import { useTheme } from '@/context/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <motion.button
      className="btn btn-circle btn-ghost"
      onClick={toggle}
      whileTap={{ rotate: 180 }}
    >
      {dark ? '☀️' : '🌙'}
    </motion.button>
  );
}