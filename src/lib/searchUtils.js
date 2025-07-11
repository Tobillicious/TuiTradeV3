export const applyClientSideFilters = (items, filters) => {
    let filteredItems = [...items];

    if (filters.keywords && filters.keywords.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const searchText = `${item.title} ${item.description} ${item.tags?.join(' ')}`.toLowerCase();
            return filters.keywords.every(keyword => searchText.includes(keyword.toLowerCase()));
        });
    }

    if (filters.priceRange) {
        if (filters.priceRange.min) {
            filteredItems = filteredItems.filter(item => (item.price || item.currentBid) >= parseFloat(filters.priceRange.min));
        }
        if (filters.priceRange.max) {
            filteredItems = filteredItems.filter(item => (item.price || item.currentBid) <= parseFloat(filters.priceRange.max));
        }
    }

    if (filters.region) {
        filteredItems = filteredItems.filter(item => item.location === filters.region);
    }
    
    if (filters.condition) {
        filteredItems = filteredItems.filter(item => item.condition === filters.condition);
    }

    return filteredItems;
};

export const sortResults = (items, sortBy) => {
    const sortedItems = [...items];
    switch (sortBy) {
        case 'price-low':
            sortedItems.sort((a, b) => (a.price || a.currentBid) - (b.price || b.currentBid));
            break;
        case 'price-high':
            sortedItems.sort((a, b) => (b.price || b.currentBid) - (a.price || b.currentBid));
            break;
        case 'recent':
        default:
            sortedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    return sortedItems;
};
