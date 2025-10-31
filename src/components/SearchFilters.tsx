import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, IndianRupee, MapPin, Calendar } from 'lucide-react';

interface SearchFiltersProps {
  onApplyFilters: (filters: FilterValues) => void;
  onReset: () => void;
}

export interface FilterValues {
  priceMin?: number;
  priceMax?: number;
  category?: string;
  distance?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular';
}

export const SearchFilters = ({ onApplyFilters, onReset }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    sortBy: 'newest'
  });

  const categories = [
    'Electronics',
    'Cameras & Photography',
    'Tools & Equipment',
    'Sports & Fitness',
    'Musical Instruments',
    'Furniture',
    'Books & Media',
    'Clothing & Accessories',
    'Party & Events',
    'Gaming & Consoles',
    'Outdoor & Camping',
    'Baby & Kids',
  ];

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({ sortBy: 'newest' });
    onReset();
    setIsOpen(false);
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'sortBy' && filters[key as keyof FilterValues] !== undefined
  ).length;

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-500 transition-colors"
      >
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="font-semibold text-gray-700">Filters</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <IndianRupee className="w-4 h-4" />
                    Price Range (per day)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin || ''}
                        onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) || undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax || ''}
                        onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) || undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distance */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4" />
                    Distance (km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.distance || 10}
                    onChange={(e) => setFilters({ ...filters, distance: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>1 km</span>
                    <span className="font-semibold text-amber-600">{filters.distance || 10} km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
