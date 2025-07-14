// src/Router.js
import React, { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy load page components for better performance
const HomePage = lazy(() => import('./components/pages/HomePage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const ProfileManager = lazy(() => import('./components/pages/ProfileManager'));
const EnhancedProfilePage = lazy(() => import('./components/pages/EnhancedProfilePage'));
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

// Landing Pages
const MarketplaceLanding = lazy(() => import('./components/pages/MarketplaceLanding'));
const MotorsLanding = lazy(() => import('./components/pages/MotorsLanding'));
const RealEstateLanding = lazy(() => import('./components/pages/RealEstateLanding'));
const JobsLanding = lazy(() => import('./components/pages/JobsLanding'));
const DigitalGoodsLanding = lazy(() => import('./components/pages/DigitalGoodsLanding'));
const ServicesLanding = lazy(() => import('./components/pages/ServicesLanding'));
const UsedGoodsLanding = lazy(() => import('./components/pages/UsedGoodsLanding'));
const NewGoodsLanding = lazy(() => import('./components/pages/NewGoodsLanding'));
const CommunityLanding = lazy(() => import('./components/pages/CommunityLanding'));

// Job Pages  
const JobApplicationPage = lazy(() => import('./components/pages/JobApplicationPage'));
const EmployerDashboard = lazy(() => import('./components/pages/EmployerDashboard'));
const CreateJobPage = lazy(() => import('./components/pages/CreateJobPage'));
const JobSeekerProfile = lazy(() => import('./components/pages/JobSeekerProfile'));
const ApplicationDetailPage = lazy(() => import('./components/pages/ApplicationDetailPage'));
const ApplicationsManagementPage = lazy(() => import('./components/pages/ApplicationsManagementPage'));
const ApplicationFormBuilder = lazy(() => import('./components/pages/ApplicationFormBuilder'));
const AdvancedJobSearch = lazy(() => import('./components/pages/AdvancedJobSearch'));
const AnalyticsDashboard = lazy(() => import('./components/pages/AnalyticsDashboard'));

// Enhanced Profile & Social Pages
const UserProfile = lazy(() => import('./components/pages/UserProfile'));

// Support Pages
const HelpCenterPage = lazy(() => import('./components/pages/HelpCenterPage'));
const ContactUsPage = lazy(() => import('./components/pages/ContactUsPage'));
const SafetyTipsPage = lazy(() => import('./components/pages/SafetyTipsPage'));
const HowToBuyPage = lazy(() => import('./components/pages/HowToBuyPage'));
const PaymentOptionsPage = lazy(() => import('./components/pages/PaymentOptionsPage'));
const BuyerProtectionPage = lazy(() => import('./components/pages/BuyerProtectionPage'));
const ShippingInfoPage = lazy(() => import('./components/pages/ShippingInfoPage'));
const HowToSellPage = lazy(() => import('./components/pages/HowToSellPage'));
const SellerFeesPage = lazy(() => import('./components/pages/SellerFeesPage'));
const SellerToolsPage = lazy(() => import('./components/pages/SellerToolsPage'));
const SuccessTipsPage = lazy(() => import('./components/pages/SuccessTipsPage'));

// Admin and Community Pages
const NeighbourhoodsPage = lazy(() => import('./components/pages/NeighbourhoodsPage'));
const NeighbourhoodDetailPage = lazy(() => import('./components/pages/NeighbourhoodDetailPage'));
const AdminDashboard = lazy(() => import('./components/pages/AdminDashboard'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorBoundary />,
        children: [
            // Main Pages
            { index: true, element: <HomePage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profiles', element: <ProfileManager /> },
            { path: 'enhanced-profile', element: <EnhancedProfilePage /> },
            { path: 'my-listings', element: <MyListingsPage /> },
            { path: 'watchlist', element: <WatchlistPage /> },
            { path: 'create-listing', element: <CreateListingPage /> },
            { path: 'item/:itemId', element: <ItemDetailPage /> },
            { path: 'category/:categoryKey', element: <CategoryPage /> },
            { path: 'category/:categoryKey/:subcategoryKey', element: <CategoryPage /> },
            { path: 'search', element: <SearchResultsPage /> },
            { path: 'messages', element: <MessagesPage /> },
            { path: 'orders', element: <OrdersPage /> },
            { path: 'seller-dashboard', element: <SellerDashboard /> },
            { path: 'seller/:sellerId', element: <SellerPage /> },

            // Landing Pages
            { path: 'marketplace', element: <MarketplaceLanding /> },
            { path: 'motors', element: <MotorsLanding /> },
            { path: 'real-estate', element: <RealEstateLanding /> },
            { path: 'jobs', element: <JobsLanding /> },
            { path: 'digital-goods', element: <DigitalGoodsLanding /> },
            { path: 'services', element: <ServicesLanding /> },
            { path: 'used-goods', element: <UsedGoodsLanding /> },
            { path: 'new-goods', element: <NewGoodsLanding /> },
            { path: 'community', element: <CommunityLanding /> },

            // Job-specific Routes
            { path: 'job-application/:jobId', element: <JobApplicationPage /> },
            { path: 'employer-dashboard', element: <EmployerDashboard /> },
            { path: 'create-job', element: <CreateJobPage /> },
            { path: 'job-seeker-profile', element: <JobSeekerProfile /> },
            { path: 'application/:applicationId', element: <ApplicationDetailPage /> },
            { path: 'applications-management', element: <ApplicationsManagementPage /> },
            { path: 'application-form-builder/:jobId', element: <ApplicationFormBuilder /> },
            { path: 'advanced-job-search', element: <AdvancedJobSearch /> },
            { path: 'analytics-dashboard', element: <AnalyticsDashboard /> },

            // Enhanced Social & Community Routes
            { path: 'user-profile/:userId', element: <UserProfile /> },
            { path: 'social-profile', element: <UserProfile /> },

            // Support Pages
            { path: 'help', element: <HelpCenterPage /> },
            { path: 'contact', element: <ContactUsPage /> },
            { path: 'safety', element: <SafetyTipsPage /> },
            { path: 'terms-privacy', element: <TermsAndPrivacyPage /> },
            { path: 'how-to-buy', element: <HowToBuyPage /> },
            { path: 'payment-options', element: <PaymentOptionsPage /> },
            { path: 'buyer-protection', element: <BuyerProtectionPage /> },
            { path: 'shipping-info', element: <ShippingInfoPage /> },
            { path: 'how-to-sell', element: <HowToSellPage /> },
            { path: 'seller-fees', element: <SellerFeesPage /> },
            { path: 'seller-tools', element: <SellerToolsPage /> },
            { path: 'success-tips', element: <SuccessTipsPage /> },

            // Community & Admin
            { path: 'neighbourhoods', element: <NeighbourhoodsPage /> },
            { path: 'neighbourhood/:neighbourhoodId', element: <NeighbourhoodDetailPage /> },
            { path: 'admin', element: <AdminDashboard /> },
        ],
    },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
