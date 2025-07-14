// Verification System - Trust and credibility verification for users
// Multi-level verification system ensuring safe, trustworthy interactions

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  Star, 
  Award, 
  Crown, 
  Verified,
  IdCard,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Camera,
  Clock,
  AlertTriangle,
  Info,
  ThumbsUp,
  MessageCircle,
  Heart,
  TrendingUp,
  Users,
  Briefcase,
  Home,
  Zap,
  Eye,
  Lock,
  Key,
  Globe
} from 'lucide-react';

const VerificationSystem = ({ 
  userId, 
  userProfile = {}, 
  showAllBadges = true,
  compact = false,
  onVerificationStart = () => {}
}) => {
  const [verificationStatus, setVerificationStatus] = useState({});
  const [userReviews, setUserReviews] = useState([]);
  const [trustScore, setTrustScore] = useState(0);
  const [badges, setBadges] = useState([]);

  // Verification levels and requirements
  const verificationLevels = {
    email: {
      id: 'email',
      name: 'Email Verified',
      maoriName: 'Īmēra Whakamana',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      difficulty: 'easy',
      points: 10,
      description: 'Confirmed email address',
      requirements: ['Valid email address', 'Email confirmation click'],
      timeToComplete: '2 minutes'
    },
    phone: {
      id: 'phone',
      name: 'Phone Verified',
      maoriName: 'Waea Whakamana',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      difficulty: 'easy',
      points: 20,
      description: 'Confirmed NZ phone number',
      requirements: ['Valid NZ phone number', 'SMS verification code'],
      timeToComplete: '5 minutes'
    },
    identity: {
      id: 'identity',
      name: 'Identity Verified',
      maoriName: 'Tuakiri Whakamana',
      icon: IdCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      difficulty: 'medium',
      points: 50,
      description: 'Government ID verified',
      requirements: ['NZ driver license or passport', 'Photo verification', 'Address confirmation'],
      timeToComplete: '15 minutes'
    },
    address: {
      id: 'address',
      name: 'Address Verified',
      maoriName: 'Wāhi Whakamana',
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      difficulty: 'medium',
      points: 30,
      description: 'Residential address confirmed',
      requirements: ['Utility bill or bank statement', 'Address matches ID'],
      timeToComplete: '10 minutes'
    },
    business: {
      id: 'business',
      name: 'Business Verified',
      maoriName: 'Pakihi Whakamana',
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      difficulty: 'hard',
      points: 100,
      description: 'Registered NZ business',
      requirements: ['NZBN registration', 'Business documents', 'Trading history'],
      timeToComplete: '30 minutes'
    },
    financial: {
      id: 'financial',
      name: 'Financial Verified',
      maoriName: 'Pūtea Whakamana',
      icon: CreditCard,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      difficulty: 'medium',
      points: 40,
      description: 'Banking details verified',
      requirements: ['NZ bank account', 'Identity matching', 'Account verification'],
      timeToComplete: '15 minutes'
    }
  };

  // Trust badges earned through community activity
  const trustBadges = {
    trusted_seller: {
      id: 'trusted_seller',
      name: 'Trusted Seller',
      maoriName: 'Kaihoko Pono',
      icon: Shield,
      color: 'text-emerald-600',
      description: '50+ successful sales, 4.8+ rating',
      rarity: 'common'
    },
    super_seller: {
      id: 'super_seller',
      name: 'Super Seller',
      maoriName: 'Kaihoko Tino',
      icon: Crown,
      color: 'text-yellow-600',
      description: '200+ sales, 4.9+ rating, <1% disputes',
      rarity: 'rare'
    },
    community_champion: {
      id: 'community_champion',
      name: 'Community Champion',
      maoriName: 'Toa Hapori',
      icon: Heart,
      color: 'text-red-600',
      description: 'Actively helps community members',
      rarity: 'epic'
    },
    life_changer: {
      id: 'life_changer',
      name: 'Life Changer',
      maoriName: 'Kaiwhakataone Oranga',
      icon: Star,
      color: 'text-purple-600',
      description: 'Documented positive impact on 10+ lives',
      rarity: 'legendary'
    },
    rapid_responder: {
      id: 'rapid_responder',
      name: 'Rapid Responder',
      maoriName: 'Kaitere Tere',
      icon: Zap,
      color: 'text-blue-600',
      description: 'Responds to messages within 30 minutes',
      rarity: 'common'
    },
    mentor: {
      id: 'mentor',
      name: 'Community Mentor',
      maoriName: 'Kaitārape Hapori',
      icon: Users,
      color: 'text-indigo-600',
      description: 'Helps new users succeed on platform',
      rarity: 'rare'
    }
  };

  // Calculate trust score based on verifications and activity
  useEffect(() => {
    const calculateTrustScore = () => {
      let score = 0;
      
      // Verification points
      Object.values(verificationLevels).forEach(level => {
        if (verificationStatus[level.id]) {
          score += level.points;
        }
      });
      
      // Activity bonuses
      if (userProfile.transactionCount > 50) score += 30;
      if (userProfile.averageRating > 4.8) score += 20;
      if (userProfile.responsiveness === 'fast') score += 15;
      if (userProfile.disputeRate < 0.02) score += 25;
      
      // Community contribution bonuses
      if (userProfile.helpfulReviews > 10) score += 10;
      if (userProfile.communityContributions > 5) score += 15;
      
      return Math.min(score, 100); // Cap at 100
    };

    setTrustScore(calculateTrustScore());
  }, [verificationStatus, userProfile]);

  // Load user verification status (simulated)
  useEffect(() => {
    // In real app, this would fetch from Firebase
    const mockVerificationStatus = {
      email: true,
      phone: true,
      identity: userProfile.verified || false,
      address: false,
      business: userProfile.businessVerified || false,
      financial: false
    };
    
    setVerificationStatus(mockVerificationStatus);

    // Mock user reviews
    const mockReviews = [
      {
        id: 1,
        rating: 5,
        comment: "Absolutely life-changing experience! Sarah helped me find the perfect job.",
        reviewer: "Mike T.",
        date: "2024-03-01",
        verified: true,
        helpfulVotes: 12
      },
      {
        id: 2,
        rating: 5,
        comment: "Quick communication, genuine person who really cares about community.",
        reviewer: "Ana K.",
        date: "2024-02-15",
        verified: true,
        helpfulVotes: 8
      }
    ];
    
    setUserReviews(mockReviews);

    // Earned badges based on profile
    const earnedBadges = [];
    if (userProfile.transactionCount > 50) earnedBadges.push('trusted_seller');
    if (userProfile.transactionCount > 200 && userProfile.averageRating > 4.9) earnedBadges.push('super_seller');
    if (userProfile.communityHelp > 10) earnedBadges.push('community_champion');
    if (userProfile.livesChanged > 10) earnedBadges.push('life_changer');
    if (userProfile.responseTime < 30) earnedBadges.push('rapid_responder');
    if (userProfile.newUsersMentored > 5) earnedBadges.push('mentor');
    
    setBadges(earnedBadges);
  }, [userProfile]);

  const getTrustLevel = (score) => {
    if (score >= 90) return { level: 'Exceptional', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (score >= 75) return { level: 'High', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 25) return { level: 'Basic', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'New', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const VerificationBadge = ({ verification, isComplete }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative p-3 rounded-xl border-2 ${
        isComplete 
          ? `${verification.bgColor} ${verification.borderColor} shadow-md` 
          : 'bg-gray-50 border-gray-200'
      } transition-all hover:shadow-lg cursor-pointer`}
      onClick={() => !isComplete && onVerificationStart(verification.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isComplete ? verification.bgColor : 'bg-gray-100'}`}>
          <verification.icon className={`w-5 h-5 ${isComplete ? verification.color : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className={`font-semibold ${isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
              {verification.name}
            </h4>
            {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <p className="text-sm text-gray-600">{verification.maoriName}</p>
          {!compact && (
            <p className="text-xs text-gray-500 mt-1">{verification.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${isComplete ? verification.color : 'text-gray-400'}`}>
            +{verification.points}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>
      
      {!isComplete && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Requirements:</div>
          <ul className="text-xs text-gray-500 space-y-1">
            {verification.requirements.map((req, i) => (
              <li key={i} className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-blue-600">
            <Clock className="w-3 h-3 inline mr-1" />
            {verification.timeToComplete}
          </div>
        </div>
      )}
    </motion.div>
  );

  const TrustBadge = ({ badgeId }) => {
    const badge = trustBadges[badgeId];
    if (!badge) return null;

    const rarityColors = {
      common: 'border-gray-300 bg-gray-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };

    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        className={`relative p-3 rounded-xl border-2 ${rarityColors[badge.rarity]} text-center`}
      >
        <badge.icon className={`w-8 h-8 ${badge.color} mx-auto mb-2`} />
        <h4 className="font-semibold text-gray-900 text-sm">{badge.name}</h4>
        <p className="text-xs text-gray-600 mb-1">{badge.maoriName}</p>
        {!compact && (
          <p className="text-xs text-gray-500 leading-tight">{badge.description}</p>
        )}
        
        {/* Rarity indicator */}
        <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full ${
          badge.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
          badge.rarity === 'epic' ? 'bg-purple-500 text-white' :
          badge.rarity === 'rare' ? 'bg-blue-500 text-white' :
          'bg-gray-500 text-white'
        }`}>
          {badge.rarity.toUpperCase()}
        </div>
      </motion.div>
    );
  };

  const TrustScoreDisplay = () => {
    const trustLevel = getTrustLevel(trustScore);
    
    return (
      <div className={`${trustLevel.bg} rounded-xl p-6 border-2 border-gray-200`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className={`w-8 h-8 ${trustLevel.color}`} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Trust Score</h3>
              <p className="text-sm text-gray-600">Tuakiri Whakapono</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{trustScore}/100</div>
            <div className={`text-sm font-semibold ${trustLevel.color}`}>
              {trustLevel.level} Trust
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trustScore}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-3 rounded-full ${
              trustScore >= 90 ? 'bg-purple-500' :
              trustScore >= 75 ? 'bg-green-500' :
              trustScore >= 50 ? 'bg-blue-500' :
              trustScore >= 25 ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}
          />
        </div>
        
        {!compact && (
          <div className="text-sm text-gray-600">
            Trust score is calculated from verifications, transaction history, 
            community feedback, and positive impact measurements.
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-gray-700">Trust Score: {trustScore}/100</span>
        <div className="flex space-x-1">
          {badges.slice(0, 3).map(badgeId => (
            <div key={badgeId} className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              {React.createElement(trustBadges[badgeId]?.icon || Star, { 
                className: "w-3 h-3 text-green-600" 
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="verification-system space-y-8">
      {/* Trust Score */}
      <TrustScoreDisplay />
      
      {/* Verification Status */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Verified className="w-6 h-6 text-blue-600" />
          <span>Verification Status</span>
          <span className="text-sm font-normal text-gray-500">(Whakatōhea)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(verificationLevels).map(verification => (
            <VerificationBadge
              key={verification.id}
              verification={verification}
              isComplete={verificationStatus[verification.id]}
            />
          ))}
        </div>
      </div>
      
      {/* Trust Badges */}
      {showAllBadges && badges.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <span>Community Badges</span>
            <span className="text-sm font-normal text-gray-500">(Tohu Hapori)</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map(badgeId => (
              <TrustBadge key={badgeId} badgeId={badgeId} />
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Reviews */}
      {userReviews.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span>Community Feedback</span>
            <span className="text-sm font-normal text-gray-500">(Urupare Hapori)</span>
          </h3>
          
          <div className="space-y-4">
            {userReviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{review.reviewer}</span>
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString('en-NZ')}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3 leading-relaxed">{review.comment}</p>
                
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpfulVotes})</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationSystem;