// src/components/ui/AuctionSystem.js
import { useState, useEffect } from 'react';
import { collection, query, orderBy, addDoc, doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice, timeAgo } from '../../lib/utils';
import { Clock, Gavel, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle, Trophy, Heart, User, MapPin } from 'lucide-react';

const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();
            const difference = end - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                if (days > 0) {
                    setTimeLeft(`${days}d ${hours}h ${minutes}m`);
                } else if (hours > 0) {
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    setTimeLeft(`${minutes}m ${seconds}s`);
                }
                setIsExpired(false);
            } else {
                setTimeLeft('Auction ended');
                setIsExpired(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className={`flex items-center space-x-2 ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
            <Clock size={16} />
            <span className="font-medium">{timeLeft}</span>
        </div>
    );
};

const BidHistory = ({ auctionId }) => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auctionId) {
            setLoading(false);
            return;
        }

        try {
            const bidsRef = collection(db, 'auctions', auctionId, 'bids');
            const q = query(bidsRef, orderBy('amount', 'desc'), orderBy('createdAt', 'desc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const bidData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setBids(bidData);
                setLoading(false);
            }, (error) => {
                console.error('Error loading bid history:', error);
                setLoading(false);
            });

            return () => {
                try {
                    unsubscribe();
                } catch (error) {
                    console.warn('Error cleaning up bid history listener:', error);
                }
            };
        } catch (error) {
            console.error('Error setting up bid history listener:', error);
            setLoading(false);
        }
    }, [auctionId]);

    if (loading) {
        return <div className="text-center text-gray-500">Loading bid history...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Bid History
            </h3>
            {bids.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bids yet. Be the first to bid!</p>
            ) : (
                <div className="space-y-3">
                    {bids.map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index === 0 ? <Trophy size={16} /> : index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{bid.bidderEmail?.split('@')[0] || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-500">{bid.createdAt ? timeAgo(bid.createdAt) : 'Just now'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-green-600">{formatPrice(bid.amount)}</p>
                                {index === 0 && (
                                    <p className="text-xs text-green-600 font-medium">Highest bid</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AuctionInterface = ({ auction, onBidPlaced }) => {
    const [bidAmount, setBidAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [minBid, setMinBid] = useState(0);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const isOwner = currentUser?.uid === auction.userId;
    const isAuctionEnded = new Date() > new Date(auction.endTime);
    const currentBid = auction.currentBid || auction.startingBid;

    useEffect(() => {
        const calculateMinBid = () => {
            const increment = auction.bidIncrement || 1;
            return currentBid + increment;
        };
        setMinBid(calculateMinBid());
        setBidAmount(calculateMinBid().toString());
    }, [currentBid, auction.bidIncrement]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showNotification('Please log in to place a bid', 'error');
            return;
        }

        if (isOwner) {
            showNotification('You cannot bid on your own auction', 'error');
            return;
        }

        if (isAuctionEnded) {
            showNotification('This auction has ended', 'error');
            return;
        }

        const amount = parseFloat(bidAmount);
        if (amount < minBid) {
            showNotification(`Minimum bid is ${formatPrice(minBid)}`, 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Add bid to subcollection
            const bidsRef = collection(db, 'auctions', auction.id, 'bids');
            await addDoc(bidsRef, {
                amount,
                bidderEmail: currentUser.email,
                bidderId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            // Update auction current bid
            await updateDoc(doc(db, 'auctions', auction.id), {
                currentBid: amount,
                bidCount: (auction.bidCount || 0) + 1,
                currentWinner: currentUser.uid,
                currentWinnerEmail: currentUser.email
            });

            showNotification('Bid placed successfully!', 'success');
            onBidPlaced && onBidPlaced(amount);
        } catch (error) {
            console.error('Error placing bid:', error);
            showNotification('Failed to place bid. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Current Auction Status</h3>
                    <CountdownTimer endTime={auction.endTime} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Current highest bid</p>
                        <p className="text-2xl font-bold text-green-600">{formatPrice(currentBid)}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">{auction.bidCount || 0} bids</p>
                        <p className="text-lg font-semibold text-blue-600">
                            Next minimum bid: {formatPrice(minBid)}
                        </p>
                    </div>
                </div>

                {auction.reservePrice && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                            <strong>Reserve:</strong> {formatPrice(auction.reservePrice)}
                            {currentBid >= auction.reservePrice && (
                                <span className="ml-2 text-green-600">✓ Reserve met</span>
                            )}
                        </p>
                    </div>
                )}

                {!isAuctionEnded && !isOwner && currentUser && (
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your bid (minimum {formatPrice(minBid)})
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    min={minBid}
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Placing Bid...
                                </>
                            ) : (
                                <>
                                    <Gavel className="w-5 h-5 mr-2" />
                                    Place Bid
                                </>
                            )}
                        </button>
                    </form>
                )}

                {isAuctionEnded && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                            <span className="text-gray-800 font-medium">This auction has ended</span>
                        </div>
                    </div>
                )}

                {isOwner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-blue-800 font-medium">This is your auction</span>
                        </div>
                    </div>
                )}

                {!currentUser && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                            <span className="text-gray-800">Please log in to place a bid</span>
                        </div>
                    </div>
                )}

                {/* Bid History */}
                <BidHistory auctionId={auction.id} />
            </div>
        </div>
    );
};

const AuctionCard = ({ auction, onItemClick, onWatchToggle, watchedItems = [], onNavigate }) => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const timeLeft = new Date(auction.endTime) > new Date();
    const currentBid = auction.currentBid || auction.startingBid;
    const isWatched = watchedItems.includes(auction.id);
    const isOwner = currentUser?.uid === auction.userId;
    const isAuctionEnded = new Date() > new Date(auction.endTime);

    const handleWatchToggle = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            showNotification('Please log in to watch auctions', 'error');
            return;
        }
        onWatchToggle(auction.id);
    };

    // Professional auction feed card
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100" onClick={() => onItemClick(auction)}>
            <div className="relative aspect-[4/5]">
                <img
                    src={auction.imageUrl || 'https://placehold.co/320x400/fef2f2/dc2626?text=Auction+Item'}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Professional overlay elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Watch button */}
                <div className="absolute top-2 right-2">
                    <button
                        onClick={handleWatchToggle}
                        className={`p-2 rounded-full transition-all shadow-lg ${isWatched ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'}`}
                    >
                        <Heart size={14} fill={isWatched ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Auction badge */}
                <div className="absolute top-2 left-2">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center">
                        <Gavel size={10} className="mr-1" />
                        Live Auction
                    </div>
                </div>

                {/* Time remaining - prominent display */}
                <div className="absolute top-12 left-2 right-2">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <div className="text-white text-xs font-medium mb-1">Time Remaining</div>
                        <div className="text-white font-bold text-sm">
                            <CountdownTimer endTime={auction.endTime} />
                        </div>
                    </div>
                </div>

                {/* Professional auction info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <div className="text-white">
                        <h4 className="font-bold text-lg mb-1 line-clamp-1">{auction.title}</h4>

                        {/* Current bid and activity */}
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-xs text-white/80 mb-1">Current Bid</div>
                                <p className="text-2xl font-bold text-green-400">{formatPrice(currentBid)}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-white/80 mb-1">Activity</div>
                                <div className="flex items-center text-sm font-semibold">
                                    <TrendingUp size={12} className="mr-1 text-green-400" />
                                    {auction.bidCount || 0} bids
                                </div>
                            </div>
                        </div>

                        {/* Reserve status if applicable */}
                        {auction.reservePrice && (
                            <div className="mb-2">
                                <div className={`text-xs px-2 py-1 rounded-full inline-block ${currentBid >= auction.reservePrice
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-orange-500/20 text-orange-300'
                                    }`}>
                                    {currentBid >= auction.reservePrice ? '✓ Reserve Met' : 'Reserve Not Met'}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-white/90">
                            <span className="flex items-center">
                                <MapPin size={10} className="mr-1" />
                                {auction.location}
                            </span>
                            {auction.userEmail && (
                                <span className="flex items-center">
                                    <User size={10} className="mr-1" />
                                    {auction.userEmail.split('@')[0]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hover action hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl">
                        <span className="text-gray-800 font-semibold text-sm">Place Bid</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AuctionInterface, AuctionCard, CountdownTimer, BidHistory };