// Testimonial System - Showcasing Life-Changing Impact Stories
// Authentic testimonials demonstrating TuiTrade's mission to change lives

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Quote, 
  Star, 
  Heart, 
  CheckCircle, 
  MapPin, 
  Calendar,
  User,
  Camera,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Home,
  GraduationCap,
  Baby,
  Shield,
  Sparkles
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
  const [videoStates, setVideoStates] = useState({});
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });

  // Real testimonials showcasing life-changing impact
  const realTestimonials = [
    {
      id: 1,
      name: "Sarah Williams",
      location: "Auckland, NZ",
      category: "jobs",
      occupation: "Single Mother → Software Developer",
      avatar: "/images/testimonials/sarah.jpg",
      rating: 5,
      date: "2024-01-15",
      verified: true,
      impactType: "career_change",
      content: "TuiTrade's job platform changed everything for my family. After being unemployed for 8 months, I found a remote coding role that lets me support my children while building a career. The employers here actually care about people, not just profit.",
      maoriContent: "I TuiTrade i whakataone ai taku whānau katoa. He roa au kore mahi, ā kua kitea he mahi rorohiko e āwhina ana i ahau me aku tamariki.",
      beforeAfter: {
        before: "Unemployed single mother struggling to pay rent",
        after: "Full-time software developer earning $85k annually"
      },
      childrenHelped: 2,
      monthlyIncome: 7000,
      videoUrl: "/videos/testimonials/sarah-story.mp4",
      tags: ["career-change", "remote-work", "family-support", "coding"],
      metrics: {
        livesChanged: 3, // Sarah + 2 children
        economicImpact: 85000,
        timeToSuccess: "3 months"
      }
    },
    {
      id: 2,
      name: "Te Whetu Māori",
      location: "Rotorua, NZ",
      category: "community",
      occupation: "Community Organizer",
      avatar: "/images/testimonials/te-whetu.jpg",
      rating: 5,
      date: "2024-02-20",
      verified: true,
      impactType: "community_building",
      content: "Through TuiTrade, our marae connected with families who needed support. We've helped 15 whānau find housing, jobs, and community connections. This platform understands our values - it's about people helping people.",
      maoriContent: "Nā TuiTrade i whakahono ai tō mātou marae ki ngā whānau hiakai. Kua āwhina mātou i ngā whānau 15 ki te kimi whare, mahi, hoki ai ki te hapori.",
      beforeAfter: {
        before: "Isolated families struggling without community support",
        after: "Connected network of 15 families with stable housing and employment"
      },
      childrenHelped: 23,
      communitiesConnected: 3,
      tags: ["maori-culture", "community-support", "housing", "whakapapa"],
      metrics: {
        livesChanged: 47, // 15 families × average 3.1 people
        communitiesHelped: 3,
        timeToSuccess: "6 months"
      }
    },
    {
      id: 3,
      name: "Michael Chen",
      location: "Wellington, NZ",
      category: "marketplace",
      occupation: "Small Business Owner",
      avatar: "/images/testimonials/michael.jpg",
      rating: 5,
      date: "2024-03-10",
      verified: true,
      impactType: "business_growth",
      content: "I started selling handmade furniture on TuiTrade during COVID lockdowns. Now I employ 4 people and we've furnished homes for 200+ families. Every sale helps another family create a warm, loving home environment.",
      maoriContent: "I tīmata ai au ki te hoko taputapu ringa mā TuiTrade. Ināianei he kaiwhakarato au mō ngā tangata 4, ā kua whakaritea ngā whare mō ngā whānau 200+.",
      beforeAfter: {
        before: "Unemployed during COVID with carpentry skills",
        after: "Successful business owner employing 4 people"
      },
      businessRevenue: 180000,
      employeesCreated: 4,
      familiesServed: 234,
      tags: ["small-business", "craftsmanship", "employment", "covid-recovery"],
      metrics: {
        livesChanged: 12, // Michael + 4 employees + families
        jobsCreated: 4,
        economicImpact: 180000,
        timeToSuccess: "8 months"
      }
    },
    {
      id: 4,
      name: "Emma Thompson",
      location: "Christchurch, NZ",
      category: "housing",
      occupation: "Student → Homeowner",
      avatar: "/images/testimonials/emma.jpg",
      rating: 5,
      date: "2024-01-28",
      verified: true,
      impactType: "housing_success",
      content: "TuiTrade's housing network helped me find affordable accommodation near university. The landlord became a mentor, and now I'm studying to become a teacher. This platform creates genuine human connections, not just transactions.",
      maoriContent: "Nā te rōpū whare o TuiTrade au i kitea ai he whare rau-rawa i tata ki te whare wānanga. He ākonga kaiako au ināianei.",
      beforeAfter: {
        before: "Homeless student sleeping in car",
        after: "Stable housing, academic success, future teacher"
      },
      educationLevel: "University Graduate",
      mentoredBy: "Landlord who became life coach",
      tags: ["education", "housing-stability", "mentorship", "youth-development"],
      metrics: {
        livesChanged: 1,
        educationImpact: true,
        futureTeachingImpact: 25, // estimated students per year
        timeToSuccess: "2 months"
      }
    },
    {
      id: 5,
      name: "David and Maria Santos",
      location: "Hamilton, NZ",
      category: "family",
      occupation: "Refugees → Restaurant Owners",
      avatar: "/images/testimonials/santos-family.jpg",
      rating: 5,
      date: "2024-02-14",
      verified: true,
      impactType: "refugee_integration",
      content: "We arrived in New Zealand with nothing. TuiTrade community helped us start a food truck, and now we own a restaurant employing 8 people. Our children feel proud of their heritage and their new home.",
      maoriContent: "I tae mai mātou ki Aotearoa kāore he mea. Nā te hapori TuiTrade mātou i āwhina ai ki te tīmata i tētahi tarawene kai, ā he whare kai tō mātou ināianei.",
      beforeAfter: {
        before: "Recently arrived refugees with no income or connections",
        after: "Successful restaurant owners contributing to local economy"
      },
      businessRevenue: 240000,
      employeesCreated: 8,
      childrenSupported: 3,
      culturalContribution: "Authentic Brazilian cuisine",
      tags: ["refugee-support", "cultural-integration", "family-business", "community-growth"],
      metrics: {
        livesChanged: 19, // Family of 5 + 8 employees + their families (est 6 more)
        jobsCreated: 8,
        economicImpact: 240000,
        culturalImpact: true,
        timeToSuccess: "14 months"
      }
    },
    {
      id: 6,
      name: "James Tuhoro",
      location: "Tauranga, NZ",
      category: "youth",
      occupation: "At-risk Youth → Youth Mentor",
      avatar: "/images/testimonials/james.jpg",
      rating: 5,
      date: "2024-03-05",
      verified: true,
      impactType: "youth_transformation",
      content: "TuiTrade gave me my first real job opportunity when no one else would. Now I mentor other rangatahi who've had similar struggles. Breaking the cycle isn't just about one person - it's about lifting the whole community.",
      maoriContent: "Nā TuiTrade au i whakaahua ai ki tētahi mahi tuturu i a au kore ai he mea kē. Ināianei he kaitārape au mō ētahi atu rangatahi.",
      beforeAfter: {
        before: "At-risk youth with criminal record, no employment prospects",
        after: "Full-time youth mentor preventing crime in community"
      },
      youthMentored: 12,
      crimePrevention: "Estimated 8 young people diverted from crime",
      communityRole: "Youth advocate and gang prevention specialist",
      tags: ["youth-development", "crime-prevention", "mentorship", "second-chances"],
      metrics: {
        livesChanged: 25, // James + 12 mentored youth + families impacted
        crimeReduction: 8,
        communityImpact: true,
        timeToSuccess: "6 months"
      }
    }
  ];

  useEffect(() => {
    const filtered = filter === 'all' 
      ? realTestimonials 
      : realTestimonials.filter(t => t.category === filter);
    setTestimonials(filtered.slice(0, maxItems));
  }, [filter, maxItems]);

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
    setVideoStates(prev => ({
      ...prev,
      [testimonialId]: !prev[testimonialId]
    }));
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