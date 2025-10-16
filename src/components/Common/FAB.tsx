import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAB = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { icon: Package, label: 'List Product', path: '/add-item', color: 'bg-blue-500' },
    { icon: Home, label: 'List Property', path: '/add-property', color: 'bg-purple-500' },
    { icon: Plus, label: 'List Service', path: '/add-service', color: 'bg-orange-500' },
  ];

  return (
    <>
      {/* Menu Items */}
      <AnimatePresence>
        {showMenu && (
          <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  navigate(item.path);
                  setShowMenu(false);
                }}
                className={`${item.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowMenu(!showMenu)}
        className={`fixed bottom-6 right-6 ${showMenu ? 'bg-red-500' : 'bg-primary'} text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50`}
        title={showMenu ? 'Close menu' : 'Add listing'}
      >
        <motion.div
          animate={{ rotate: showMenu ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {showMenu ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>
    </>
  );
};

export default FAB;
