import { useRef, useState } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  spotlightSize = 300,
  borderRadius = "1rem",
  backgroundColor = "transparent",
  border = "1px solid rgba(255, 255, 255, 0.1)",
  ...props
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!divRef.current || !isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const cardStyle = {
    borderRadius,
    backgroundColor,
    border,
    ...props.style,
    "--spotlight-color": spotlightColor,
    "--spotlight-size": `${spotlightSize}px`,
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={`card-spotlight ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
      <div className="spotlight-effect" />
    </div>
  );
};

export default SpotlightCard;