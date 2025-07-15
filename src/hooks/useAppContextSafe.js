// useAppContextSafe - Safe context destructuring hook for app-wide context
// Provides validated and safe destructuring of AppContext with fallbacks
// Prevents common errors with missing context values

import { useAppContext } from '../context/AppContext';
import { safeArrayOperation } from '../lib/debugUtils';

export const useAppContextSafe = () => {
  const contextValue = useAppContext();
  
  // Development logging for context debugging
  if (process.env.NODE_ENV === 'development') {
    console.group('🔧 useAppContextSafe: Context Validation');
    console.log('Context value:', contextValue);
    console.log('watchedItems type:', typeof contextValue?.watchedItems);
    console.log('cartItems type:', typeof contextValue?.cartItems);
    console.groupEnd();
  }
  
  // Safe destructuring with explicit validation and fallbacks
  const {
    onWatchToggle = () => console.warn('useAppContextSafe: onWatchToggle not available'),
    watchedItems: rawWatchedItems = [],
    onAddToCart = () => console.warn('useAppContextSafe: onAddToCart not available'),
    cartItems: rawCartItems = [],
    onNavigate = () => console.warn('useAppContextSafe: onNavigate not available'),
    setActiveModal = () => console.warn('useAppContextSafe: setActiveModal not available'),
    user = null,
    isAuthenticated = false,
    theme = 'light'
  } = contextValue || {};
  
  // Use safe array operations to prevent includes() and other array method errors
  const watchedItems = safeArrayOperation(rawWatchedItems, 'watchedItems', []);
  const cartItems = safeArrayOperation(rawCartItems, 'cartItems', []);
  
  // Helper functions for common operations
  const isItemWatched = (itemId) => {
    try {
      return Array.isArray(watchedItems) && watchedItems.includes?.(itemId);
    } catch (error) {
      console.warn('useAppContextSafe: Error checking watched status:', error);
      return false;
    }
  };
  
  const isItemInCart = (itemId) => {
    try {
      return Array.isArray(cartItems) && cartItems.includes?.(itemId);
    } catch (error) {
      console.warn('useAppContextSafe: Error checking cart status:', error);
      return false;
    }
  };
  
  const safeOnWatchToggle = (itemId) => {
    try {
      onWatchToggle(itemId);
    } catch (error) {
      console.error('useAppContextSafe: Error toggling watch:', error);
    }
  };
  
  const safeOnAddToCart = (item) => {
    try {
      onAddToCart(item);
    } catch (error) {
      console.error('useAppContextSafe: Error adding to cart:', error);
    }
  };
  
  const safeOnNavigate = (path, options = {}) => {
    try {
      onNavigate(path, options);
    } catch (error) {
      console.error('useAppContextSafe: Error navigating:', error);
    }
  };
  
  return {
    // Original context values (validated)
    onWatchToggle,
    watchedItems,
    onAddToCart,
    cartItems,
    onNavigate,
    setActiveModal,
    user,
    isAuthenticated,
    theme,
    
    // Helper functions
    isItemWatched,
    isItemInCart,
    
    // Safe wrapper functions
    safeOnWatchToggle,
    safeOnAddToCart,
    safeOnNavigate,
    
    // Context state
    hasContext: !!contextValue,
    contextErrors: []
  };
};

export default useAppContextSafe;