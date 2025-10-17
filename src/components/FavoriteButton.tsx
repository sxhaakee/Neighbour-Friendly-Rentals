import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { favoritesService } from '../services/favoritesService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

interface FavoriteButtonProps {
  itemType: 'item' | 'property' | 'service';
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton = ({ itemType, itemId, size = 'md' }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, itemId]);

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoritesService.isFavorite(itemType, itemId);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast.error('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      const newStatus = await favoritesService.toggleFavorite(itemType, itemId);
      setIsFavorite(newStatus);
      showToast.success(newStatus ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={loading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        isFavorite
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
      } backdrop-blur-sm disabled:opacity-50`}
    >
      <Heart
        className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''}`}
      />
    </motion.button>
  );
};
