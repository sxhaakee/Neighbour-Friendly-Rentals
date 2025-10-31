import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  gradient?: 'default' | 'gold' | 'white';
}

export const PremiumCard = ({ 
  children, 
  className = '',
  hoverable = true,
  onClick,
  gradient = 'default'
}: PremiumCardProps) => {
  
  const gradients = {
    default: 'bg-gradient-to-br from-white to-amber-50',
    gold: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    white: 'bg-white'
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -5, scale: 1.02 } : {}}
      onClick={onClick}
      className={`
        ${gradients[gradient]}
        rounded-2xl p-6 
        shadow-lg border border-yellow-100 
        hover:shadow-xl hover:border-yellow-200
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
