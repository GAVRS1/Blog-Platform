import { useTheme } from '@/context/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <motion.button
      title="Сменить тему"
      className="btn btn-circle btn-md btn-ghost"
      onClick={toggle}
      whileHover={{ rotate: 180 }}
      transition={{ duration: 0.2 }}
    >
      {dark ? '☀️' : '🌙'}
    </motion.button>
  );
}