// src/components/ui/ReviewSystem.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { timeAgo } from '../../lib/utils';
import { Star, ThumbsUp, MessageCircle, Award } from 'lucide-react';

const StarRating = ({ rating, size = 'default', interactive = false, onRatingChange }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const handleClick = (value) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => interactive && setHoveredRating(star)}
                    onMouseLeave={() => interactive && setHoveredRating(0)}
                    disabled={!interactive}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
                >
                    <Star
                        className={`${sizeClasses[size]} ${star <= (hoveredRating || rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewForm = ({ sellerId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showNotification('Please select a rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Add review to reviews collection
            const reviewData = {
                sellerId,
                reviewerId: currentUser.uid,
                reviewerEmail: currentUser.email,
                rating,
                comment: comment.trim(),
                createdAt: new Date(),
                helpful: 0,
                reported: false
            };

            await addDoc(collection(db, 'reviews'), reviewData);

            // Update seller's rating in users collection
            const sellerRef = doc(db, 'users', sellerId);
            const sellerDoc = await getDoc(sellerRef);

            if (sellerDoc.exists()) {
                const currentData = sellerDoc.data();
                const currentAverage = currentData.rating?.average || 0;
                const currentCount = currentData.rating?.count || 0;

                const newCount = currentCount + 1;
                const newAverage = ((currentAverage * currentCount) + rating) / newCount;

                await updateDoc(sellerRef, {
                    'rating.average': Math.round(newAverage * 10) / 10,
                    'rating.count': newCount
                });
            } else {
                // Create user document with initial rating
                await updateDoc(sellerRef, {
                    'rating.average': rating,
                    'rating.count': 1
                });
            }

            showNotification('Review submitted successfully!', 'success');
            setRating(0);
            setComment('');
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                    </label>
                    <StarRating
                        rating={rating}
                        interactive={true}
                        onRatingChange={setRating}
                        size="large"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Share your experience with this seller..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

const ReviewList = ({ sellerId, showForm = false }) => {
    const [reviews, setReviews] = useState([]);
    const [sellerRating, setSellerRating] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const { currentUser } = useAuth();

    const fetchReviews = useCallback(async () => {
        try {
            const reviewsRef = collection(db, 'reviews');
            const q = query(
                reviewsRef,
                where('sellerId', '==', sellerId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const reviewsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    const fetchSellerRating = useCallback(async () => {
        try {
            const sellerDoc = await getDoc(doc(db, 'users', sellerId));
            if (sellerDoc.exists()) {
                const data = sellerDoc.data();
                setSellerRating(data.rating || { average: 0, count: 0 });
            }
        } catch (error) {
            console.error('Error fetching seller rating:', error);
        }
    }, [sellerId]);

    useEffect(() => {
        fetchReviews();
        fetchSellerRating();
    }, [fetchReviews, fetchSellerRating]);

    const handleHelpfulClick = async (reviewId, currentHelpful) => {
        try {
            await updateDoc(doc(db, 'reviews', reviewId), {
                helpful: increment(1)
            });

            // Update local state
            setReviews(prev => prev.map(review =>
                review.id === reviewId
                    ? { ...review, helpful: currentHelpful + 1 }
                    : review
            ));
        } catch (error) {
            console.error('Error updating helpful count:', error);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading reviews...</div>;
    }

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    };

    const distribution = getRatingDistribution();

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Seller Reviews</h3>
                    {showForm && currentUser && currentUser.uid !== sellerId && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {showReviewForm ? 'Cancel' : 'Write Review'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                            {sellerRating.average || 0}
                        </div>
                        <StarRating rating={sellerRating.average} size="large" />
                        <p className="text-gray-600 mt-2">
                            Based on {sellerRating.count} review{sellerRating.count !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{rating}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{
                                            width: `${sellerRating.count > 0 ? (distribution[rating] / sellerRating.count) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600">{distribution[rating]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && currentUser && currentUser.uid !== sellerId && (
                <ReviewForm
                    sellerId={sellerId}
                    onReviewSubmitted={() => {
                        setShowReviewForm(false);
                        fetchReviews();
                        fetchSellerRating();
                    }}
                />
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {review.reviewerEmail?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {review.reviewerEmail?.split('@')[0]}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <StarRating rating={review.rating} size="small" />
                                            <span className="text-sm text-gray-500">
                                                {review.createdAt ? timeAgo(review.createdAt) : 'Recently'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {review.rating === 5 && (
                                    <Award className="w-5 h-5 text-yellow-500" />
                                )}
                            </div>

                            {review.comment && (
                                <p className="text-gray-700 mb-4">{review.comment}</p>
                            )}

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handleHelpfulClick(review.id, review.helpful)}
                                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Helpful ({review.helpful || 0})</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-sm text-gray-400 mt-2">Be the first to review this seller</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export { StarRating, ReviewForm, ReviewList };