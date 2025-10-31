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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-amber-50/30 to-white backdrop-blur-md border-b border-yellow-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/LOGOOO.jpg" 
              alt="NeighbourFriendly Rentals" 
              className="w-12 h-12 object-contain rounded-lg"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 via-amber-700 to-gray-900 bg-clip-text text-transparent">
              Neighbour<span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">Friendly</span> Rentals
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
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* Notification Center - Desktop */}
                <div className="relative flex-shrink-0">
                  <NotificationCenter />
                </div>
                
                {/* Combined User Menu with Profile Button */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-white to-amber-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <span className="font-medium text-sm text-gray-900 whitespace-nowrap">My Profile</span>
                    {isPremium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  </button>
                
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {profile?.full_name?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{profile?.email || user?.email}</p>
                          </div>
                        </div>
                        {isPremium && (
                          <div className="mt-2 flex items-center space-x-1 text-xs bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 px-2 py-1 rounded-full w-fit">
                            <Crown className="w-3 h-3" />
                            <span className="font-semibold">Premium Member</span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">Edit Profile</span>
                        </Link>
                        
                        {!isPremium && (
                          <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link
                              to="/premium"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-colors mx-2 rounded-lg"
                            >
                              <Crown className="w-4 h-4 text-yellow-600" />
                              <div>
                                <p className="font-semibold text-yellow-700 text-sm">Upgrade to Premium</p>
                                <p className="text-xs text-yellow-600">Unlimited listings & more!</p>
                              </div>
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile: Notification + Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="relative">
                <NotificationCenter />
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
