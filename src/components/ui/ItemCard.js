// src/components/ui/ItemCard.js
import React, { memo, useMemo, useCallback } from 'react';
import { Heart, MapPin, User, Download, Zap } from 'lucide-react';
import { formatPrice, timeAgo } from '../../lib/utils';

const ItemCard = memo(({ item, isWatched, onWatchToggle, onItemClick, onAddToCart, onBuyNow, isInCart, viewMode = 'grid', onNavigate }) => {
    const createdDate = useMemo(() =>
        item.createdAt?.toDate ? item.createdAt.toDate() : new Date()
        , [item.createdAt]);

    const handleWatchToggle = useCallback((e) => {
        e.stopPropagation();
        onWatchToggle(item.id);
    }, [item.id, onWatchToggle]);

    const handleItemClick = useCallback(() => {
        onItemClick(item);
    }, [item, onItemClick]);

    const formattedPrice = useMemo(() => formatPrice(item.price), [item.price]);
    const timeAgoText = useMemo(() => timeAgo(createdDate), [createdDate]);
    const sellerName = useMemo(() =>
        item.userEmail ? item.userEmail.split('@')[0] : ''
        , [item.userEmail]);

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={handleItemClick}>
                <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0">
                        <img
                            src={item.imageUrl || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=TuiTrade'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {item.location}
                            </span>
                            <span>{timeAgoText}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Modern TuiTrade card with carousel-quality design
    return (
        <div className="group cursor-pointer" onClick={handleItemClick}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200">
                <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                        src={item.imageUrl || 'https://placehold.co/320x400/f8fafc/64748b?text=TuiTrade+Item'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                    />

                    {/* Elegant gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Top badges row */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        {/* Item type badge */}
                        <div className="flex gap-2">
                            {item.isDigital ? (
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center shadow-lg backdrop-blur-sm">
                                    <Download size={12} className="mr-1.5" />
                                    Digital
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-lg backdrop-blur-sm">
                                    Buy Now
                                </div>
                            )}
                        </div>

                        {/* Watch button */}
                        <button
                            onClick={handleWatchToggle}
                            className={`p-2.5 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                                isWatched 
                                    ? 'bg-red-500 text-white hover:bg-red-600 scale-110' 
                                    : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                            }`}
                        >
                            <Heart size={16} fill={isWatched ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    {/* Bottom content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="text-white">
                            <h4 className="font-bold text-lg mb-2 line-clamp-2 text-shadow">{item.title}</h4>
                            
                            {/* Price and stats row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                    <p className="text-xl font-bold text-white">{formattedPrice}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-sm text-white/90 mb-1">
                                        <Heart size={12} className="mr-1 text-red-400" />
                                        {item.watchCount || 0}
                                    </div>
                                    <div className="text-xs text-white/70">
                                        {item.views || 0} views
                                    </div>
                                </div>
                            </div>

                            {/* Location and time row */}
                            <div className="flex items-center justify-between text-xs text-white/90">
                                <span className="flex items-center bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                                    <MapPin size={10} className="mr-1" />
                                    {item.location}
                                </span>
                                <span className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                                    {timeAgoText}
                                </span>
                            </div>

                            {/* Seller info */}
                            {sellerName && (
                                <div className="mt-2 flex items-center text-xs text-white/80">
                                    <User size={10} className="mr-1" />
                                    <span className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                                        {sellerName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover action overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <span className="text-gray-800 font-semibold text-sm flex items-center">
                                <User size={14} className="mr-2 text-green-600" />
                                View Details
                            </span>
                        </div>
                    </div>
                </div>

                {/* Digital goods additional info */}
                {item.isDigital && (
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-t border-purple-200">
                        <div className="flex items-center justify-between text-xs text-purple-700">
                            <span className="flex items-center font-medium">
                                <Zap size={12} className="mr-1" />
                                {item.deliveryMethod === 'instant' ? 'Instant Delivery' :
                                    item.deliveryMethod === 'email' ? 'Email Delivery' : 'Download Link'}
                            </span>
                            <span className="font-medium">
                                {item.licenseType === 'single-use' ? 'Single Use' : 'Perpetual'} License
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for performance optimization
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.price === nextProps.item.price &&
        prevProps.item.title === nextProps.item.title &&
        prevProps.item.imageUrl === nextProps.item.imageUrl &&
        prevProps.isWatched === nextProps.isWatched &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.isInCart === nextProps.isInCart
    );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;