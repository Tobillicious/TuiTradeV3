// src/components/pages/ItemDetailPage.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatPrice, timeAgo, CATEGORIES } from '../../lib/utils';
import { FullPageLoader } from '../ui/Loaders';
import { Heart, ShoppingCart, MessageCircle, MapPin, Calendar, Eye, Shield, Home, ChevronRight } from 'lucide-react';
import { StarRating, ReviewList } from '../ui/ReviewSystem';
import { AuctionInterface } from '../ui/AuctionSystem';

const ItemDetailPage = ({ item, onNavigate, onWatchToggle, watchedItems, onContactSeller, onAddToCart, isInCart }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [sellerRating, setSellerRating] = useState({ average: 0, count: 0 });

    useEffect(() => {
        if (!item) return;

        const updateViews = async () => {
            try {
                await updateDoc(doc(db, 'listings', item.id), {
                    views: increment(1)
                });
            } catch (error) {
                console.error('Error updating views:', error);
            }
        };

        const fetchSellerRating = async () => {
            try {
                const sellerDoc = await getDoc(doc(db, 'users', item.userId));
                if (sellerDoc.exists()) {
                    const data = sellerDoc.data();
                    setSellerRating(data.rating || { average: 0, count: 0 });
                }
            } catch (error) {
                console.error('Error fetching seller rating:', error);
            }
        };

        updateViews();
        fetchSellerRating();
    }, [item]);

    if (!item) return <FullPageLoader message="Loading item..." />;

    const isWatched = watchedItems.includes(item.id);
    const images = item.images || [item.imageUrl];
    const createdDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
    const CategoryIcon = CATEGORIES[item.category]?.icon;

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <button
                        onClick={() => onNavigate('category', { categoryKey: item.category })}
                        className="hover:text-green-600"
                    >
                        {CATEGORIES[item.category]?.name}
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">{item.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Images Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                <img
                                    src={images[activeImageIndex] || 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=TuiTrade'}
                                    alt={item.title}
                                    className="w-full h-96 lg:h-[500px] object-contain bg-gray-100"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                        >
                                            <ChevronRight size={24} className="rotate-180" />
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`flex-shrink-0 ${activeImageIndex === index ? 'ring-2 ring-green-600' : ''
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${item.title} ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                            <h2 className="text-xl font-bold mb-4">Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {item.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Auction or Fixed Price */}
                        {item.listingType === 'auction' ? (
                            <AuctionInterface auction={item} />
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="mb-6">
                                    <p className="text-3xl font-bold text-green-600 mb-2">{formatPrice(item.price)}</p>
                                    {item.condition && (
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${item.condition === 'New' ? 'bg-green-100 text-green-800' :
                                                item.condition === 'Used - Like New' ? 'bg-blue-100 text-blue-800' :
                                                    item.condition === 'Used - Good' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-orange-100 text-orange-800'
                                            }`}>
                                            {item.condition}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => onContactSeller(item)}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                                    >
                                        <MessageCircle size={20} className="mr-2" />
                                        Contact Seller
                                    </button>

                                    <button
                                        onClick={() => onAddToCart(item)}
                                        disabled={isInCart}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${isInCart
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        <ShoppingCart size={20} className="mr-2" />
                                        {isInCart ? 'In Cart' : 'Add to Cart'}
                                    </button>

                                    <button
                                        onClick={() => onWatchToggle(item.id)}
                                        className={`w-full py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center ${isWatched
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        <Heart size={20} fill={isWatched ? 'currentColor' : 'none'} className="mr-2" />
                                        {isWatched ? 'Watching' : 'Add to Watchlist'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Item Details */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold mb-4">Item Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <MapPin size={16} className="text-gray-400 mr-2" />
                                    <span className="text-gray-600">Location:</span>
                                    <span className="ml-auto font-medium">{item.location}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Calendar size={16} className="text-gray-400 mr-2" />
                                    <span className="text-gray-600">Listed:</span>
                                    <span className="ml-auto font-medium">{timeAgo(createdDate)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Eye size={16} className="text-gray-400 mr-2" />
                                    <span className="text-gray-600">Views:</span>
                                    <span className="ml-auto font-medium">{item.views || 0}</span>
                                </div>
                                {CategoryIcon && (
                                    <div className="flex items-center text-sm">
                                        <CategoryIcon size={16} className="text-gray-400 mr-2" />
                                        <span className="text-gray-600">Category:</span>
                                        <span className="ml-auto font-medium">{CATEGORIES[item.category]?.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold mb-4">Seller Information</h3>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {item.userEmail?.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium">{item.userEmail?.split('@')[0]}</p>
                                    <div className="flex items-center space-x-2">
                                        <StarRating rating={sellerRating.average} size="small" />
                                        <span className="text-sm text-gray-500">
                                            {sellerRating.count > 0
                                                ? `${sellerRating.average} (${sellerRating.count} review${sellerRating.count !== 1 ? 's' : ''})`
                                                : 'New seller'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-green-600">
                                <Shield size={14} className="mr-1" />
                                <span>Verified account</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Reviews Section */}
                <div className="mt-12">
                    <ReviewList sellerId={item.userId} showForm={true} />
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;