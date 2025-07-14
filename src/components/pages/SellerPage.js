import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAppContext } from '../../context/AppContext';
import { FullPageLoader } from '../ui/Loaders';
import { StarRating, ReviewList } from '../ui/ReviewSystem';
import ItemCard from '../ui/ItemCard';

const SellerPage = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const { onWatchToggle, watchedItems = [], onAddToCart, cartItems = [] } = useAppContext() || {};
    
    const handleItemClick = (item) => {
        navigate(`/item/${item.id}`);
    };
    const [seller, setSeller] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sellerId) {
            setLoading(false);
            return;
        }

        const fetchSellerData = async () => {
            setLoading(true);
            try {
                // Fetch seller profile
                const sellerDoc = await getDoc(doc(db, 'users', sellerId));
                if (sellerDoc.exists()) {
                    setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
                }

                // Fetch seller's listings
                const listingsQuery = query(collection(db, 'listings'), where('userId', '==', sellerId));
                const listingsSnapshot = await getDocs(listingsQuery);
                const sellerListings = listingsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setListings(sellerListings);

            } catch (error) {
                console.error("Error fetching seller data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [sellerId]);

    if (loading) return <FullPageLoader message="Loading seller's page..." />;
    if (!seller) return <div>Seller not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mr-6">
                        {seller.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{seller.profile?.displayName || seller.email.split('@')[0]}</h1>
                        <div className="flex items-center mt-2">
                            <StarRating rating={seller.rating?.average || 0} size="default" />
                            <span className="ml-2 text-gray-600">({seller.rating?.count || 0} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Listings from this seller ({listings.length})</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {listings.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        isWatched={watchedItems?.includes(item.id) || false}
                        onWatchToggle={onWatchToggle}
                        onItemClick={handleItemClick}
                        onAddToCart={onAddToCart}
                        isInCart={cartItems?.some(cartItem => cartItem.id === item.id) || false}
                    />
                ))}
            </div>

            <div className="mt-12">
                <ReviewList sellerId={sellerId} />
            </div>
        </div>
    );
};

export default SellerPage;