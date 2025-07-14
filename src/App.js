// =============================================
// App.js - Main Application Shell & Routing
// -----------------------------------------
// Entry point for the React app. Handles global providers (auth, theme, notifications, Te Reo),
// routing, layout, and top-level state. Integrates category navigation, search, modals, and mobile nav.
// Key integration points: Te Reo Māori, performance monitoring, notifications, and context providers.
// =============================================
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ChevronDown } from 'lucide-react';

// Core setup
import { auth, db } from './lib/firebase';
import { AuthContext } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TeReoProvider } from './components/ui/TeReoToggle';
import { AccessibilityProvider } from './components/ui/AccessibilityProvider';
import SocialProofIndicators from './components/ui/SocialProofIndicators';
import { trackEvent, setUserId, trackPageView } from './lib/analytics';
import { PreloadCriticalResources } from './components/ui/PerformanceOptimizer';

// UI Components
import { FullPageLoader } from './components/ui/Loaders';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MobileBottomNav from './components/ui/MobileBottomNav';
// import NotificationBell from './components/ui/NotificationBell';
import AuthModal from './components/modals/AuthModal';
import ContactSellerModal from './components/modals/ContactSellerModal';
import ShoppingCartModal from './components/modals/ShoppingCartModal';
import EnhancedCheckoutModal from './components/modals/EnhancedCheckoutModal';
import './App.css';

function AppContent() {
    // =============================================
    // AppContent: Main app logic, state, handlers, and UI layout
    // =============================================
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [watchedItems, setWatchedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isContactSellerModalOpen, setIsContactSellerModalOpen] = useState(false);
    const [contactSellerItem, setContactSellerItem] = useState(null);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutItem, setCheckoutItem] = useState(null);
    const [isTeReoMode, setIsTeReoMode] = useState(false);
    const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
    const { showNotification } = useNotification();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // --- HOOKS ---
    // useEffect hooks: Auth state, analytics, menu handling, watchlist sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setIsAuthReady(true);
            if (user) {
                setUserId(user.uid);
                trackEvent('user_login', { email: user.email });
            } else {
                setWatchedItems([]);
                setCartItems([]);
                trackEvent('user_logout');
            }
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isCategoriesMenuOpen && !event.target.closest('.categories-menu')) {
                setIsCategoriesMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCategoriesMenuOpen]);

    useEffect(() => {
        if (!currentUser) {
            setWatchedItems([]);
            return;
        }
        const watchlistRef = collection(db, "users", currentUser.uid, "watchlist");
        const unsubscribe = onSnapshot(watchlistRef, (snapshot) => {
            setWatchedItems(snapshot.docs.map(doc => doc.id));
        }, (error) => {
            console.error('Error loading watchlist:', error);
            setWatchedItems([]);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // --- HANDLERS ---
    // Handlers: Logout, watch toggle, search, cart, navigation, etc.
    const handleLogout = async () => {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        setIsProfileMenuOpen(false);
        showNotification("You've been logged out.", "info");
        navigate('/');
    };

    const handleWatchToggle = useCallback(async (listingId) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        const watchlistRef = doc(db, "users", currentUser.uid, "watchlist", listingId);
        if (watchedItems?.includes(listingId)) {
            await deleteDoc(watchlistRef);
            showNotification("Removed from watchlist", "info");
        } else {
            await setDoc(watchlistRef, { createdAt: new Date() });
            showNotification("Added to watchlist", "success");
        }
    }, [currentUser, watchedItems, showNotification]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        trackEvent('search', { query: searchQuery });
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    const handleAddToCart = (item) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        if (!cartItems?.some(cartItem => cartItem.id === item.id)) {
            setCartItems(prev => [...prev, item]);
            showNotification(`${item.title} added to cart!`, 'success');
        } else {
            showNotification("Item is already in your cart.", "info");
        }
    };

    const handleRemoveFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        showNotification("Item removed from cart.", "info");
    };

    const handleClearCart = () => {
        setCartItems([]);
        showNotification("Cart cleared.", "info");
    };

    const handleContactSeller = (item) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        setContactSellerItem(item);
        setIsContactSellerModalOpen(true);
    };

    const handleBuyNow = (item) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        if (item.userId === currentUser.uid) {
            showNotification("You cannot buy your own item.", "error");
            return;
        }
        setCheckoutItem(item);
        setIsCheckoutModalOpen(true);
    };

    const handleCheckoutSuccess = (result) => {
        showNotification("Purchase completed successfully!", "success");
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== checkoutItem.id));
        navigate('/orders');
    };
    
    const appContextValue = {
        currentUser,
        watchedItems: watchedItems || [],
        onWatchToggle: handleWatchToggle,
        onAddToCart: handleAddToCart,
        onBuyNow: handleBuyNow,
        cartItems: cartItems || [],
        onContactSeller: handleContactSeller,
    };

    const handleNavClick = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsCategoriesMenuOpen(false);
    }

    return (
        <AuthContext.Provider value={{ currentUser, isAuthReady }}>
            <AppProvider value={appContextValue}>
                <PreloadCriticalResources />
                <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

                    {/* --- Modals --- */}
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                    <ContactSellerModal isOpen={isContactSellerModalOpen} onClose={() => setIsContactSellerModalOpen(false)} item={contactSellerItem} />
                    <ShoppingCartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onClearCart={handleClearCart} onBuyNow={handleBuyNow} />
                    <EnhancedCheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} item={checkoutItem} onSuccess={handleCheckoutSuccess} currentUser={currentUser} />

                    {/* --- Header --- */}
                    <header className={`shadow-sm border-b sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleNavClick('/')}
                                        className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-3 shadow-md">
                                            <span className="text-white font-bold text-xl">T</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-green-600">TuiTrade</h1>
                                    </button>
                                </div>

                                <div className="flex-1 max-w-2xl mx-4 md:mx-8">
                                    <form onSubmit={handleSearch} className="relative w-full">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rapua mai - Search for anything..."
                                            className="w-full pl-10 md:pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base placeholder-gray-400"
                                        />
                                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </form>
                                </div>

                                {/* Categories Dropdown Menu */}
                                <div className="hidden lg:relative categories-menu">
                                    <button
                                        onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'}`}
                                    >
                                        <span className="font-medium">Categories</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCategoriesMenuOpen && (
                                        <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl py-2 z-50 ring-1 ring-opacity-5 animate-fade-in-up ${isDarkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-black'}`}>
                                            <button
                                                onClick={() => handleNavClick('/marketplace')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                🛍️ Marketplace / Tauhokohoko
                                            </button>
                                            <button
                                                onClick={() => handleNavClick('/motors')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                🚗 Motors / Waka
                                            </button>
                                            <button
                                                onClick={() => handleNavClick('/real-estate')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                🏠 Property / Rawa
                                            </button>
                                            <button
                                                onClick={() => handleNavClick('/jobs')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                💼 Jobs / Mahi
                                            </button>
                                            <button
                                                onClick={() => handleNavClick('/digital-goods')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                💻 Digital Goods
                                            </button>
                                            <button
                                                onClick={() => handleNavClick('/services')}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                            >
                                                🔧 Services / Ratonga
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 md:space-x-4">
                                    {/* Mobile menu toggle */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className={`lg:hidden p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>

                                    {/* Profile Manager - Featured Access */}
                                    <button
                                        onClick={() => handleNavClick('/profiles')}
                                        className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${isDarkMode ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-white' : 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-bold">👤 Profiles</span>
                                    </button>

                                    {/* AI Jobs Search */}
                                    <button
                                        onClick={() => handleNavClick('/advanced-job-search')}
                                        className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM12 10h.01" />
                                        </svg>
                                        <span className="text-sm font-medium">🤖 AI Jobs</span>
                                    </button>

                                    {/* Analytics Dashboard */}
                                    <button
                                        onClick={() => handleNavClick('/analytics-dashboard')}
                                        className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-sm font-medium">📊 Analytics</span>
                                    </button>

                                    {/* Watchlist */}
                                    <button
                                        onClick={() => currentUser ? handleNavClick('/watchlist') : setIsAuthModalOpen(true)}
                                        className={`p-2 transition-colors relative group ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                    >
                                        <Heart className="w-6 h-6" />
                                        {watchedItems.length > 0 && currentUser && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {watchedItems.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Shopping cart */}
                                    <button
                                        onClick={() => setIsCartModalOpen(true)}
                                        className={`p-2 transition-colors relative ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m5.5-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                                        </svg>
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* User profile */}
                                    {currentUser ? (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                                className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'}`}
                                            >
                                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-medium">
                                                        {currentUser.email?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {isProfileMenuOpen && (
                                                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl py-2 z-50 ring-1 ring-opacity-5 animate-fade-in-up ${isDarkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-black'}`}>
                                                    {/* Personal Section */}
                                                    <div className="px-4 py-2">
                                                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personal</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/profiles');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        👤 Profile Manager
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/social-profile');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        🏆 Social Profile & Achievements
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/my-listings');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        📦 My Listings
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/orders');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        🛒 Orders
                                                    </button>

                                                    {/* Professional Section */}
                                                    <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                                                    <div className="px-4 py-2">
                                                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Professional</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/job-seeker-profile');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        💼 Job Seeker Profile
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/employer-dashboard');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        🏢 Employer Dashboard
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleNavClick('/analytics-dashboard');
                                                            setIsProfileMenuOpen(false);
                                                        }}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
                                                    >
                                                        📊 Analytics Dashboard
                                                    </button>

                                                    {/* Actions */}
                                                    <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}
                                                    >
                                                        🚪 Sign Out
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsAuthModalOpen(true)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                        >
                                            Sign In
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* --- Main Content --- */}
                    <main className="flex-grow flex flex-col pb-20 lg:pb-0">
                        <Suspense fallback={<FullPageLoader />}>
                            {!isAuthReady ? <FullPageLoader message="Connecting to TuiTrade..." /> : <Outlet />}
                        </Suspense>
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <MobileBottomNav
                        onNavigate={handleNavClick}
                        watchedItemsCount={watchedItems.length}
                        cartItemsCount={cartItems.length}
                        currentUser={currentUser}
                        onAuthClick={() => setIsAuthModalOpen(true)}
                    />

                    {/* --- Footer --- */}
                    <footer className={`text-white ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
                        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {/* Company Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold text-xl">T</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-green-400">TuiTrade</h2>
                                    </div>
                                    <p className="text-gray-300 text-sm">
                                        Aotearoa New Zealand's marketplace celebrating Māori culture and values through sustainable trading.
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        He taonga tēnei mō te iwi katoa - A treasure for all people
                                    </p>
                                </div>

                                {/* For Buyers */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-green-400">For Buyers / Mō ngā Kaihoko</h3>
                                    <nav className="space-y-2">
                                        <button onClick={() => handleNavClick('/how-to-buy')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            How to Buy
                                        </button>
                                        <button onClick={() => handleNavClick('/payment-options')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Payment Options
                                        </button>
                                        <button onClick={() => handleNavClick('/buyer-protection')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Buyer Protection
                                        </button>
                                        <button onClick={() => handleNavClick('/shipping-info')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Shipping Info
                                        </button>
                                    </nav>
                                </div>

                                {/* For Sellers */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-green-400">For Sellers / Mō ngā Kaihoko</h3>
                                    <nav className="space-y-2">
                                        <button onClick={() => handleNavClick('/how-to-sell')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            How to Sell
                                        </button>
                                        <button onClick={() => handleNavClick('/seller-fees')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Seller Fees
                                        </button>
                                        <button onClick={() => handleNavClick('/seller-tools')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Seller Tools
                                        </button>
                                        <button onClick={() => handleNavClick('/success-tips')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Success Tips
                                        </button>
                                    </nav>
                                </div>

                                {/* Support & Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-green-400">Support & Info / Tautoko</h3>
                                    <nav className="space-y-2">
                                        <button onClick={() => handleNavClick('/help')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Help Center
                                        </button>
                                        <button onClick={() => handleNavClick('/contact')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Contact Us
                                        </button>
                                        <button onClick={() => handleNavClick('/safety')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Safety Tips
                                        </button>
                                        <button onClick={() => handleNavClick('/terms-privacy')} className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                                            Terms & Privacy
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span>© 2024 TuiTrade. All rights reserved.</span>
                                    <span>|</span>
                                    <span>Made with ❤️ in Aotearoa</span>
                                </div>
                                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Secure Trading</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>Trusted Community</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
                
                {/* Floating Social Proof Indicators */}
                <SocialProofIndicators 
                    position="floating"
                    showRecentActivity={true}
                    maxRecentItems={5}
                />
            </AppProvider>
        </AuthContext.Provider>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <TeReoProvider>
                    <AccessibilityProvider>
                        <NotificationProvider>
                            <AppContent />
                        </NotificationProvider>
                    </AccessibilityProvider>
                </TeReoProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
