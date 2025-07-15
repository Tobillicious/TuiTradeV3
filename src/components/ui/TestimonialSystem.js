// Testimonial System - Showcasing Life-Changing Impact Stories
// Authentic testimonials demonstrating TuiTrade's mission to change lives

import React, { useState, useEffect, useRef } from 'react';
import { getTestimonials, getTestimonialStats } from '../../lib/testimonialsService';
import { motion, useInView } from 'framer-motion';
import { 
  Quote, 
  Star, 
  Heart, 
  CheckCircle, 
  MapPin, 
  Calendar,
  Video,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  Home,
  GraduationCap,
  Baby,
  Shield,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const TestimonialSystem = ({ 
  className = "",
  displayMode = "carousel", // carousel, grid, featured, masonry
  category = "all", // all, jobs, marketplace, community, housing
  maxItems = 6,
  autoPlay = true,
  showStats = true
}) => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [filter, setFilter] = useState(category);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });


  // Load testimonials from Firebase
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const testimonialsData = await getTestimonials({
          category: filter,
          maxItems,
          featured: displayMode === 'featured',
          verified: true
        });
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        // Fallback handled by testimonialsService
      }
    };

    loadTestimonials();
  }, [filter, maxItems, displayMode]);

  useEffect(() => {
    if (!isPlaying || displayMode !== 'carousel') return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, testimonials.length, displayMode]);

  const nextTestimonial = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleVideo = (testimonialId) => {
    // Video functionality placeholder - integrate with video player
    console.log('Play video for testimonial:', testimonialId);
  };

  const categories = [
    { id: 'all', label: 'All Stories', maori: 'Katoa', icon: Heart },
    { id: 'jobs', label: 'Career Success', maori: 'Mahi Angitu', icon: Briefcase },
    { id: 'marketplace', label: 'Business Growth', maori: 'Pakihi Tipu', icon: TrendingUp },
    { id: 'community', label: 'Community Impact', maori: 'Hapori Pānga', icon: Users },
    { id: 'housing', label: 'Housing Success', maori: 'Whare Angitu', icon: Home },
    { id: 'youth', label: 'Youth Development', maori: 'Rangatahi Whakatipu', icon: GraduationCap },
    { id: 'family', label: 'Family Support', maori: 'Whānau Tautoko', icon: Baby }
  ];

  const TestimonialCard = ({ testimonial, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500" />
      
      {/* Quote icon */}
      <Quote className="w-12 h-12 text-green-500 mb-6 opacity-20 absolute top-4 right-4" />
      
      {/* Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=10b981&color=white`;
            }}
          />
          {testimonial.verified && (
            <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full absolute -bottom-1 -right-1" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
            {testimonial.verified && (
              <Shield className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{testimonial.occupation}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{testimonial.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(testimonial.date).toLocaleDateString('en-NZ')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          {testimonial.videoUrl && (
            <button
              onClick={() => toggleVideo(testimonial.id)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <blockquote className="text-gray-800 leading-relaxed mb-4 italic">
          "{testimonial.content}"
        </blockquote>
        {testimonial.maoriContent && (
          <blockquote className="text-gray-600 text-sm leading-relaxed italic border-l-4 border-green-200 pl-4">
            "{testimonial.maoriContent}"
          </blockquote>
        )}
      </div>

      {/* Before/After */}
      {testimonial.beforeAfter && (
        <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2">Before TuiTrade</h4>
              <p className="text-sm text-red-600">{testimonial.beforeAfter.before}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-2">After TuiTrade</h4>
              <p className="text-sm text-green-600">{testimonial.beforeAfter.after}</p>
            </div>
          </div>
        </div>
      )}

      {/* Impact Metrics */}
      {testimonial.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {testimonial.metrics.livesChanged && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{testimonial.metrics.livesChanged}</div>
              <div className="text-xs text-gray-600">Lives Changed</div>
            </div>
          )}
          {testimonial.metrics.jobsCreated && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testimonial.metrics.jobsCreated}</div>
              <div className="text-xs text-gray-600">Jobs Created</div>
            </div>
          )}
          {testimonial.metrics.economicImpact && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(testimonial.metrics.economicImpact / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-600">Economic Impact</div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {testimonial.tags.map((tag, i) => (
          <span 
            key={i}
            className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );

  const CarouselView = () => (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <TestimonialCard testimonial={testimonial} index={0} />
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex space-x-2">
          <button
            onClick={prevTestimonial}
            className="p-3 bg-white border-2 border-gray-200 rounded-full hover:border-green-500 hover:text-green-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextTestimonial}
            className="p-3 bg-white border-2 border-gray-200 rounded-full hover:border-green-500 hover:text-green-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
      ))}
    </div>
  );

  if (!testimonials.length) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No testimonials found for this category.</p>
      </div>
    );
  }

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className={`testimonial-system ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center space-x-3 mb-4"
        >
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <h2 className="text-4xl font-bold text-gray-900">Real Stories, Real Impact</h2>
          <Heart className="w-8 h-8 text-red-500" />
        </motion.div>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 mb-2"
        >
          Every transaction on TuiTrade changes lives across Aotearoa New Zealand
        </motion.p>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-green-600 italic"
        >
          Ia tauhokohoko i TuiTrade ka whakataone i ngā oranga puta noa i Aotearoa
        </motion.p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${
              filter === cat.id
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:text-green-600'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            <span className="font-medium">{cat.label}</span>
            <span className="text-sm opacity-75">({cat.maori})</span>
          </motion.button>
        ))}
      </div>

      {/* Testimonials Display */}
      {displayMode === 'carousel' ? <CarouselView /> : <GridView />}

      {/* Impact Statistics */}
      {showStats && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Collective Impact Across All Stories</h3>
            <p className="text-green-100">Every testimonial represents multiple lives changed</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">247+</div>
              <div className="text-green-100">Lives Directly Changed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-green-100">Jobs Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$505k+</div>
              <div className="text-green-100">Economic Impact</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Children Helped</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TestimonialSystem;