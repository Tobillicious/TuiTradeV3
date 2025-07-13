import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Counter.css';

const Counter = ({
  value = 0,
  places = [1000, 100, 10, 1],
  fontSize = 48,
  padding = 8,
  gap = 4,
  textColor = "#1f2937",
  backgroundColor = "#ffffff",
  fontWeight = 700,
  fontFamily = "system-ui, -apple-system, sans-serif",
  borderRadius = 8,
  shadow = true,
  animationDuration = 0.3,
  className = ""
}) => {
  const [digits, setDigits] = useState([]);

  useEffect(() => {
    const newDigits = places.map(place => Math.floor((value / place) % 10));
    setDigits(newDigits);
  }, [value, places, digits]);

  const digitVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 }
  };

  const counterStyle = {
    fontSize: `${fontSize}px`,
    fontWeight,
    fontFamily,
    color: textColor,
    gap: `${gap}px`,
  };

  const digitStyle = {
    backgroundColor,
    padding: `${padding}px`,
    borderRadius: `${borderRadius}px`,
    boxShadow: shadow ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
    minWidth: `${fontSize * 0.8}px`,
  };

  return (
    <div className={`counter-container ${className}`} style={counterStyle}>
      {digits.map((digit, index) => (
        <div
          key={index}
          className="digit-container"
          style={digitStyle}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${digit}`}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ 
                duration: animationDuration,
                ease: "easeInOut",
                delay: index * 0.05 // Stagger the animation
              }}
              className="digit"
            >
              {digit}
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Counter;