import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Search, Heart, ShoppingCart, User, List, Eye, Lock, Tag, MessageCircle, Shield, Star, BarChart3, Package, Sun, Moon, Menu, X, ChevronDown, Car, Home as HomeIcon, Briefcase, Gift } from 'lucide-react';

// Core setup
import { auth, db } from './lib/firebase';
import { AuthContext } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TeReoProvider } from './components/ui/TeReoToggle';
import { trackPageView, trackEvent, setUserId } from './lib/analytics';
import { PreloadCriticalResources } from './components/ui/PerformanceOptimizer';

// UI Components & Pages - Lazy loaded for better performance
import { FullPageLoader } from './components/ui/Loaders';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MobileBottomNav from './components/ui/MobileBottomNav';
import AuthModal from './components/modals/AuthModal';
import ContactSellerModal from './components/modals/ContactSellerModal';
import ShoppingCartModal from './components/modals/ShoppingCartModal';
import EnhancedCheckoutModal from './components/modals/EnhancedCheckoutModal';
import './App.css';

// Lazy load page components
const HomePage = lazy(() => import('./components/pages/HomePage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const MyListingsPage = lazy(() => import('./components/pages/MyListingsPage'));
const WatchlistPage = lazy(() => import('./components/pages/WatchlistPage'));
const CreateListingPage = lazy(() => import('./components/pages/CreateListingPage'));
const ItemDetailPage = lazy(() => import('./components/pages/ItemDetailPage'));
const CategoryPage = lazy(() => import('./components/pages/CategoryPage'));
const SearchResultsPage = lazy(() => import('./components/pages/SearchResultsPage'));
const MessagesPage = lazy(() => import('./components/pages/MessagesPage'));
const SellerDashboard = lazy(() => import('./components/pages/SellerDashboard'));
const SellerPage = lazy(() => import('./components/pages/SellerPage'));
const OrdersPage = lazy(() => import('./components/pages/OrdersPage'));
const TermsAndPrivacyPage = lazy(() => import('./components/pages/TermsAndPrivacyPage'));

// Buyer and Seller Information Pages
const HowToBuyPage = lazy(() => import('./components/pages/HowToBuyPage'));
const PaymentOptionsPage = lazy(() => import('./components/pages/PaymentOptionsPage'));
const BuyerProtectionPage = lazy(() => import('./components/pages/BuyerProtectionPage'));
const ShippingInfoPage = lazy(() => import('./components/pages/ShippingInfoPage'));
const HowToSellPage = lazy(() => import('./components/pages/HowToSellPage'));
const SellerFeesPage = lazy(() => import('./components/pages/SellerFeesPage'));
const SellerToolsPage = lazy(() => import('./components/pages/SellerToolsPage'));
const SuccessTipsPage = lazy(() => import('./components/pages/SuccessTipsPage'));
const HelpCenterPage = lazy(() => import('./components/pages/HelpCenterPage'));
const ContactUsPage = lazy(() => import('./components/pages/ContactUsPage'));
const SafetyTipsPage = lazy(() => import('./components/pages/SafetyTipsPage'));

// Category Landing Pages
const MarketplaceLanding = lazy(() => import('./components/pages/MarketplaceLanding'));
const MotorsLanding = lazy(() => import('./components/pages/MotorsLanding'));
const RealEstateLanding = lazy(() => import('./components/pages/RealEstateLanding'));
const JobsLanding = lazy(() => import('./components/pages/JobsLanding'));
const JobApplicationPage = lazy(() => import('./components/pages/JobApplicationPage'));
const EmployerDashboard = lazy(() => import('./components/pages/EmployerDashboard'));
const CreateJobPage = lazy(() => import('./components/pages/CreateJobPage'));
const JobSeekerProfile = lazy(() => import('./components/pages/JobSeekerProfile'));
const ApplicationDetailPage = lazy(() => import('./components/pages/ApplicationDetailPage'));
const ApplicationsManagementPage = lazy(() => import('./components/pages/ApplicationsManagementPage'));
const ApplicationFormBuilder = lazy(() => import('./components/pages/ApplicationFormBuilder'));
const AdvancedJobSearch = lazy(() => import('./components/pages/AdvancedJobSearch'));
const AnalyticsDashboard = lazy(() => import('./components/pages/AnalyticsDashboard'));
const DigitalGoodsLanding = lazy(() => import('./components/pages/DigitalGoodsLanding'));
const ServicesLanding = lazy(() => import('./components/pages/ServicesLanding'));
const UsedGoodsLanding = lazy(() => import('./components/pages/UsedGoodsLanding'));
const NewGoodsLanding = lazy(() => import('./components/pages/NewGoodsLanding'));
const CommunityLanding = lazy(() => import('./components/pages/CommunityLanding'));
const NeighbourhoodsPage = lazy(() => import('./components/pages/NeighbourhoodsPage'));
const NeighbourhoodDetailPage = lazy(() => import('./components/pages/NeighbourhoodDetailPage'));
const AdminDashboard = lazy(() => import('./components/pages/AdminDashboard'));
function AppContent() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [pageContext, setPageContext] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
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

    // --- HOOKS ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setIsAuthReady(true);
            if (user) {
                setUserId(user.uid);
                trackEvent('user_login', { email: user.email });
            } else {
                setCurrentPage('home');
                setWatchedItems([]);
                setCartItems([]);
                trackEvent('user_logout');
            }
        });
        return () => unsubscribe();
    }, []);

    // Close categories menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isCategoriesMenuOpen && !event.target.closest('.categories-menu')) {
                setIsCategoriesMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCategoriesMenuOpen]);

    useEffect(() => {
        if (!currentUser) {
            setWatchedItems([]);
            return;
        }

        try {
            const watchlistRef = collection(db, "users", currentUser.uid, "watchlist");
            const unsubscribe = onSnapshot(watchlistRef, (snapshot) => {
                setWatchedItems(snapshot.docs.map(doc => doc.id));
            }, (error) => {
                console.error('Error loading watchlist:', error);
                setWatchedItems([]);
            });

            return () => {
                try {
                    unsubscribe();
                } catch (error) {
                    console.warn('Error cleaning up watchlist listener:', error);
                }
            };
        } catch (error) {
            console.error('Error setting up watchlist listener:', error);
            setWatchedItems([]);
        }
    }, [currentUser]);

    // --- HANDLERS ---
    const handleLogout = async () => {
        await signOut(auth);
        setIsProfileMenuOpen(false);
        showNotification("You've been logged out.", "info");
    };

    const handleNavigate = (page, context = {}) => {
        setCurrentPage(page);
        setPageContext(context);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        if (page !== 'item-detail') setSelectedItem(null);
        window.scrollTo(0, 0);

        // Track page navigation
        trackPageView(page, context);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        handleNavigate('item-detail');
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
        const keywords = searchQuery.toLowerCase().split(' ').filter(word => word.length > 2);

        // Track search
        trackEvent('search', {
            query: searchQuery,
            keywords: keywords.length,
            page: currentPage
        });

        handleNavigate('search-results', { keywords, originalQuery: searchQuery });
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
        // Remove item from cart if it was there
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== checkoutItem.id));
        // Optionally navigate to orders page
        handleNavigate('orders');
    };

    // --- RENDER LOGIC ---
    const renderPage = () => {
        if (!isAuthReady) return <FullPageLoader message="Connecting to TuiTrade..." />;

        const pageProps = {
            user: currentUser,
            onNavigate: handleNavigate,
            watchedItems,
            onWatchToggle: handleWatchToggle,
            onItemClick: handleItemClick,
            onAddToCart: handleAddToCart,
            onBuyNow: handleBuyNow,
            cartItems,
        };

        return (
            <Suspense fallback={<FullPageLoader message="Loading..." />}>
                {(() => {
                    switch (currentPage) {
                        case 'profile': return <ProfilePage {...pageProps} />;
                        case 'listings': return <MyListingsPage {...pageProps} />;
                        case 'watchlist': return <WatchlistPage {...pageProps} />;
                        case 'create-listing': return <CreateListingPage {...pageProps} />;
                        case 'seller-dashboard': return <SellerDashboard {...pageProps} />;
                        case 'seller-page': return <SellerPage {...pageProps} sellerId={pageContext.sellerId} />;
                        case 'item-detail':
                            return <ItemDetailPage {...pageProps} item={selectedItem} currentUser={currentUser} onContactSeller={handleContactSeller} isInCart={cartItems.some(cartItem => cartItem.id === selectedItem?.id)} />;
                        case 'category':
                            return <CategoryPage {...pageProps} categoryKey={pageContext.categoryKey} subcategoryKey={pageContext.subcategoryKey} />;
                        case 'search-results':
                            return <SearchResultsPage {...pageProps} searchParams={pageContext} />;
                        case 'messages':
                            return <MessagesPage {...pageProps} />;
                        case 'orders':
                            return <OrdersPage {...pageProps} />;

                        // Category Landing Pages
                        case 'marketplace-landing': return <MarketplaceLanding {...pageProps} />;
                        case 'motors-landing': return <MotorsLanding {...pageProps} />;
                        case 'real-estate-landing': return <RealEstateLanding {...pageProps} />;
                        case 'jobs-landing': return <JobsLanding {...pageProps} />;
                        case 'job-application': return <JobApplicationPage {...pageProps} job={pageContext.job} currentUser={currentUser} />;
                        case 'employer-dashboard': return <EmployerDashboard {...pageProps} currentUser={currentUser} />;
                        case 'create-job': return <CreateJobPage {...pageProps} currentUser={currentUser} />;
                        case 'job-seeker-profile': return <JobSeekerProfile {...pageProps} currentUser={currentUser} />;
                        case 'application-detail': return <ApplicationDetailPage {...pageProps} applicationId={pageContext.applicationId} currentUser={currentUser} />;
                        case 'applications-management': return <ApplicationsManagementPage {...pageProps} currentUser={currentUser} />;
                        case 'application-form-builder': return <ApplicationFormBuilder {...pageProps} jobId={pageContext.jobId} currentUser={currentUser} />;
                        case 'advanced-job-search': return <AdvancedJobSearch {...pageProps} currentUser={currentUser} />;
                        case 'analytics-dashboard': return <AnalyticsDashboard {...pageProps} currentUser={currentUser} />;
                        case 'digital-goods-landing': return <DigitalGoodsLanding {...pageProps} />;
                        case 'services-landing': return <ServicesLanding {...pageProps} />;
                        case 'used-goods-landing': return <UsedGoodsLanding {...pageProps} />;
                        case 'new-goods-landing': return <NewGoodsLanding {...pageProps} />;
                        case 'community-landing': return <CommunityLanding {...pageProps} />;
                        case 'neighbourhoods': return <NeighbourhoodsPage {...pageProps} currentUser={currentUser} />;
                        case 'neighbourhood-detail': return <NeighbourhoodDetailPage {...pageProps} neighbourhoodId={pageContext.id} currentUser={currentUser} />;

                        // Admin Dashboard (admin access only)
                        case 'admin': return <AdminDashboard {...pageProps} />;

                        // Support pages
                        case 'help-center':
                            return <HelpCenterPage {...pageProps} />;
                        case 'contact-us':
                            return <ContactUsPage {...pageProps} />;
                        case 'safety-tips':
                            return <SafetyTipsPage {...pageProps} />;
                        case 'terms-privacy':
                            return <TermsAndPrivacyPage {...pageProps} />;
                        case 'how-to-buy':
                            return <HowToBuyPage {...pageProps} />;
                        case 'payment-options':
                            return <PaymentOptionsPage {...pageProps} />;
                        case 'buyer-protection':
                            return <BuyerProtectionPage {...pageProps} />;
                        case 'shipping-info':
                            return <ShippingInfoPage {...pageProps} />;
                        case 'how-to-sell':
                            return <HowToSellPage {...pageProps} />;
                        case 'seller-fees':
                            return <SellerFeesPage {...pageProps} />;
                        case 'seller-tools':
                            return <SellerToolsPage {...pageProps} />;
                        case 'success-tips':
                            return <SuccessTipsPage {...pageProps} />;
                        default:
                            return <HomePage {...pageProps} />;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <AuthContext.Provider value={{ currentUser, isAuthReady }}>
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
                                    onClick={() => handleNavigate('home')}
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
                                        <div className="grid grid-cols-1 gap-1 p-2">
                                            <button
                                                onClick={() => { handleNavigate('marketplace-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <ShoppingCart size={16} className="mr-3 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">Marketplace</div>
                                                    <div className="text-xs text-gray-500">(Tauhokohoko)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('motors-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Car size={16} className="mr-3 text-red-500" />
                                                <div>
                                                    <div className="font-medium">Motors</div>
                                                    <div className="text-xs text-gray-500">(Waka)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('real-estate-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <HomeIcon size={16} className="mr-3 text-green-500" />
                                                <div>
                                                    <div className="font-medium">Property</div>
                                                    <div className="text-xs text-gray-500">(Kāinga)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('jobs-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Briefcase size={16} className="mr-3 text-purple-500" />
                                                <div>
                                                    <div className="font-medium">Jobs</div>
                                                    <div className="text-xs text-gray-500">(Mahi)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('digital-goods-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Gift size={16} className="mr-3 text-indigo-500" />
                                                <div>
                                                    <div className="font-medium">Digital Goods</div>
                                                    <div className="text-xs text-gray-500">(Taonga Matihiko)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('services-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Briefcase size={16} className="mr-3 text-teal-500" />
                                                <div>
                                                    <div className="font-medium">Services</div>
                                                    <div className="text-xs text-gray-500">(Ratonga)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('community-landing'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Gift size={16} className="mr-3 text-pink-500" />
                                                <div>
                                                    <div className="font-medium">Community</div>
                                                    <div className="text-xs text-gray-500">(Hapori)</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleNavigate('neighbourhoods'); setIsCategoriesMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <HomeIcon size={16} className="mr-3 text-orange-500" />
                                                <div>
                                                    <div className="font-medium">Neighbourhoods</div>
                                                    <div className="text-xs text-gray-500">(Taiao)</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 md:space-x-4">
                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className={`lg:hidden p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>

                                <button
                                    onClick={() => setIsTeReoMode(!isTeReoMode)}
                                    className={`p-2 transition-colors ${isTeReoMode ? 'text-green-600 bg-green-100' : isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'} rounded-lg`}
                                    title={isTeReoMode ? "Switch to English" : "Switch to Te Reo Māori"}
                                >
                                    <span className="text-sm font-semibold">{isTeReoMode ? 'MĀ' : 'EN'}</span>
                                </button>

                                <button
                                    onClick={toggleDarkMode}
                                    className={`p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                                </button>

                                <button
                                    onClick={() => currentUser ? handleNavigate('watchlist') : setIsAuthModalOpen(true)}
                                    className={`p-2 transition-colors relative group ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                >
                                    <Heart className="w-6 h-6" />
                                    {watchedItems.length > 0 && currentUser && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {watchedItems.length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setIsCartModalOpen(true)}
                                    className={`p-2 transition-colors relative group ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>

                                {currentUser ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className={`flex items-center space-x-2 p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                                        >
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {currentUser.email?.charAt(0).toUpperCase()}
                                            </div>
                                        </button>
                                        {isProfileMenuOpen && (
                                            <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1 z-50 ring-1 ring-opacity-5 animate-fade-in-up ${isDarkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-black'}`}>
                                                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Signed in as</p>
                                                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavigate('profile')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <User size={16} className="mr-3" />
                                                    My Profile
                                                    <span className="ml-2 text-xs text-gray-400">(Tō Pūkete)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('seller-dashboard')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <BarChart3 size={16} className="mr-3" />
                                                    Seller Dashboard
                                                    <span className="ml-2 text-xs text-gray-400">(Tauhokohoko)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('employer-dashboard')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <Briefcase size={16} className="mr-3" />
                                                    Employer Dashboard
                                                    <span className="ml-2 text-xs text-gray-400">(Kaimahi)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('job-seeker-profile')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <User size={16} className="mr-3" />
                                                    Job Seeker Profile
                                                    <span className="ml-2 text-xs text-gray-400">(Kaitiaki Mahi)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('listings')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <List size={16} className="mr-3" />
                                                    My Listings
                                                    <span className="ml-2 text-xs text-gray-400">(Āku Taonga)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('watchlist')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <Eye size={16} className="mr-3" />
                                                    Watchlist
                                                    <span className="ml-2 text-xs text-gray-400">(Mātakitaki)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('messages')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <MessageCircle size={16} className="mr-3" />
                                                    Messages
                                                    <span className="ml-2 text-xs text-gray-400">(Karere)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate('orders')}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <Package size={16} className="mr-3" />
                                                    Orders
                                                    <span className="ml-2 text-xs text-gray-400">(Ōta)</span>
                                                </button>
                                                <div className={`border-t my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                                                >
                                                    <Lock size={16} className="mr-3" />
                                                    Log Out
                                                    <span className="ml-2 text-xs text-gray-400">(Haere atu)</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="hidden md:inline-flex items-center bg-transparent text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors border border-green-600 font-semibold text-sm whitespace-nowrap"
                                    >
                                        <User size={18} className="mr-2" />
                                        Kia ora - Log In / Sign Up
                                    </button>
                                )}

                                <button
                                    onClick={() => currentUser ? handleNavigate('create-listing') : setIsAuthModalOpen(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-semibold flex items-center shadow-md text-sm whitespace-nowrap"
                                >
                                    <Tag size={18} className="mr-2" />
                                    <span className="hidden sm:inline">Hoko mai - List Item</span>
                                    <span className="sm:hidden">Hoko</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className={`lg:hidden shadow-lg border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="px-4 py-3 space-y-2">
                            <button
                                onClick={() => handleNavigate('marketplace-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Marketplace
                                <span className="ml-2 text-xs text-gray-400">(Tauhokohoko)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('motors-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Motors
                                <span className="ml-2 text-xs text-gray-400">(Waka)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('real-estate-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Property
                                <span className="ml-2 text-xs text-gray-400">(Kāinga)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('jobs-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Jobs
                                <span className="ml-2 text-xs text-gray-400">(Mahi)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('digital-goods-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Digital Goods
                                <span className="ml-2 text-xs text-gray-400">(Taonga Matihiko)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('services-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Services
                                <span className="ml-2 text-xs text-gray-400">(Ratonga)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('community-landing')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Community
                                <span className="ml-2 text-xs text-gray-400">(Hapori)</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('neighbourhoods')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Neighbourhoods
                                <span className="ml-2 text-xs text-gray-400">(Taiao)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Main Content --- */}
                <main className="flex-grow flex flex-col pb-20 lg:pb-0">
                    {renderPage()}
                </main>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    watchedItemsCount={watchedItems.length}
                    cartItemsCount={cartItems.length}
                    currentUser={currentUser}
                    onAuthClick={() => setIsAuthModalOpen(true)}
                />

                {/* --- Footer --- */}
                <footer className={`text-white ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-3 shadow-md">
                                        <span className="text-white font-bold text-xl">T</span>
                                    </div>
                                    <h3 className="text-xl font-bold">TuiTrade</h3>
                                </div>
                                <p className="text-gray-400">
                                    Aotearoa's most beautiful marketplace. Trade the Kiwi way.
                                </p>
                                <p className="text-gray-500 text-sm mt-2 italic">
                                    He taonga tuku iho - A treasure passed down
                                </p>
                                <p className="text-gray-500 text-xs mt-1 italic">
                                    Whānau friendly, locally owned - e noho rā!
                                </p>
                                <p className="text-gray-500 text-xs mt-1 italic">
                                    Kia kaha, kia maia, kia manawanui - Be strong, be brave, be steadfast
                                </p>
                                <div className="mt-4 flex space-x-4">
                                    <Shield className="text-green-500" size={24} />
                                    <Star className="text-yellow-500" size={24} />
                                    <MessageCircle className="text-blue-500" size={24} />
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4 text-green-400">For Buyers</h4>
                                <p className="text-gray-500 text-xs mb-3 italic">(Mō ngā Kaihoko)</p>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button onClick={() => handleNavigate('how-to-buy')} className="hover:text-white transition-colors">How to Buy</button></li>
                                    <li><button onClick={() => handleNavigate('payment-options')} className="hover:text-white transition-colors">Payment Options</button></li>
                                    <li><button onClick={() => handleNavigate('buyer-protection')} className="hover:text-white transition-colors">Buyer Protection</button></li>
                                    <li><button onClick={() => handleNavigate('shipping-info')} className="hover:text-white transition-colors">Shipping Info</button></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4 text-green-400">For Sellers</h4>
                                <p className="text-gray-500 text-xs mb-3 italic">(Mō ngā Kaihoko)</p>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button onClick={() => handleNavigate('how-to-sell')} className="hover:text-white transition-colors">How to Sell</button></li>
                                    <li><button onClick={() => handleNavigate('seller-fees')} className="hover:text-white transition-colors">Seller Fees</button></li>
                                    <li><button onClick={() => handleNavigate('seller-tools')} className="hover:text-white transition-colors">Seller Tools</button></li>
                                    <li><button onClick={() => handleNavigate('success-tips')} className="hover:text-white transition-colors">Success Tips</button></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4 text-green-400">Support & Info</h4>
                                <p className="text-gray-500 text-xs mb-3 italic">(Tautoko & Mōhiohio)</p>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button onClick={() => handleNavigate('help-center')} className="hover:text-white transition-colors">Help Center</button></li>
                                    <li><button onClick={() => handleNavigate('contact-us')} className="hover:text-white transition-colors">Contact Us</button></li>
                                    <li><button onClick={() => handleNavigate('safety-tips')} className="hover:text-white transition-colors">Safety Tips</button></li>
                                    <li><button onClick={() => handleNavigate('terms-privacy')} className="hover:text-white transition-colors">Terms & Privacy</button></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 mt-8 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <p className="text-gray-400 text-sm">
                                    &copy; 2025 TuiTrade. Made with ❤️ in Aotearoa New Zealand.
                                </p>
                                <p className="text-gray-500 text-xs mt-1 italic">
                                    Kia ora, e hoa! - Hello, friend!
                                </p>
                                <p className="text-gray-500 text-xs italic">
                                    He aha te mea nui o te ao? He tangata, he tangata, he tangata!
                                </p>
                                <p className="text-gray-400 text-sm mt-4 md:mt-0">
                                    Building a better marketplace for Kiwis, by Kiwis.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </AuthContext.Provider>
    );
}

// This is the final export, wrapping the app in the NotificationProvider and ThemeProvider
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
