import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, List, Eye, Lock, Tag, MessageCircle, Shield, Star, BarChart3, Package, Sun, Moon, Menu, X, ChevronDown, Car, Home as HomeIcon, Briefcase, Gift } from 'lucide-react';

// Core setup
import { auth, db } from './lib/firebase';
import { AuthContext } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TeReoProvider } from './components/ui/TeReoToggle';
import { trackEvent, setUserId, trackPageView } from './lib/analytics';
import { PreloadCriticalResources } from './components/ui/PerformanceOptimizer';

// UI Components
import { FullPageLoader } from './components/ui/Loaders';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MobileBottomNav from './components/ui/MobileBottomNav';
import NotificationBell from './components/ui/NotificationBell';
import AuthModal from './components/modals/AuthModal';
import ContactSellerModal from './components/modals/ContactSellerModal';
import ShoppingCartModal from './components/modals/ShoppingCartModal';
import EnhancedCheckoutModal from './components/modals/EnhancedCheckoutModal';
import './App.css';

function AppContent() {
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
    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // --- HOOKS ---
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
    const handleLogout = async () => {
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
        if (watchedItems.includes(listingId)) {
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
        if (!cartItems.some(cartItem => cartItem.id === item.id)) {
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
        watchedItems,
        onWatchToggle: handleWatchToggle,
        onAddToCart: handleAddToCart,
        onBuyNow: handleBuyNow,
        cartItems,
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
                                            {/* This section will need to be updated to use navigate */}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 md:space-x-4">
                                    {/* ... other header buttons ... */}
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
                                    {/* ... */}
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
                        {/* ... footer content ... */}
                    </footer>
                </div>
            </AppProvider>
        </AuthContext.Provider>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <TeReoProvider>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </TeReoProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
