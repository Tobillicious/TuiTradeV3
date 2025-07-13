// Mobile Touch Handler Component
// Provides swipe gestures and touch interactions for mobile devices

import React, { useRef, useEffect, useCallback } from 'react';

const MobileTouchHandler = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    longPressDelay = 500,
    swipeThreshold = 50,
    enabled = true
}) => {
    const touchStart = useRef({ x: 0, y: 0, time: 0 });
    const touchEnd = useRef({ x: 0, y: 0, time: 0 });
    const longPressTimer = useRef(null);
    const isLongPress = useRef(false);

    const handleTouchStart = useCallback((e) => {
        if (!enabled) return;

        const touch = e.touches[0];
        touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };

        // Start long press timer
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            onLongPress?.(e);
        }, longPressDelay);
    }, [enabled, onLongPress, longPressDelay]);

    const handleTouchMove = useCallback((e) => {
        if (!enabled) return;

        // Clear long press timer if user moves finger
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, [enabled]);

    const handleTouchEnd = useCallback((e) => {
        if (!enabled) return;

        // Clear long press timer
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        const touch = e.changedTouches[0];
        touchEnd.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };

        const deltaX = touchEnd.current.x - touchStart.current.x;
        const deltaY = touchEnd.current.y - touchStart.current.y;
        const deltaTime = touchEnd.current.time - touchStart.current.time;

        // Determine if it's a swipe or tap
        const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;
        const isQuickTouch = deltaTime < 300;

        if (isSwipe) {
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    onSwipeRight?.(e);
                } else {
                    onSwipeLeft?.(e);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    onSwipeDown?.(e);
                } else {
                    onSwipeUp?.(e);
                }
            }
        } else if (isQuickTouch && !isLongPress.current) {
            // Quick tap
            onTap?.(e);
        }
    }, [enabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, swipeThreshold]);

    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }} // Prevent default browser gestures
        >
            {children}
        </div>
    );
};

export default MobileTouchHandler; 