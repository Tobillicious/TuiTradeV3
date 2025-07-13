// Profile Manager - Central hub for managing all profile types
// Allows users to switch between Professional, Personal, Marketplace, Community, etc.

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Heart, 
  Shield, 
  ShoppingBag, 
  Home, 
  Search, 
  Building2,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Globe,
  Users,
  Lock,
  ChevronRight,
  Edit,
  Star,
  Award,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import profileSystem, { PROFILE_TYPES, RELATIONSHIP_LEVELS, ACCOUNT_TYPES } from '../../lib/profileSystem';

const ProfileManager = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [userProfiles, setUserProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState('professional');
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('individual');
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // Profile icons mapping
  const profileIcons = {
    professional: Briefcase,
    personal: Heart,
    innerCircle: Shield,
    marketplace: ShoppingBag,
    community: Home,
    jobHunter: Search,
    employer: Building2
  };

  // Load user's profiles
  const loadProfiles = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const profiles = await profileSystem.getUserProfiles(currentUser.uid, currentUser.uid);
      setUserProfiles(profiles);
      
      // Set active profile to first available or professional
      if (profiles.length > 0) {
        const professional = profiles.find(p => p.profileType === 'professional');
        setActiveProfile(professional ? 'professional' : profiles[0].profileType);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      showNotification('Error loading profiles', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showNotification]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Get current active profile data
  const getCurrentProfile = () => {
    return userProfiles.find(p => p.profileType === activeProfile);
  };

  // Handle profile creation
  const handleCreateProfile = async (profileType, profileData) => {
    try {
      const profileId = await profileSystem.createProfile(currentUser.uid, profileType, profileData);
      showNotification(`${PROFILE_TYPES[profileType.toUpperCase()].name} created successfully!`, 'success');
      setShowCreateProfile(false);
      loadProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      showNotification('Error creating profile', 'error');
    }
  };

  // Get available profile types for account
  const getAvailableProfileTypes = () => {
    const accountConfig = ACCOUNT_TYPES[accountType.toUpperCase()];
    const existingTypes = userProfiles.map(p => p.profileType);
    
    return accountConfig.profiles.filter(type => !existingTypes.includes(type));
  };

  // Profile completion percentage
  const getProfileCompletion = (profile) => {
    if (!profile) return 0;
    
    const profileType = PROFILE_TYPES[profile.profileType?.toUpperCase()];
    if (!profileType) return 0;
    
    const totalFields = profileType.fields.length;
    const completedFields = profileType.fields.filter(field => 
      profile[field] && profile[field] !== ''
    ).length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profiles...</p>
        </div>
      </div>
    );
  }

  const currentProfile = getCurrentProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Manager</h1>
              <p className="text-gray-600 mt-1">Manage your different profiles and privacy settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                {Object.entries(ACCOUNT_TYPES).map(([key, type]) => (
                  <option key={key} value={key.toLowerCase()}>{type.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateProfile(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-2" />
                New Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profiles</h3>
              
              <div className="space-y-3">
                {userProfiles.map((profile) => {
                  const Icon = profileIcons[profile.profileType] || User;
                  const completion = getProfileCompletion(profile);
                  const isActive = profile.profileType === activeProfile;
                  
                  return (
                    <motion.button
                      key={profile.id}
                      onClick={() => setActiveProfile(profile.profileType)}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isActive 
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon size={20} className={`mr-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                          <div>
                            <div className="font-medium">
                              {PROFILE_TYPES[profile.profileType?.toUpperCase()]?.name || profile.profileType}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {completion}% complete
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                      </div>
                      
                      {/* Completion bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all ${
                            isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
                
                {/* Create new profile options */}
                {getAvailableProfileTypes().length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-3">Available profiles:</p>
                    {getAvailableProfileTypes().map((type) => {
                      const Icon = profileIcons[type] || User;
                      return (
                        <button
                          key={type}
                          onClick={() => setShowCreateProfile(type)}
                          className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all text-gray-600 hover:text-green-700 mb-2"
                        >
                          <div className="flex items-center">
                            <Icon size={16} className="mr-3" />
                            <span className="text-sm">Create {PROFILE_TYPES[type.toUpperCase()]?.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-2">
            {currentProfile ? (
              <ProfileEditor 
                profile={currentProfile}
                onSave={loadProfiles}
                onNavigate={onNavigate}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <User className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Profile Selected</h3>
                <p className="text-gray-500 mb-6">Select a profile from the sidebar to view and edit it</p>
                <button
                  onClick={() => setShowCreateProfile(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Create Your First Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Profile Modal */}
      {showCreateProfile && (
        <CreateProfileModal
          accountType={accountType}
          onClose={() => setShowCreateProfile(false)}
          onCreate={handleCreateProfile}
          availableTypes={getAvailableProfileTypes()}
        />
      )}
    </div>
  );
};

// Profile Editor Component
const ProfileEditor = ({ profile, onSave, onNavigate }) => {
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  
  const profileType = PROFILE_TYPES[profile.profileType?.toUpperCase()];
  const Icon = {
    professional: Briefcase,
    personal: Heart,
    innerCircle: Shield,
    marketplace: ShoppingBag,
    community: Home,
    jobHunter: Search,
    employer: Building2
  }[profile.profileType] || User;

  const getVisibilityIcon = () => {
    switch (profile.privacy?.visibility) {
      case 'public': return Globe;
      case 'friends': return Users;
      case 'innerCircle': return Shield;
      default: return Lock;
    }
  };

  const VisibilityIcon = getVisibilityIcon();

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Profile Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Icon size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profileType?.name}</h2>
              <p className="text-gray-600">{profileType?.description}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <VisibilityIcon size={14} className="mr-1" />
                <span className="capitalize">{profile.privacy?.visibility || 'public'} visibility</span>
                {profile.privacy?.searchable && (
                  <>
                    <span className="mx-2">•</span>
                    <Globe size={14} className="mr-1" />
                    <span>Searchable</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit size={16} className="mr-2" />
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => onNavigate('profile-public', { profileId: profile.id })}
              className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye size={16} className="mr-2" />
              View Public
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData.displayName || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.displayName || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData.tagline || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="A short description about yourself"
                  />
                ) : (
                  <p className="text-gray-900">{profile.tagline || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                {editing ? (
                  <select
                    value={profileData.privacy?.visibility || 'public'}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, visibility: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(RELATIONSHIP_LEVELS).map(([key, level]) => (
                      <option key={key} value={level.id}>{level.name} - {level.description}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{profile.privacy?.visibility || 'public'}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchable"
                  checked={profileData.privacy?.searchable || false}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    privacy: { ...prev.privacy, searchable: e.target.checked }
                  }))}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="searchable" className="ml-2 text-sm text-gray-700">
                  Allow this profile to appear in search results
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="seoEnabled"
                  checked={profileData.privacy?.seoEnabled || false}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    privacy: { ...prev.privacy, seoEnabled: e.target.checked }
                  }))}
                  disabled={!editing}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="seoEnabled" className="ml-2 text-sm text-gray-700">
                  Enable SEO optimization for search engines
                </label>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 pt-6 border-t flex justify-end space-x-4">
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save logic here
                setEditing(false);
                onSave();
              }}
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Profile Modal
const CreateProfileModal = ({ accountType, onClose, onCreate, availableTypes }) => {
  const [selectedType, setSelectedType] = useState(availableTypes[0] || '');
  const [profileData, setProfileData] = useState({
    displayName: '',
    tagline: '',
    privacy: {
      visibility: 'public',
      searchable: true,
      seoEnabled: false
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Profile</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {PROFILE_TYPES[type.toUpperCase()]?.name}
                  </option>
                ))}
              </select>
              {selectedType && (
                <p className="text-sm text-gray-500 mt-1">
                  {PROFILE_TYPES[selectedType.toUpperCase()]?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="How you want to be known"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (Optional)</label>
              <input
                type="text"
                value={profileData.tagline}
                onChange={(e) => setProfileData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="A short description"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onCreate(selectedType, profileData)}
              disabled={!selectedType || !profileData.displayName}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Profile
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileManager;