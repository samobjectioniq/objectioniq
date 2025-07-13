'use client';

import { useState } from 'react';
import { User, Settings, LogOut, Crown, Building, Calendar, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    role: profile?.role || '',
    experience_years: profile?.experience_years || 0,
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (!error) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = () => {
    switch (profile?.subscription_tier) {
      case 'enterprise':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" />
            Enterprise
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Free
          </span>
        );
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-blue-600" />
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {profile.full_name || 'User'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {profile.full_name || 'User'}
                </h3>
                <p className="text-sm text-gray-600">{profile.email}</p>
                <div className="mt-1">{getSubscriptionBadge()}</div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Profile Information</h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {profile.company || 'No company specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {profile.role || 'No role specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {profile.experience_years || 0} years experience
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Info */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Subscription</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSubscriptionBadge()}
                <span className="text-sm text-gray-600">
                  {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Upgrade
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4">
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 