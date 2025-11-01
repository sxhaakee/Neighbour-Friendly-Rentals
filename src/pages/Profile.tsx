import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Crown, 
  Shield, 
  Edit2, 
  Save,
  X,
  Camera,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isPremium, isVerified, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      showToast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                    {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full sm:w-auto">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name and Badges */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.full_name || 'User'}
                </h1>
                {isPremium && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Crown className="w-4 h-4" />
                    Premium
                  </span>
                )}
                {isVerified && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 text-lg">{profile.full_name || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-gray-900 text-lg">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 text-lg">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-gray-900 text-lg">{profile.address || 'Not provided'}</p>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <p className="text-gray-900 text-lg">
                {new Date(profile.created_at).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Status</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Premium Status */}
            <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <Crown className={`w-6 h-6 ${isPremium ? 'text-yellow-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900">Premium Membership</h3>
              </div>
              <p className={`text-sm ${isPremium ? 'text-yellow-700' : 'text-gray-600'}`}>
                {isPremium ? 'Active - Unlimited listings' : 'Not active'}
              </p>
              {!isPremium && (
                <button
                  onClick={() => navigate('/premium')}
                  className="mt-3 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>

            {/* Verification Status */}
            <div className={`p-4 rounded-xl border-2 ${isVerified ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <Shield className={`w-6 h-6 ${isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900">ID Verification</h3>
              </div>
              <p className={`text-sm ${isVerified ? 'text-green-700' : 'text-gray-600'}`}>
                {isVerified ? 'Verified - Full access' : 'Not verified'}
              </p>
              {!isVerified && (
                <button
                  onClick={() => navigate('/verify-id')}
                  className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Verify ID
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
