import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const FAB = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/add-item');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 z-40"
      title="Add new rental item"
    >
      <Plus className="w-6 h-6 text-white" />
    </motion.button>
  );
};

export default FAB;
