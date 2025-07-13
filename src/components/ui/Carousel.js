import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Car, Home, Briefcase, Wrench, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import "./Carousel.css";

const DEFAULT_ITEMS = [
  {
    title: "Marketplace",
    description: "Everything you need, all in one place",
    subtitle: "11 categories • Auctions & Classified",
    id: 1,
    icon: <ShoppingCart className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    route: "marketplace-landing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
  },
  {
    title: "Motors",
    description: "Find your perfect ride",
    subtitle: "6 categories • Auctions & Classified",
    id: 2,
    icon: <Car className="w-8 h-8" />,
    color: "from-red-500 to-red-600",
    route: "motors-landing",
    image: "https://images.unsplash.com/photo-1494976688754-90f929ac2c0e?w=800&h=600&fit=crop"
  },
  {
    title: "Property",
    description: "Your dream home awaits",
    subtitle: "3 categories • Classified",
    id: 3,
    icon: <Home className="w-8 h-8" />,
    color: "from-green-500 to-green-600",
    route: "real-estate-landing",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
  },
  {
    title: "Jobs",
    description: "Your next career move",
    subtitle: "5 categories • Classified",
    id: 4,
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    route: "jobs-landing",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"
  },
  {
    title: "Services",
    description: "Professional services",
    subtitle: "4 categories • Classified",
    id: 5,
    icon: <Wrench className="w-8 h-8" />,
    color: "from-orange-500 to-orange-600",
    route: "digital-goods-landing",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
  },
  {
    title: "Community",
    description: "Connect with Kiwis",
    subtitle: "3 categories • Classified",
    id: 6,
    icon: <Gift className="w-8 h-8" />,
    color: "from-pink-500 to-pink-600",
    route: "community-landing",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
  },
];

export default function Carousel({
  items = DEFAULT_ITEMS,
  autoplay = true,
  autoplayDelay = 5000,
  pauseOnHover = true,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  // Auto-advance slides
  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoplayDelay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoplay, autoplayDelay, isHovered, pauseOnHover, items.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleItemClick = (item) => {
    if (onNavigate && item.route) {
      onNavigate(item.route);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <div 
      className="hero-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hero-carousel-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={`hero-slide bg-gradient-to-br ${currentItem.color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={() => handleItemClick(currentItem)}
          >
            {/* Background Image */}
            <div className="hero-slide-bg">
              <img 
                src={currentItem.image} 
                alt={currentItem.title}
                className="hero-slide-image"
              />
              <div className="hero-slide-overlay"></div>
            </div>

            {/* Content */}
            <div className="hero-slide-content">
              <div className="hero-slide-text">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="hero-slide-icon-container"
                >
                  <div className="hero-slide-icon">
                    {currentItem.icon}
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="hero-slide-title"
                >
                  {currentItem.title}
                </motion.h2>

                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="hero-slide-description"
                >
                  {currentItem.description}
                </motion.p>

                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="hero-slide-subtitle"
                >
                  {currentItem.subtitle}
                </motion.p>

                <motion.button
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="hero-slide-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(currentItem);
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore {currentItem.title}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Always Visible */}
        <button
          className="hero-nav-button hero-nav-prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          className="hero-nav-button hero-nav-next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Progress Bar and Category Names */}
        <div className="hero-navigation-bar">
          <div className="hero-progress-container">
            <div className="hero-progress-bar">
              <div 
                className="hero-progress-fill"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              />
            </div>
            <span className="hero-progress-text">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
          
          <div className="hero-category-nav">
            {items.map((item, index) => (
              <button
                key={index}
                className={`hero-category-button ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${item.title}`}
              >
                {item.icon}
                <span className="hero-category-name">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Call-to-Action Overlay */}
        <div className="hero-cta-overlay">
          <div className="hero-cta-content">
            <p className="hero-cta-hint">
              Click to explore • Swipe to browse • Auto-advance every 5s
            </p>
            <div className="hero-pause-button">
              <button
                onClick={() => setCurrentIndex(currentIndex)} // Reset timer
                className="hero-pause-btn"
                aria-label="Pause autoplay"
              >
                ⏸ Pause
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}