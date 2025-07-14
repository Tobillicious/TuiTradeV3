// Enhanced Profile Page - Comprehensive user profile with verification and business features
// Advanced seller profiles, ratings, verification badges, and transaction history

import React, { useState, useEffect } from 'react';
import { 
  User, Edit, Camera, Star, Shield, Award, MapPin, Calendar, Mail, Phone,
  Briefcase, Globe, Instagram, Facebook, Twitter, MessageCircle, Heart,
  Package, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle,
  Upload, Save, X, Plus, Trash2, Eye, EyeOff, Settings, Link
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  doc, updateDoc, getDoc, setDoc, collection, query, 
  where, orderBy, getDocs, serverTimestamp, limit, addDoc
} from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';

// Profile types
const PROFILE_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
  VERIFIED_SELLER: 'verified_seller'
};

// Verification status
const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Business categories
const BUSINESS_CATEGORIES = {
  RETAIL: 'Retail & E-commerce',
  AUTOMOTIVE: 'Automotive',
  REAL_ESTATE: 'Real Estate',
  SERVICES: 'Professional Services',
  HOSPITALITY: 'Hospitality & Tourism',
  CONSTRUCTION: 'Construction & Trade',
  TECHNOLOGY: 'Technology & IT',
  CREATIVE: 'Creative & Design',
  OTHER: 'Other'
};

const EnhancedProfilePage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { getText } = useTeReo();
  
  // Profile state
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Basic info
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    
    // Profile settings
    profileType: PROFILE_TYPES.PERSONAL,
    isPublic: true,
    showContactInfo: false,
    showTransactionHistory: false,
    
    // Business info
    businessName: '',
    businessCategory: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessLicense: '',
    
    // Social media
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    
    // Preferences
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    
    // Seller preferences
    sellerSettings: {
      autoRespond: false,
      responseTemplate: '',
      shippingPolicies: '',
      returnPolicy: '',
      paymentMethods: []
    }
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    averageRating: 0,
    totalReviews: 0,
    memberSince: null,
    responseRate: 0,
    responseTime: 0
  });
  
  // Files
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);
  
  // Reviews and ratings
  const [reviews, setReviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setProfile(profileData);
        setFormData(prev => ({ ...prev, ...profileData }));
      }
      
      // Load statistics
      await loadUserStatistics();
      
      // Load reviews
      await loadUserReviews();
      
      // Load listings
      await loadUserListings();
      
      // Load transactions
      await loadUserTransactions();
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStatistics = async () => {
    try {
      // Load sales data
      const salesQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', currentUser.uid)
      );
      const salesSnapshot = await getDocs(salesQuery);
      
      // Load purchase data
      const purchasesQuery = query(
        collection(db, 'orders'),
        where('buyerId', '==', currentUser.uid)
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);
      
      // Load reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('revieweeId', '==', currentUser.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      // Calculate statistics
      const salesData = salesSnapshot.docs.map(doc => doc.data());
      const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
      
      const totalSales = salesData.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageRating = reviewsData.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
        : 0;
      
      setStats({
        totalSales,
        totalPurchases: purchasesSnapshot.size,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviewsData.length,
        memberSince: profile?.createdAt || serverTimestamp(),
        responseRate: 95, // Would calculate from actual response data
        responseTime: 2.5 // Hours - would calculate from message data
      });
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadUserReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('revieweeId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadUserListings = async () => {
    try {
      const q = query(
        collection(db, 'listings'),
        where('sellerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      
      const snapshot = await getDocs(q);
      const listingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(listingsData);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const loadUserTransactions = async () => {
    try {
      const buyerQuery = query(
        collection(db, 'orders'),
        where('buyerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const sellerQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const [buyerSnapshot, sellerSnapshot] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(sellerQuery)
      ]);
      
      const allTransactions = [
        ...buyerSnapshot.docs.map(doc => ({ id: doc.id, type: 'purchase', ...doc.data() })),
        ...sellerSnapshot.docs.map(doc => ({ id: doc.id, type: 'sale', ...doc.data() }))
      ].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      
      setTransactions(allTransactions.slice(0, 10));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Upload profile image if changed
      let profileImageUrl = formData.profileImage;
      if (profileImage) {
        const imageRef = ref(storage, `profiles/${currentUser.uid}/avatar.jpg`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }
      
      // Upload cover image if changed
      let coverImageUrl = formData.coverImage;
      if (coverImage) {
        const coverRef = ref(storage, `profiles/${currentUser.uid}/cover.jpg`);
        await uploadBytes(coverRef, coverImage);
        coverImageUrl = await getDownloadURL(coverRef);
      }
      
      // Update profile
      const updatedProfile = {
        ...formData,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationRequest = async () => {
    try {
      const verificationData = {
        userId: currentUser.uid,
        type: formData.profileType,
        status: VERIFICATION_STATUS.PENDING,
        documents: verificationDocs,
        businessInfo: formData.profileType === PROFILE_TYPES.BUSINESS ? {
          name: formData.businessName,
          category: formData.businessCategory,
          license: formData.businessLicense,
          address: formData.businessAddress
        } : null,
        submittedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'verification_requests'), verificationData);
      
      // Update profile verification status
      await updateDoc(doc(db, 'users', currentUser.uid), {
        verificationStatus: VERIFICATION_STATUS.PENDING
      });
      
      alert('Verification request submitted successfully!');
    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderVerificationBadge = () => {
    const status = profile?.verificationStatus || VERIFICATION_STATUS.UNVERIFIED;
    
    const badgeConfig = {
      [VERIFICATION_STATUS.VERIFIED]: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Verified'
      },
      [VERIFICATION_STATUS.PENDING]: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        text: 'Pending'
      },
      [VERIFICATION_STATUS.UNVERIFIED]: {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        text: 'Unverified'
      }
    };
    
    const config = badgeConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">${stats.totalSales.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases}</div>
          <div className="text-sm text-gray-600">Purchases</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-1">
            {renderStars(stats.averageRating)}
            <span className="text-lg font-bold text-gray-900 ml-2">{stats.averageRating}</span>
          </div>
          <div className="text-sm text-gray-600">{stats.totalReviews} Reviews</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.responseRate}%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transaction.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {transaction.type === 'sale' ? 
                      <DollarSign size={16} className="text-green-600" /> :
                      <Package size={16} className="text-blue-600" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.type === 'sale' ? 'Sold' : 'Purchased'}: {transaction.item?.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">${transaction.total}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );

  const renderListingsTab = () => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
        <button 
          onClick={() => onNavigate('create-listing')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Listing
        </button>
      </div>
      
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {listing.images?.[0] && (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h4 className="font-medium text-gray-900 mb-2">{listing.title}</h4>
              <p className="text-lg font-bold text-green-600 mb-2">${listing.price}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{listing.views || 0} views</span>
                <span className={`px-2 py-1 rounded-full ${
                  listing.status === 'active' ? 'bg-green-100 text-green-800' :
                  listing.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {listing.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
          <button 
            onClick={() => onNavigate('create-listing')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First Listing
          </button>
        </div>
      )}
    </div>
  );

  const renderReviewsTab = () => (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews & Feedback</h3>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{review.reviewerName}</span>
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.transaction && (
                    <p className="text-sm text-gray-500 mt-1">
                      Transaction: {review.transaction.itemTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 relative">
        {profile?.coverImage && (
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full hover:bg-green-700">
                  <Camera size={12} />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.displayName || profile?.firstName + ' ' + profile?.lastName || 'User'}
                </h1>
                {renderVerificationBadge()}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Member since {stats.memberSince?.toDate?.()?.getFullYear() || new Date().getFullYear()}
                </div>
              </div>

              {profile?.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                
                {!isEditing && profile?.verificationStatus !== VERIFICATION_STATUS.VERIFIED && (
                  <button
                    onClick={handleVerificationRequest}
                    className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center"
                  >
                    <Shield size={16} className="mr-2" />
                    Get Verified
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'listings', label: 'Listings', icon: Package },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'listings' && renderListingsTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <p className="text-gray-600">Settings panel would go here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfilePage;