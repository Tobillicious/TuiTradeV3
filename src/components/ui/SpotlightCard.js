import { useRef } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({ 
  children, 
  className = "", 
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  spotlightSize = 300,
  intensity = 1,
  borderRadius = "1rem",
  backgroundColor = "transparent",
  border = "1px solid rgba(255, 255, 255, 0.1)",
  ...props 
}) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
    divRef.current.style.setProperty("--spotlight-size", `${spotlightSize}px`);
    divRef.current.style.setProperty("--intensity", intensity);
  };

  const handleMouseLeave = () => {
    if (!divRef.current) return;
    divRef.current.style.setProperty("--intensity", "0");
  };

  const handleMouseEnter = () => {
    if (!divRef.current) return;
    divRef.current.style.setProperty("--intensity", intensity);
  };

  const cardStyle = {
    borderRadius,
    backgroundColor,
    border,
    ...props.style
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`card-spotlight ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;