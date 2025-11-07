import { motion } from 'framer-motion';
import { Crown, Sparkles, Star, Zap } from 'lucide-react';
import { ReactNode } from 'react';

interface PremiumBadgeProps {
  children?: ReactNode;
  variant?: 'premium' | 'featured' | 'verified' | 'new' | 'hot';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'crown' | 'sparkles' | 'star' | 'zap' | 'none';
  animated?: boolean;
  className?: string;
}

export const PremiumBadge = ({ 
  children,
  variant = 'premium',
  size = 'md',
  icon = 'crown',
  animated = true,
  className = ''
}: PremiumBadgeProps) => {
  
  const variants = {
    premium: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white',
    featured: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    verified: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    new: 'bg-gradient-to-r from-amber-500 to-amber-500 text-white',
    hot: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const icons = {
    crown: Crown,
    sparkles: Sparkles,
    star: Star,
    zap: Zap,
    none: null
  };

  const IconComponent = icon !== 'none' ? icons[icon] : null;

  const badge = (
    <div className={`
      ${variants[variant]}
      ${sizes[size]}
      rounded-full font-bold
      shadow-lg
      inline-flex items-center gap-1.5
      ${className}
    `}>
      {IconComponent && <IconComponent className="w-3 h-3" />}
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};
