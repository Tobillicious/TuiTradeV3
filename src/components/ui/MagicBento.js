// MagicBento - Enhanced job listing display component
// Interactive bento-style grid for beautiful job browsing experience

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Building, 
  Users, 
  Award, 
  Zap,
  Eye,
  Heart,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Crown,
  Globe,
  Calendar,
  BookmarkPlus,
  Share2
} from 'lucide-react';

const MagicBento = ({
  jobs = [],
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "34, 197, 94", // TuiTrade green
  onJobClick,
  onWatchToggle,
  watchedItems = [],
  className = ""
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [stars, setStars] = useState([]);
  const [hoveredJob, setHoveredJob] = useState(null);
  const containerRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    if (enableStars) {
      const newStars = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 3 + 2
      }));
      setStars(newStars);
    }
  }, [enableStars, particleCount]);

  // Handle mouse movement for spotlight
  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleJobClick = (job) => {
    if (clickEffect) {
      setActiveJob(job.id);
      setTimeout(() => setActiveJob(null), 300);
    }
    
    if (onJobClick) {
      onJobClick(job);
    }
  };

  const handleWatchClick = (e, jobId) => {
    e.stopPropagation();
    if (onWatchToggle) {
      onWatchToggle(jobId);
    }
  };

  const isWatched = (jobId) => {
    return watchedItems.includes(jobId);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Competitive';
    if (salary >= 1000000) return `$${(salary / 1000000).toFixed(1)}M`;
    if (salary >= 1000) return `$${(salary / 1000).toFixed(0)}k`;
    return `$${salary.toLocaleString()}`;
  };

  const getJobSize = (index, jobType) => {
    // Create dynamic grid layout
    if (index === 0) return 'col-span-2 row-span-2'; // Hero job
    if (index === 1 || index === 2) return 'col-span-1 row-span-2'; // Tall jobs
    if ((index - 3) % 5 === 0) return 'col-span-2 row-span-1'; // Wide jobs
    return 'col-span-1 row-span-1'; // Standard jobs
  };

  const getJobHeight = (index) => {
    if (index === 0) return 'h-64'; // Hero
    if (index === 1 || index === 2) return 'h-48'; // Tall
    return 'h-32'; // Standard
  };

  const getJobGradient = (job, index) => {
    const gradients = [
      'from-green-500 to-emerald-600',
      'from-blue-500 to-indigo-600', 
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-teal-500 to-cyan-600',
      'from-yellow-500 to-orange-600'
    ];
    
    if (job.featured || job.salary > 100000) {
      return 'from-yellow-400 via-yellow-500 to-yellow-600'; // Gold for premium
    }
    
    return gradients[index % gradients.length];
  };

  if (!jobs.length) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No jobs available at the moment</p>
        <p className="text-gray-400">Check back soon for new opportunities!</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseMove={enableSpotlight ? handleMouseMove : undefined}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Floating particles */}
      {enableStars && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-green-400 rounded-full"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: star.speed,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Spotlight effect */}
      {enableSpotlight && isVisible && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, 0.15), transparent 60%)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Border glow */}
      {enableBorderGlow && (
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${glowColor}, 0.4), transparent)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: '3px'
          }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Premium Jobs
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {jobs.length} opportunities • Curated for you
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Feed</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-4 auto-rows-min">
        {jobs.map((job, index) => {
          const isActive = activeJob === job.id;
          const isHovered = hoveredJob === job.id;
          const watched = isWatched(job.id);
          
          return (
            <motion.div
              key={job.id}
              className={`${getJobSize(index)} ${getJobHeight(index)} relative group cursor-pointer`}
              onClick={() => handleJobClick(job)}
              onMouseEnter={() => setHoveredJob(job.id)}
              onMouseLeave={() => setHoveredJob(null)}
              whileHover={enableTilt ? { 
                scale: 1.02, 
                rotateY: 2,
                rotateX: 1
              } : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={isActive ? { 
                scale: [1, 1.05, 1],
                rotateY: [0, 5, 0]
              } : {}}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.6
              }}
            >
              <div className={`
                w-full h-full rounded-2xl bg-gradient-to-br ${getJobGradient(job, index)}
                shadow-xl hover:shadow-2xl transition-all duration-500
                overflow-hidden relative group
                ${isActive ? 'ring-4 ring-green-400 ring-opacity-60' : ''}
                ${job.featured ? 'ring-2 ring-yellow-400 ring-opacity-80' : ''}
              `}>
                {/* Background effects */}
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
                
                {/* Premium badge */}
                {job.featured && (
                  <div className="absolute top-3 left-3 z-20">
                    <motion.div
                      className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold"
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Crown className="w-3 h-3" />
                      <span>FEATURED</span>
                    </motion.div>
                  </div>
                )}

                {/* Watch button */}
                <div className="absolute top-3 right-3 z-20">
                  <motion.button
                    onClick={(e) => handleWatchClick(e, job.id)}
                    className={`p-2 rounded-full transition-all shadow-lg ${
                      watched 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`w-4 h-4 ${watched ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Job content */}
                <div className="relative h-full flex flex-col justify-between p-4 text-white">
                  <div>
                    {/* Company */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-4 h-4 opacity-80" />
                      <span className="text-sm font-medium opacity-90">
                        {job.company || 'Company Name'}
                      </span>
                    </div>

                    {/* Job title */}
                    <h3 className={`font-bold text-white drop-shadow-lg mb-3 leading-tight ${
                      index === 0 ? 'text-2xl' : index <= 2 ? 'text-lg' : 'text-base'
                    }`}>
                      {job.title || 'Job Title'}
                    </h3>

                    {/* Details for larger cards */}
                    {index <= 2 && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center space-x-2 text-sm opacity-90">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location || 'Location'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm opacity-90">
                          <Clock className="w-3 h-3" />
                          <span>{job.type || 'Full-time'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom section */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-white drop-shadow-lg ${
                        index === 0 ? 'text-xl' : 'text-lg'
                      }`}>
                        {formatSalary(job.salary)}
                      </div>
                      {job.salary && (
                        <div className="text-xs text-white/80">
                          per year
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {job.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-300" />
                          <span className="text-xs font-medium">{job.rating}</span>
                        </div>
                      )}
                      
                      <motion.div
                        className="bg-white/20 p-1 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover overlay with more info */}
                  <AnimatePresence>
                    {isHovered && index === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
                      >
                        <div className="text-center">
                          <p className="text-sm mb-4 line-clamp-3">
                            {job.description || 'Exciting opportunity to join our team and make a difference...'}
                          </p>
                          <div className="flex items-center justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{job.views || 0} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{job.applicants || 0} applied</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Magnetism indicator */}
                {enableMagnetism && (
                  <motion.div
                    className="absolute bottom-2 left-2 w-1 h-1 bg-white/60 rounded-full"
                    animate={{ 
                      scale: [1, 2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Live job feed • Updated every 5 minutes
          </span>
        </div>

        <motion.div
          className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
          whileHover={{ scale: 1.05 }}
        >
          <Zap className="w-4 h-4 text-green-500" />
          <span>Powered by TuiTrade Magic</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MagicBento;