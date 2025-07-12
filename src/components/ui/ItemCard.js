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

    // Professional auction-style feed card
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100" onClick={handleItemClick}>
            <div className="relative aspect-[4/5]">
                <img
                    src={item.imageUrl || 'https://placehold.co/320x400/f8fafc/64748b?text=TuiTrade+Item'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Professional overlay elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Digital Goods Badge */}
                {item.isDigital && (
                    <div className="absolute top-2 left-2">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center">
                            <Download size={10} className="mr-1" />
                            Digital
                        </div>
                    </div>
                )}

                {/* Watch button */}
                <div className="absolute top-2 right-2">
                    <button
                        onClick={handleWatchToggle}
                        className={`p-2 rounded-full transition-all shadow-lg ${isWatched ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'}`}
                    >
                        <Heart size={14} fill={isWatched ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Item type badge */}
                <div className="absolute top-2 left-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide">
                        Buy Now
                    </div>
                </div>

                {/* Professional info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-white">
                        <h4 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h4>

                        {/* Price and activity */}
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-2xl font-bold">{formattedPrice}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-white/80 mb-1">Activity</div>
                                <div className="flex items-center text-sm font-semibold">
                                    <Heart size={12} className="mr-1 text-red-400" />
                                    {item.watchCount || 0} watching
                                </div>
                            </div>
                        </div>

                        {/* Time and views */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                {timeAgoText}
                            </span>
                            <span className="text-xs text-white/80">
                                {item.views || 0} views
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/90">
                            <span className="flex items-center">
                                <MapPin size={10} className="mr-1" />
                                {item.location}
                            </span>
                            {sellerName && (
                                <span className="flex items-center">
                                    <User size={10} className="mr-1" />
                                    {sellerName}
                                </span>
                            )}
                        </div>

                        {/* Digital Goods Info */}
                        {item.isDigital && (
                            <div className="flex items-center justify-between text-xs text-white/90 mt-1">
                                <span className="flex items-center text-purple-300">
                                    <Zap size={10} className="mr-1" />
                                    {item.deliveryMethod === 'instant' ? 'Instant Delivery' :
                                        item.deliveryMethod === 'email' ? 'Email Delivery' : 'Download Link'}
                                </span>
                                <span className="text-purple-300">
                                    {item.licenseType === 'single-use' ? 'Single Use' : 'Perpetual'} License
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hover action hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl">
                        <span className="text-gray-800 font-semibold text-sm">View Details</span>
                    </div>
                </div>
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