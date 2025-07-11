import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const useFirestoreQuery = (collectionName, conditions = [], options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryConstraints = [];
            if (conditions) {
                conditions.forEach(c => {
                    if (c.field && c.operator && c.value !== undefined) {
                        queryConstraints.push(where(c.field, c.operator, c.value));
                    }
                });
            }

            if (options.orderBy) {
                queryConstraints.push(orderBy(options.orderBy, options.orderDirection || 'asc'));
            }

            if (options.limit) {
                queryConstraints.push(limit(options.limit));
            }

            const q = query(collection(db, collectionName), ...queryConstraints);
            const querySnapshot = await getDocs(q);
            const docsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                endTime: doc.data().endTime?.toDate(),
            }));
            setData(docsData);
        } catch (err) {
            setError(err);
            console.error("Error fetching from Firestore:", err);
        } finally {
            setLoading(false);
        }
    }, [collectionName, JSON.stringify(conditions), JSON.stringify(options)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useFirestoreQuery;