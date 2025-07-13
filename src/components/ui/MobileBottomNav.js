// Mobile Bottom Navigation Component
// Provides quick access to key features on mobile devices

import React from 'react';
import {
    Home,
    Search,
    Heart,
    ShoppingCart,
    User,
    Plus,
    Briefcase,
    MapPin
} from 'lucide-react';
import { useTeReo, TeReoText } from './TeReoToggle';

const MobileBottomNav = ({
    currentPage,
    onNavigate,
    watchedItemsCount = 0,
    cartItemsCount = 0,
    currentUser,
    onAuthClick
}) => {
    const { getText } = useTeReo();

    const navItems = [
        {
            id: 'home',
            icon: Home,
            label: getText('home', 'home'),
            teReoLabel: 'Kāinga',
            onClick: () => onNavigate('home')
        },
        {
            id: 'search',
            icon: Search,
            label: getText('search', 'search'),
            teReoLabel: 'Rapua',
            onClick: () => onNavigate('search-results', { keywords: '', originalQuery: '' })
        },
        {
            id: 'categories',
            icon: Briefcase,
            label: getText('categories', 'categories'),
            teReoLabel: 'Kāwai',
            onClick: () => onNavigate('marketplace-landing')
        },
        {
            id: 'watchlist',
            icon: Heart,
            label: getText('watchlist', 'watchlist'),
            teReoLabel: 'Mātakitaki',
            onClick: () => currentUser ? onNavigate('watchlist') : onAuthClick(),
            badge: watchedItemsCount
        },
        {
            id: 'cart',
            icon: ShoppingCart,
            label: getText('cart', 'cart'),
            teReoLabel: 'Kāta',
            onClick: () => onNavigate('cart'),
            badge: cartItemsCount
        }
    ];

    const isActive = (itemId) => {
        if (itemId === 'home' && currentPage === 'home') return true;
        if (itemId === 'search' && currentPage === 'search-results') return true;
        if (itemId === 'categories' && currentPage.includes('landing')) return true;
        if (itemId === 'watchlist' && currentPage === 'watchlist') return true;
        if (itemId === 'cart' && currentPage === 'cart') return true;
        return false;
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${active
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={20} />
                                {item.badge > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium mt-1 leading-tight">
                                {item.label}
                            </span>
                            <span className="text-xs text-gray-400 leading-tight">
                                {item.teReoLabel}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Quick Action Button */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <button
                    onClick={() => currentUser ? onNavigate('create-listing') : onAuthClick()}
                    className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all transform hover:scale-110"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>
    );
};

export default MobileBottomNav; 