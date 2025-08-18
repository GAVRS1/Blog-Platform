// src/components/AddPostFAB.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AddPostFAB() {
  const navigate = useNavigate();
  return (
    <motion.button
      className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-2xl shadow-xl z-50"
      onClick={() => navigate('/create-post')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      ➕
    </motion.button>
  );
}