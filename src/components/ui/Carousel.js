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
    route: "marketplace-landing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
  },
  {
    title: "Motors",
    description: "Find your perfect ride",
    subtitle: "6 categories • Auctions & Classified",
    id: 2,
    icon: <Car className="w-8 h-8" />,
    route: "motors-landing",
    image: "https://images.unsplash.com/photo-1494976688754-90f929ac2c0e?w=800&h=600&fit=crop"
  },
  {
    title: "Property",
    description: "Your dream home awaits",
    subtitle: "3 categories • Classified",
    id: 3,
    icon: <Home className="w-8 h-8" />,
    route: "real-estate-landing",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
  },
  {
    title: "Jobs",
    description: "Your next career move",
    subtitle: "5 categories • Classified",
    id: 4,
    icon: <Briefcase className="w-8 h-8" />,
    route: "jobs-landing",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"
  },
  {
    title: "Services",
    description: "Professional services",
    subtitle: "4 categories • Classified",
    id: 5,
    icon: <Wrench className="w-8 h-8" />,
    route: "digital-goods-landing",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
  },
  {
    title: "Community",
    description: "Connect with Kiwis",
    subtitle: "3 categories • Classified",
    id: 6,
    icon: <Gift className="w-8 h-8" />,
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
      className="relative w-full h-[70vh] min-h-[500px] overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={() => handleItemClick(currentItem)}
          >
            <div className="absolute top-0 left-0 w-full h-full z-10">
              <img 
                src={currentItem.image} 
                alt={currentItem.title}
                className="w-full h-full object-cover object-center filter brightness-50 contrast-110 ken-burns"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="relative z-20 max-w-7xl w-full px-8 text-center text-white">
              <div className="max-w-2xl mx-auto">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 border-2 border-white/20 rounded-2xl backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:-translate-y-1">
                    {currentItem.icon}
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="text-6xl font-extrabold mb-4 leading-tight text-shadow"
                >
                  {currentItem.title}
                </motion.h2>

                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="text-2xl mb-2 font-light text-shadow-sm opacity-95"
                >
                  {currentItem.description}
                </motion.p>

                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="text-base mb-10 font-normal opacity-80 text-shadow-sm"
                >
                  {currentItem.subtitle}
                </motion.p>

                <motion.button
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="inline-flex items-center px-10 py-4 bg-white/10 border-2 border-white/30 rounded-full text-lg font-semibold backdrop-blur-lg transition-all duration-300 cursor-pointer text-shadow-sm hover:bg-white/20 hover:border-white/50"
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

        <button
          className="absolute top-1/2 -translate-y-1/2 z-30 bg-black/70 border-2 border-white/30 rounded-full w-16 h-16 flex items-center justify-center text-white backdrop-blur-lg transition-all duration-300 opacity-100 shadow-lg left-8 hover:bg-black/90 hover:border-white/60 hover:-translate-y-1/2 hover:scale-110"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          className="absolute top-1/2 -translate-y-1/2 z-30 bg-black/70 border-2 border-white/30 rounded-full w-16 h-16 flex items-center justify-center text-white backdrop-blur-lg transition-all duration-300 opacity-100 shadow-lg right-8 hover:bg-black/90 hover:border-white/60 hover:-translate-y-1/2 hover:scale-110"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-30">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex-1 max-w-xs h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm font-semibold min-w-[60px] text-center">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
          
          <div className="flex justify-center gap-2 flex-wrap">
            {items.map((item, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium cursor-pointer transition-all duration-300 backdrop-blur-lg ${index === currentIndex ? 'bg-teal-500/80 border-teal-500' : 'hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5'}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${item.title}`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}