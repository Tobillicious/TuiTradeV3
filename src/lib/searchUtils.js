// Enhanced search with fuzzy matching and scoring
export const calculateRelevanceScore = (item, keywords) => {
    let score = 0;
    const searchText = `${item.title} ${item.description} ${item.tags?.join(' ')}`.toLowerCase();
    
    keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Exact match in title (highest score)
        if (item.title.toLowerCase().includes(keywordLower)) {
            score += 100;
        }
        
        // Exact match in description
        if (item.description?.toLowerCase().includes(keywordLower)) {
            score += 50;
        }
        
        // Match in tags
        if (item.tags?.some(tag => tag.toLowerCase().includes(keywordLower))) {
            score += 25;
        }
        
        // Fuzzy matching (simple implementation)
        if (searchText.includes(keywordLower)) {
            score += 10;
        }
    });
    
    return score;
};

export const applyClientSideFilters = (items, filters) => {
    let filteredItems = [...items];

    // Advanced keyword search with relevance scoring
    if (filters.keywords && filters.keywords.length > 0) {
        filteredItems = filteredItems
            .map(item => ({
                ...item,
                relevanceScore: calculateRelevanceScore(item, filters.keywords)
            }))
            .filter(item => item.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Price range filtering
    if (filters.priceMin || filters.priceMax) {
        filteredItems = filteredItems.filter(item => {
            const itemPrice = item.price || item.currentBid || 0;
            const minPrice = parseFloat(filters.priceMin) || 0;
            const maxPrice = parseFloat(filters.priceMax) || Infinity;
            return itemPrice >= minPrice && itemPrice <= maxPrice;
        });
    }

    // Location filtering
    if (filters.location) {
        filteredItems = filteredItems.filter(item => 
            item.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
    }
    
    // Condition filtering
    if (filters.condition) {
        filteredItems = filteredItems.filter(item => item.condition === filters.condition);
    }

    // Category filtering
    if (filters.category) {
        filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Listing type filtering
    if (filters.listingType) {
        filteredItems = filteredItems.filter(item => item.listingType === filters.listingType);
    }

    // Tags filtering
    if (filters.tags && filters.tags.length > 0) {
        filteredItems = filteredItems.filter(item => 
            filters.tags.some(tag => item.tags?.includes(tag))
        );
    }

    return filteredItems;
};

export const sortResults = (items, sortBy) => {
    const sortedItems = [...items];
    
    switch (sortBy) {
        case 'price-low':
            sortedItems.sort((a, b) => {
                const priceA = a.price || a.currentBid || 0;
                const priceB = b.price || b.currentBid || 0;
                return priceA - priceB;
            });
            break;
            
        case 'price-high':
            sortedItems.sort((a, b) => {
                const priceA = a.price || a.currentBid || 0;
                const priceB = b.price || b.currentBid || 0;
                return priceB - priceA;
            });
            break;
            
        case 'title-az':
            sortedItems.sort((a, b) => a.title.localeCompare(b.title));
            break;
            
        case 'title-za':
            sortedItems.sort((a, b) => b.title.localeCompare(a.title));
            break;
            
        case 'oldest':
            sortedItems.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateA - dateB;
            });
            break;
            
        case 'popular':
            sortedItems.sort((a, b) => {
                const popularityA = (a.watchCount || 0) + (a.views || 0);
                const popularityB = (b.watchCount || 0) + (b.views || 0);
                return popularityB - popularityA;
            });
            break;
            
        case 'relevance':
            // If relevance scores exist, use them; otherwise fall back to date
            if (sortedItems.length > 0 && sortedItems[0].relevanceScore !== undefined) {
                sortedItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
            } else {
                sortedItems.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                });
            }
            break;
            
        case 'newest':
        default:
            sortedItems.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
            break;
    }
    
    return sortedItems;
};

// Search suggestions based on user input
export const getSearchSuggestions = (query, items, limit = 5) => {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set();
    const queryLower = query.toLowerCase();
    
    items.forEach(item => {
        // Title suggestions
        if (item.title.toLowerCase().includes(queryLower)) {
            suggestions.add(item.title);
        }
        
        // Tag suggestions
        item.tags?.forEach(tag => {
            if (tag.toLowerCase().includes(queryLower)) {
                suggestions.add(tag);
            }
        });
        
        // Category suggestions
        if (item.category?.toLowerCase().includes(queryLower)) {
            suggestions.add(item.category);
        }
    });
    
    return Array.from(suggestions).slice(0, limit);
};

// Search analytics for tracking popular searches
export const trackSearch = (query, resultCount) => {
    const searchData = {
        query,
        resultCount,
        timestamp: new Date(),
        sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
    };
    
    // Store in localStorage for now (in production, send to analytics service)
    const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searches.push(searchData);
    
    // Keep only last 100 searches
    if (searches.length > 100) {
        searches.shift();
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searches));
};

// Get trending searches
export const getTrendingSearches = (limit = 10) => {
    const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const queryCount = {};
    
    searches.forEach(search => {
        queryCount[search.query] = (queryCount[search.query] || 0) + 1;
    });
    
    return Object.entries(queryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([query]) => query);
};
