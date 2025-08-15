// src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeProvider';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button className="theme-btn" onClick={toggle}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}