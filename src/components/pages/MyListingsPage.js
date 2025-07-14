// src/components/pages/MyListingsPage.js
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FullPageLoader } from '../ui/Loaders';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Plus, Package, RefreshCw } from 'lucide-react';

const MyListingsPage = ({ onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [deletingId, setDeletingId] = useState(null);

    // Function to refresh listings
    const refreshListings = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Auto refresh when page is visited
    useEffect(() => {
        // Refresh listings when component mounts
        refreshListings();
    }, []);

    useEffect(() => {
        const fetchMyListings = async () => {
            if (!currentUser) return;

            setIsLoading(true);
            try {
                console.log('Fetching listings for user:', currentUser.uid);

                // Fetch from both listings and auctions collections
                const promises = [];

                // Regular listings
                const listingsRef = collection(db, 'listings');
                const listingsQuery = query(
                    listingsRef,
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc')
                );
                promises.push(getDocs(listingsQuery));

                // Auction listings
                const auctionsRef = collection(db, 'auctions');
                const auctionsQuery = query(
                    auctionsRef,
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc')
                );
                promises.push(getDocs(auctionsQuery));

                const [listingsSnapshot, auctionsSnapshot] = await Promise.all(promises);

                console.log('Regular listings found:', listingsSnapshot.docs.length);
                console.log('Auction listings found:', auctionsSnapshot.docs.length);

                const regularListings = listingsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    listingType: doc.data().listingType || 'fixed-price'
                }));

                const auctionListings = auctionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    endTime: doc.data().endTime?.toDate(),
                    listingType: 'auction'
                }));

                // Combine and sort all listings
                const allListings = [...regularListings, ...auctionListings].sort((a, b) => b.createdAt - a.createdAt);
                console.log('Total listings:', allListings.length);
                setListings(allListings);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyListings();
    }, [currentUser, refreshTrigger]);

    const handleEdit = (item) => {
        onNavigate('create-listing', { editItem: item });
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        setDeletingId(item.id);
        try {
            const collectionName = item.listingType === 'auction' ? 'auctions' : 'listings';
            await deleteDoc(doc(db, collectionName, item.id));
            showNotification('Listing deleted.', 'success');
            refreshListings();
        } catch (err) {
            showNotification('Failed to delete listing.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return <FullPageLoader message="Loading your listings..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                    <p className="text-gray-600">Manage your items for sale</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={refreshListings}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Refresh
                    </button>
                    <button
                        onClick={() => onNavigate('create-listing')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Listing
                    </button>
                </div>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">You haven't created any listings yet</p>
                    <p className="text-gray-400 mb-6">Start selling by creating your first listing</p>
                    <button
                        onClick={() => onNavigate('create-listing')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map(item => (
                        <div key={item.id} className="relative group">
                            {item.listingType === 'auction' ? (
                                <AuctionCard
                                    auction={item}
                                    onItemClick={onItemClick}
                                    onWatchToggle={onWatchToggle}
                                    watchedItems={watchedItems}
                                    onNavigate={onNavigate}
                                />
                            ) : (
                                <ItemCard
                                    item={item}
                                    isWatched={watchedItems?.includes(item.id) || false}
                                    onWatchToggle={onWatchToggle}
                                    onItemClick={onItemClick}
                                    onAddToCart={onAddToCart}
                                    isInCart={cartItems?.some(cartItem => cartItem.id === item.id) || false}
                                    onNavigate={onNavigate}
                                />
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.id}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListingsPage;