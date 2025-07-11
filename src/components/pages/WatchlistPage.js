// src/components/pages/WatchlistPage.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../ui/Loaders';
import ItemCard from '../ui/ItemCard';
import { Eye, Home, ChevronRight } from 'lucide-react';

const WatchlistPage = ({ onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const [watchedListings, setWatchedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchWatchedListings = async () => {
            if (!currentUser || watchedItems.length === 0) {
                setLoading(false);
                setWatchedListings([]);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, 'listings'),
                    where('__name__', 'in', watchedItems)
                );
                const querySnapshot = await getDocs(q);
                const listingsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setWatchedListings(listingsData);
            } catch (error) {
                console.error('Error fetching watchlist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchedListings();
    }, [currentUser, watchedItems]);

    if (loading) return <FullPageLoader message="Loading your watchlist..." />;

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">My Watchlist</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Watchlist</h1>

                {watchedListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {watchedListings.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                isWatched={true}
                                onWatchToggle={onWatchToggle}
                                onItemClick={onItemClick}
                                onAddToCart={onAddToCart}
                                isInCart={cartItems.some(cartItem => cartItem.id === item.id)}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">Your watchlist is empty</p>
                        <p className="text-gray-400 mb-6">Click the heart icon on any item to add it here</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Browse Items
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;