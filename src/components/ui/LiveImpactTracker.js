// Live Impact Tracker - Real-time visualization of lives being changed
// The heart of TuiTrade's mission: showing immediate social impact

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Briefcase, 
  Home, 
  Star,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Award,
  Target,
  Globe,
  Sparkles,
  Activity,
  PieChart,
  BarChart3,
  Trophy,
  Crown,
  Gift
} from 'lucide-react';
import achievementSystem, { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../lib/achievementSystem';

const LiveImpactTracker = ({ 
  className = "",
  showDetailedMetrics = true,
  size = "full",
  updateInterval = 30000 // 30 seconds
}) => {
  const [impactData, setImpactData] = useState({
    livesChanged: 0,
    jobsCreated: 0,
    transactionsCompleted: 0,
    communitiesHelped: 0,
    totalEconomicImpact: 0,
    childrenHelped: 0,
    familiesSupported: 0,
    realTimeEvents: []
  });

  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [animationQueue, setAnimationQueue] = useState([]);
  const intervalRef = useRef(null);

  // Simulated real-time data (in production, this would connect to Firebase)
  useEffect(() => {
    const generateRealtimeData = () => {
      const currentTime = new Date();
      
      // Base growth rates (per hour)
      const hourlyGrowth = {
        livesChanged: Math.floor(Math.random() * 5) + 1,
        jobsCreated: Math.floor(Math.random() * 3) + 1,
        transactionsCompleted: Math.floor(Math.random() * 15) + 5,
        communitiesHelped: Math.floor(Math.random() * 2),
        economicImpact: Math.floor(Math.random() * 5000) + 2000
      };

      // Calculate proportional growth for interval
      const intervalMinutes = updateInterval / 60000;
      const growthMultiplier = intervalMinutes / 60;

      setImpactData(prev => {
        const newData = {
          livesChanged: prev.livesChanged + Math.ceil(hourlyGrowth.livesChanged * growthMultiplier),
          jobsCreated: prev.jobsCreated + Math.ceil(hourlyGrowth.jobsCreated * growthMultiplier),
          transactionsCompleted: prev.transactionsCompleted + Math.ceil(hourlyGrowth.transactionsCompleted * growthMultiplier),
          communitiesHelped: prev.communitiesHelped + Math.ceil(hourlyGrowth.communitiesHelped * growthMultiplier),
          totalEconomicImpact: prev.totalEconomicImpact + Math.ceil(hourlyGrowth.economicImpact * growthMultiplier),
          childrenHelped: Math.floor((prev.livesChanged + Math.ceil(hourlyGrowth.livesChanged * growthMultiplier)) * 0.3),
          familiesSupported: Math.floor((prev.livesChanged + Math.ceil(hourlyGrowth.livesChanged * growthMultiplier)) * 0.15)
        };

        // Generate recent events
        const newEvents = generateRecentEvents(newData, prev);
        setRealtimeEvents(currentEvents => [...newEvents, ...currentEvents].slice(0, 10));

        return newData;
      });
    };

    // Initialize with baseline data
    setImpactData({
      livesChanged: 1247,
      jobsCreated: 429,
      transactionsCompleted: 8942,
      communitiesHelped: 89,
      totalEconomicImpact: 2847000,
      childrenHelped: 374,
      familiesSupported: 187,
      realTimeEvents: []
    });

    // Set up regular updates
    intervalRef.current = setInterval(generateRealtimeData, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  const generateRecentEvents = (newData, oldData) => {
    const events = [];
    const eventTypes = [
      {
        type: 'job_placement',
        condition: newData.jobsCreated > oldData.jobsCreated,
        icon: Briefcase,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        messages: [
          'Single parent found stable employment in Auckland',
          'Recent graduate secured their first role in Wellington',
          'Career change success story in Christchurch',
          'Community member started new job in Hamilton'
        ]
      },
      {
        type: 'transaction_impact',
        condition: newData.transactionsCompleted > oldData.transactionsCompleted,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        messages: [
          'Local business supported through marketplace sale',
          'Family funded school supplies through listing sale',
          'Elderly person sold furniture to help grandchildren',
          'Young entrepreneur\'s first sale milestone reached'
        ]
      },
      {
        type: 'community_help',
        condition: newData.communitiesHelped > oldData.communitiesHelped,
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        messages: [
          'New neighbourhood connected to support network',
          'Community group formed through TuiTrade connections',
          'Local initiative funded through platform activity',
          'Vulnerable family connected to assistance'
        ]
      },
      {
        type: 'life_changed',
        condition: newData.livesChanged > oldData.livesChanged,
        icon: Star,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        messages: [
          'Child\'s education funded through platform impact',
          'Family housing situation improved',
          'Mental health support accessed through connections',
          'Life-changing opportunity created through TuiTrade'
        ]
      }
    ];

    eventTypes.forEach(eventType => {
      if (eventType.condition && Math.random() > 0.3) {
        events.push({
          id: Date.now() + Math.random(),
          type: eventType.type,
          message: eventType.messages[Math.floor(Math.random() * eventType.messages.length)],
          icon: eventType.icon,
          color: eventType.color,
          bgColor: eventType.bgColor,
          timestamp: new Date(),
          location: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'][Math.floor(Math.random() * 6)]
        });
      }
    });

    return events;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `$${formatNumber(amount)}`;
  };

  const impactMetrics = [
    {
      label: 'Lives Changed',
      maoriLabel: 'Oranga Huringa',
      value: impactData.livesChanged,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Direct positive impact on individuals'
    },
    {
      label: 'Jobs Created',
      maoriLabel: 'Mahi Hanga',
      value: impactData.jobsCreated,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Employment opportunities provided'
    },
    {
      label: 'Transactions',
      maoriLabel: 'Tauhokohoko',
      value: impactData.transactionsCompleted,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Economic activities facilitated'
    },
    {
      label: 'Communities',
      maoriLabel: 'Hapori',
      value: impactData.communitiesHelped,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Local communities strengthened'
    }
  ];

  const getContainerStyle = () => {
    switch (size) {
      case 'compact': return 'p-4';
      case 'medium': return 'p-6';
      case 'full': return 'p-8';
      default: return 'p-6';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl border-2 border-gray-100 ${getContainerStyle()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">Live Impact Tracker</h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}
            />
          </div>
          <p className="text-gray-600">Real-time measurement of lives being changed • Aroha ki te taiao</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Economic Impact</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(impactData.totalEconomicImpact)}
          </div>
        </div>
      </div>

      {/* Main Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {impactMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bgColor} ${metric.borderColor} border-2 rounded-xl p-4 text-center relative overflow-hidden`}
          >
            {/* Background animation */}
            <motion.div
              animate={{ 
                background: `linear-gradient(45deg, transparent, ${metric.bgColor}40, transparent)`
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0"
            />
            
            <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-3`} />
            
            <motion.div
              key={metric.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-gray-900 mb-1"
            >
              {formatNumber(metric.value)}
            </motion.div>
            
            <div className="text-sm font-medium text-gray-700 mb-1">{metric.label}</div>
            <div className="text-xs text-gray-500 italic">{metric.maoriLabel}</div>
            
            {size === 'full' && (
              <div className="text-xs text-gray-400 mt-2">{metric.description}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Impact Details */}
      {showDetailedMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Children & Families Helped */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Direct Child Impact</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Children Helped</span>
                <span className="text-2xl font-bold text-yellow-600">{impactData.childrenHelped}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Families Supported</span>
                <span className="text-2xl font-bold text-orange-600">{impactData.familiesSupported}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Every transaction</strong> on TuiTrade contributes to education, housing, and support for impoverished children across Aotearoa New Zealand.
              </p>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {realtimeEvents.slice(0, 8).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`${event.bgColor} border border-gray-200 rounded-lg p-3`}
                  >
                    <div className="flex items-start space-x-3">
                      <event.icon className={`w-5 h-5 ${event.color} mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">{event.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{event.location}</span>
                          <Clock className="w-3 h-3 text-gray-400 ml-2" />
                          <span className="text-xs text-gray-500">
                            {event.timestamp.toLocaleTimeString('en-NZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Impact Goal Progress */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Monthly Impact Goal</h3>
            <p className="text-green-100">Target: Change 2,000 lives this month</p>
          </div>
          <Target className="w-10 h-10 text-white opacity-80" />
        </div>
        
        <div className="bg-white/20 rounded-full h-4 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(impactData.livesChanged / 2000) * 100}%` }}
            className="bg-white rounded-full h-4 relative overflow-hidden"
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <motion.div
              animate={{ x: [-100, 400] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/90">
            {((impactData.livesChanged / 2000) * 100).toFixed(1)}% Complete
          </span>
          <span className="text-white font-bold">
            {2000 - impactData.livesChanged} lives to go
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Updated every {updateInterval / 1000} seconds</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Powered by TuiTrade Magic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveImpactTracker;