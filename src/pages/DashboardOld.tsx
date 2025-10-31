import React, { useState } from 'react';
import { Plus, Package, Calendar, MessageSquare, User, Star, MapPin, Edit, Trash2, TrendingUp, DollarSign, Users, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'rentals', label: 'My Rentals', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Statistics data
  const stats = {
    totalEarnings: 45600,
    totalRentals: 23,
    activeListings: 4,
    totalViews: 156,
    rating: 4.8,
    totalReviews: 15
  };

  // Detailed rental history
  const rentalHistory = [
    {
      id: 1,
      item: 'Professional Power Drill Set',
      customer: 'Sarah Chen',
      customerEmail: 'sarah.chen@email.com',
      customerPhone: '+1 (555) 234-5678',
      price: 1245,
      duration: 3,
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      status: 'Completed',
      totalEarned: 3735,
      rating: 5,
      review: 'Excellent drill set! Very powerful and easy to use.',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      item: 'Vintage Road Bicycle',
      customer: 'David Wilson',
      customerEmail: 'david.wilson@email.com',
      customerPhone: '+1 (555) 345-6789',
      price: 1660,
      duration: 2,
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      status: 'Completed',
      totalEarned: 3320,
      rating: 4,
      review: 'Great bike for weekend rides. Well maintained.',
      image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      item: 'Professional Power Drill Set',
      customer: 'Emma Davis',
      customerEmail: 'emma.davis@email.com',
      customerPhone: '+1 (555) 456-7890',
      price: 1245,
      duration: 1,
      startDate: '2024-01-20',
      endDate: '2024-01-21',
      status: 'Active',
      totalEarned: 1245,
      rating: null,
      review: null,
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const myListings = [
    {
      id: 1,
      title: 'Professional Power Drill Set',
      price: 1245,
      status: 'Available',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 24,
      bookings: 3,
      totalEarned: 4980
    },
    {
      id: 2,
      title: 'Vintage Road Bicycle',
      price: 1660,
      status: 'Rented',
      image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 18,
      bookings: 2,
      totalEarned: 3320
    }
  ];

  const myRentals = [
    {
      id: 1,
      title: 'Canon DSLR Camera',
      owner: 'David Wilson',
      price: 3735,
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'Upcoming',
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const messages = [
    {
      id: 1,
      user: 'Sarah Chen',
      lastMessage: 'Hi! Is the drill set still available for this weekend?',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      user: 'David Wilson',
      lastMessage: 'Thanks for renting the camera! Hope you got great shots.',
      time: '1 day ago',
      unread: false
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-primary">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-bold text-primary">{stats.totalRentals}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-primary">{stats.activeListings}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-primary">{stats.totalViews}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Rental Activity</h3>
        <div className="space-y-4">
          {rentalHistory.slice(0, 3).map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <img
                src={rental.image}
                alt={rental.item}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{rental.item}</h4>
                <p className="text-sm text-gray-600">Rented by {rental.customer}</p>
                <p className="text-sm text-gray-500">{rental.startDate} - {rental.endDate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">₹{rental.totalEarned}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  rental.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : rental.status === 'Active'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {rental.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Earnings & Statistics</h2>
      
      {/* Earnings Summary */}
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-3xl font-bold text-primary">₹{stats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
          <div className="text-center p-4 bg-secondary/5 rounded-lg">
            <p className="text-3xl font-bold text-secondary">₹{Math.round(stats.totalEarnings / stats.totalRentals).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Average per Rental</p>
          </div>
          <div className="text-center p-4 bg-accent/5 rounded-lg">
            <p className="text-3xl font-bold text-accent">{stats.totalRentals}</p>
            <p className="text-sm text-gray-600">Total Rentals</p>
          </div>
        </div>
      </div>

      {/* Detailed Rental History */}
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Rental History</h3>
        <div className="space-y-4">
          {rentalHistory.map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={rental.image}
                  alt={rental.item}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{rental.item}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      rental.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : rental.status === 'Active'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer Details</p>
                      <p className="font-semibold text-gray-900">{rental.customer}</p>
                      <p className="text-sm text-gray-600">{rental.customerEmail}</p>
                      <p className="text-sm text-gray-600">{rental.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rental Details</p>
                      <p className="text-sm text-gray-900">Duration: {rental.duration} day(s)</p>
                      <p className="text-sm text-gray-900">Price: ₹{rental.price}/day</p>
                      <p className="text-sm text-gray-900">Total: ₹{rental.totalEarned}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Period:</span>
                      <span className="text-sm font-medium text-gray-900">{rental.startDate} to {rental.endDate}</span>
                    </div>
                    {rental.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{rental.rating}/5</span>
                      </div>
                    )}
                  </div>

                  {rental.review && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{rental.review}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'earnings':
        return renderEarnings();
      case 'listings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
              <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myListings.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="md:flex">
                    <div className="md:w-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <p className="text-2xl font-bold text-primary mb-3">
                        ₹{item.price}<span className="text-sm text-gray-500">/day</span>
                      </p>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>{item.views} views</span>
                        <span>{item.bookings} bookings</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Total Earned:</span>
                        <span className="font-semibold text-primary">₹{item.totalEarned}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'rentals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Rentals</h2>
            
            <div className="space-y-4">
              {myRentals.map(rental => (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={rental.image}
                      alt={rental.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{rental.title}</h3>
                      <p className="text-gray-600">by {rental.owner}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{rental.startDate} - {rental.endDate}</span>
                        <span className="text-xl font-bold text-primary">₹{rental.price}/day</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        rental.status === 'Upcoming' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            
            <div className="space-y-2">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow ${
                    message.unread ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-gray-600">
                        {message.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{message.user}</h3>
                        <span className="text-sm text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{message.lastMessage}</p>
                    </div>
                    {message.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Mike Johnson</h3>
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{stats.rating}</span>
                    <span className="text-gray-500">({stats.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="mike.johnson@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      defaultValue="San Francisco, CA"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your rentals and profile</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-6 sticky top-24">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
