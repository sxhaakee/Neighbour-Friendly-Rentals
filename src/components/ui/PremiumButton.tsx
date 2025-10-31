import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const PremiumButton = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
}: PremiumButtonProps) => {
  const baseStyles = "font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: `
      bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 
      text-white shadow-lg hover:shadow-xl
      hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700
      disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-500
      disabled:cursor-not-allowed disabled:shadow-none
    `,
    secondary: `
      bg-gradient-to-r from-white to-amber-50
      border-2 border-yellow-400 text-amber-600 
      hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-100
      shadow-md hover:shadow-lg
      disabled:border-gray-300 disabled:text-gray-400
      disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent border-2 border-yellow-400 
      text-amber-600 hover:bg-yellow-50
      disabled:border-gray-300 disabled:text-gray-400
      disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-amber-600 
      hover:bg-yellow-50
      disabled:text-gray-400
      disabled:cursor-not-allowed
    `
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {/* Shine effect on hover */}
      {!disabled && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
