import { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ItemCard from './ItemCard';

const RelatedItems = ({ currentItem, onItemClick, onWatchToggle, watchedItems = [], onNavigate }) => {
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (!currentItem) return;

        const fetchRelated = async () => {
            try {
                const q = query(
                    collection(db, 'listings'),
                    where('category', '==', currentItem.category),
                    where('__name__', '!=', currentItem.id),
                    limit(4)
                );
                const querySnapshot = await getDocs(q);
                const relatedData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));
                setRelated(relatedData);
            } catch (error) {
                console.error("Error fetching related items:", error);
            }
        };

        fetchRelated();
    }, [currentItem]);

    if (related.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        isWatched={watchedItems?.includes(item.id) || false}
                        onWatchToggle={onWatchToggle}
                        onItemClick={onItemClick}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </div>
    );
};

export default RelatedItems;
