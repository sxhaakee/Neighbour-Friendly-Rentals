import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, User, Search, Menu, X, Info, LogOut, Shield, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../NotificationCenter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin, isPremium } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/listings', label: 'Browse', icon: List },
    { path: '/messages', label: 'Messages', icon: MessageCircle, authRequired: true },
    { path: '/dashboard', label: 'Dashboard', icon: User, authRequired: true },
    { path: '/about', label: 'About', icon: Info }
  ].filter(item => !item.authRequired || user);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/LOGOOO.jpg" 
              alt="NeighbourFriendly Rentals" 
              className="w-12 h-12 object-contain rounded-lg"
            />
            <span className="font-bold text-xl text-gray-900">
              Neighbour<span className="text-primary">Friendly</span> Rentals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* Premium Button - Desktop */}
                {!isPremium && (
                  <Link
                    to="/premium"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Crown className="w-4 h-4" />
                    <span className="font-semibold text-sm">Go Premium</span>
                  </Link>
                )}
                
                {/* Notification Center - Desktop */}
                <div className="relative flex-shrink-0">
                  <NotificationCenter />
                </div>
                
                {/* User Menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm max-w-[120px] truncate">{profile?.full_name?.split(' ')[0] || 'User'}</span>
                    {isPremium && <Crown className="w-4 h-4 flex-shrink-0 text-yellow-300" />}
                    {isAdmin && <Shield className="w-4 h-4 flex-shrink-0" />}
                  </button>
                
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      {!isPremium && (
                        <Link
                          to="/premium"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50 font-semibold"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Upgrade Premium</span>
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-secondary text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-lg transition-colors ${
                    isActive(path)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              {user ? (
                <>
                  {/* Premium Button - Mobile */}
                  {!isPremium && (
                    <Link
                      to="/premium"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 px-3 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold shadow-md"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Upgrade to Premium</span>
                      <Sparkles className="w-4 h-4" />
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-3 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block bg-secondary text-gray-900 px-3 py-3 rounded-lg font-semibold text-center mt-4"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
