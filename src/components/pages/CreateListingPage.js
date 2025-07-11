// src/components/pages/CreateListingPage.js
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { CATEGORIES, NZ_REGIONS } from '../../lib/utils';
import { calculateListingFees, validateCategoryListing, getDefaultListingDuration } from '../../lib/categoryUtils';
import { LoadingSpinner } from '../ui/Loaders';
import { Tag, DollarSign, MapPin, Home, ChevronRight, X, Gavel, Clock, Calculator } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';

const CreateListingPage = ({ onNavigate, ...props }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        tags: [],
        attributes: {},
        condition: 'Used - Good',
        location: '',
        listingType: 'fixed-price',
        auctionDuration: '7',
        startingBid: '',
        reservePrice: '',
        bidIncrement: '1',
        isDigital: false,
        digitalFile: null,
        deliveryMethod: 'instant',
        licenseType: 'single-use',
        downloadLimit: 1
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    // Pre-fill form if editing
    useEffect(() => {
        if (props?.editItem) {
            setFormData({
                ...formData,
                ...props.editItem,
                price: props.editItem.price || '',
                startingBid: props.editItem.startingBid || '',
                reservePrice: props.editItem.reservePrice || '',
                bidIncrement: props.editItem.bidIncrement || '1',
                auctionDuration: props.editItem.auctionDuration || '7',
                images: props.editItem.images || [],
                isDigital: props.editItem.isDigital || false,
                digitalFileUrl: props.editItem.digitalFileUrl || null,
                deliveryMethod: props.editItem.deliveryMethod || 'instant',
                licenseType: props.editItem.licenseType || 'single-use',
                downloadLimit: props.editItem.downloadLimit || 1
            });
            setImagePreviews(props.editItem.images || [props.editItem.imageUrl].filter(Boolean));
            setIsEdit(true);
            setEditId(props.editItem.id);
        }
    }, [props.editItem]);

    const conditions = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (name === 'category') {
            const newCategory = CATEGORIES[value];
            const defaultListingType = newCategory?.listingTypes[0] || 'fixed-price';
            const defaultDuration = getDefaultListingDuration(value, defaultListingType);
            setFormData(prev => ({
                ...prev,
                subcategory: '',
                tags: [],
                attributes: {},
                listingType: defaultListingType,
                auctionDuration: defaultDuration.toString()
            }));
        }
        if (name === 'subcategory') {
            setFormData(prev => ({ ...prev, tags: [], attributes: {} }));
        }
        if (name === 'isDigital') {
            setFormData(prev => ({
                ...prev,
                location: checked ? 'Digital Delivery' : '',
                condition: checked ? 'New' : 'Used - Good'
            }));
        }
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleAttributeChange = (attr, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attr]: value }
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImageFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDigitalFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                setError('Digital file must be smaller than 100MB');
                return;
            }
            setFormData(prev => ({ ...prev, digitalFile: file }));
        }
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if user is logged in
        if (!currentUser) {
            setError('Please log in to create a listing');
            return;
        }

        console.log('Form validation passed, user logged in:', currentUser.email);

        if (!formData.title || !formData.category || !formData.location) {
            setError('Please fill in all required fields');
            return;
        }

        // Basic title validation
        if (formData.title.trim().length < 3) {
            setError('Title must be at least 3 characters long');
            return;
        }

        // Category-specific validation
        const validationErrors = validateCategoryListing(formData.category, formData.subcategory, formData);
        if (validationErrors.length > 0) {
            setError(validationErrors[0]);
            return;
        }

        if (formData.listingType === 'fixed-price') {
            if (!formData.price || parseFloat(formData.price) <= 0) {
                setError('Price must be greater than 0');
                return;
            }
        } else {
            if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
                setError('Starting bid must be greater than 0');
                return;
            }
            if (formData.reservePrice && parseFloat(formData.reservePrice) < parseFloat(formData.startingBid)) {
                setError('Reserve price must be greater than or equal to starting bid');
                return;
            }
        }

        setLoading(true);

        try {
            console.log('Starting listing creation...', { formData, currentUser: currentUser?.uid });

            // Upload images
            const imageUrls = [];
            for (const file of imageFiles) {
                console.log('Uploading image:', file.name);
                const imageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);
                imageUrls.push(url);
            }
            console.log('Images uploaded:', imageUrls.length);

            // Upload digital file if this is a digital listing
            let digitalFileUrl = null;
            if (formData.isDigital && formData.digitalFile) {
                console.log('Uploading digital file:', formData.digitalFile.name);
                const digitalRef = ref(storage, `digital-files/${currentUser.uid}/${Date.now()}_${formData.digitalFile.name}`);
                await uploadBytes(digitalRef, formData.digitalFile);
                digitalFileUrl = await getDownloadURL(digitalRef);
                console.log('Digital file uploaded:', digitalFileUrl);
            }

            // Use existing images if editing and none uploaded
            let finalImages = imageUrls.length > 0 ? imageUrls : (formData.images || []);
            if (isEdit && finalImages.length === 0 && imagePreviews.length > 0) {
                finalImages = imagePreviews;
            }

            // Create listing
            const baseListingData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory,
                tags: formData.tags,
                attributes: formData.attributes,
                condition: formData.condition,
                location: formData.location,
                listingType: formData.listingType,
                imageUrl: finalImages[0] || 'https://placehold.co/400x300/e2e8f0/cbd5e0?text=TuiTrade',
                images: finalImages,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                createdAt: serverTimestamp(),
                isDigital: formData.isDigital,
                digitalFileUrl: digitalFileUrl,
                deliveryMethod: formData.deliveryMethod,
                licenseType: formData.licenseType,
                downloadLimit: parseInt(formData.downloadLimit) || 1
            };

            let listingData;
            let collection_name = 'listings';

            if (formData.listingType === 'auction') {
                const endTime = new Date();
                endTime.setDate(endTime.getDate() + parseInt(formData.auctionDuration));

                listingData = {
                    ...baseListingData,
                    startingBid: parseFloat(formData.startingBid),
                    currentBid: parseFloat(formData.startingBid),
                    reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
                    bidIncrement: parseFloat(formData.bidIncrement),
                    endTime: endTime,
                    bidCount: 0,
                    currentWinner: null,
                    currentWinnerEmail: null
                };
                collection_name = 'auctions';
            } else {
                listingData = {
                    ...baseListingData,
                    price: parseFloat(formData.price)
                };
            }

            console.log('Creating document in collection:', collection_name, listingData);
            if (isEdit && editId) {
                // Update existing listing
                await updateDoc(doc(db, collection_name, editId), listingData);
                showNotification('Listing updated successfully!', 'success');
            } else {
                // Create new listing
                const docRef = await addDoc(collection(db, collection_name), {
                    ...listingData,
                    createdAt: new Date(),
                    views: 0,
                    inquiries: 0
                });
                console.log('Document created with ID:', docRef.id);
                showNotification('Listing created successfully!', 'success');
            }
            onNavigate('listings');
        } catch (error) {
            console.error('Error creating listing:', error);
            setError('Failed to save listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">Create Listing</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Listing' : 'Create New Listing'}</h1>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="e.g., iPhone 12 Pro Max 256GB"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Describe your item in detail..."
                            />
                        </div>

                        {formData.category && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Listing Type <span className="text-red-500">*</span>
                                </label>
                                <div className={`grid gap-4 ${CATEGORIES[formData.category]?.listingTypes.length === 1
                                    ? 'grid-cols-1'
                                    : 'grid-cols-1 md:grid-cols-2'
                                    }`}>
                                    {CATEGORIES[formData.category]?.listingTypes.includes('fixed-price') && (
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.listingType === 'fixed-price'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setFormData(prev => ({ ...prev, listingType: 'fixed-price' }))}
                                        >
                                            <div className="flex items-center mb-2">
                                                <Tag className="w-5 h-5 text-green-600 mr-2" />
                                                <h3 className="font-semibold">Buy Now</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">Sell at a set price with instant purchase</p>
                                        </div>
                                    )}

                                    {CATEGORIES[formData.category]?.listingTypes.includes('auction') && (
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.listingType === 'auction'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setFormData(prev => ({ ...prev, listingType: 'auction' }))}
                                        >
                                            <div className="flex items-center mb-2">
                                                <Gavel className="w-5 h-5 text-green-600 mr-2" />
                                                <h3 className="font-semibold">Auction</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">Let buyers bid on your item</p>
                                        </div>
                                    )}

                                    {CATEGORIES[formData.category]?.listingTypes.includes('classified') && (
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.listingType === 'classified'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setFormData(prev => ({ ...prev, listingType: 'classified' }))}
                                        >
                                            <div className="flex items-center mb-2">
                                                <Tag className="w-5 h-5 text-green-600 mr-2" />
                                                <h3 className="font-semibold">Classified</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">List without bidding - ideal for cars & property</p>
                                        </div>
                                    )}
                                </div>

                                {/* Category-specific info */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>{CATEGORIES[formData.category]?.name}</strong> supports{' '}
                                        {CATEGORIES[formData.category]?.listingTypes.join(' and ')} listings with{' '}
                                        {CATEGORIES[formData.category]?.defaultDuration} day duration.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                >
                                    <option value="">Select a category...</option>
                                    {Object.entries(CATEGORIES).map(([key, category]) => (
                                        <option key={key} value={key}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.category && CATEGORIES[formData.category].subcategories && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subcategory
                                    </label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select a subcategory...</option>
                                        {Object.entries(CATEGORIES[formData.category].subcategories).map(([key, sub]) => (
                                            <option key={key} value={key}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Tags Selection */}
                        {formData.subcategory && CATEGORIES[formData.category]?.subcategories[formData.subcategory]?.tags && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Tags (Select all that apply)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES[formData.category].subcategories[formData.subcategory].tags.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${formData.tags.includes(tag)
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Attributes */}
                        {formData.subcategory && CATEGORIES[formData.category]?.subcategories[formData.subcategory]?.attributes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Item Details
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {CATEGORIES[formData.category].subcategories[formData.subcategory].attributes.map(attr => (
                                        <div key={attr}>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                {attr}
                                                {CATEGORIES[formData.category].subcategories[formData.subcategory].required?.includes(attr) &&
                                                    <span className="text-red-500 ml-1">*</span>
                                                }
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.attributes[attr] || ''}
                                                onChange={(e) => handleAttributeChange(attr, e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder={`Enter ${attr.toLowerCase()}...`}
                                                required={CATEGORIES[formData.category].subcategories[formData.subcategory].required?.includes(attr)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing Section */}
                        {formData.listingType === 'fixed-price' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (NZD) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Bid (NZD) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                name="startingBid"
                                                type="number"
                                                value={formData.startingBid}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reserve Price (NZD) <span className="text-gray-500">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                name="reservePrice"
                                                type="number"
                                                value={formData.reservePrice}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Minimum price to sell (hidden from bidders)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bid Increment (NZD)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                name="bidIncrement"
                                                type="number"
                                                value={formData.bidIncrement}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="1.00"
                                                step="0.01"
                                                min="0.01"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Minimum amount between bids</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Auction Duration
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                name="auctionDuration"
                                                value={formData.auctionDuration}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="1">1 day</option>
                                                <option value="3">3 days</option>
                                                <option value="7">7 days</option>
                                                <option value="10">10 days</option>
                                                <option value="14">14 days</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                >
                                    <option value="">Select region...</option>
                                    {NZ_REGIONS.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Digital Goods Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Is this a digital good?
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isDigital"
                                        checked={formData.isDigital}
                                        onChange={handleInputChange}
                                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Yes, this is a digital good that can be delivered instantly.</span>
                                </div>
                            </div>
                        </div>

                        {formData.isDigital && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Digital File (Max 100MB)
                                    </label>
                                    <input
                                        type="file"
                                        name="digitalFile"
                                        onChange={handleDigitalFileChange}
                                        accept=".pdf,.doc,.docx,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    {formData.digitalFile && (
                                        <p className="text-xs text-gray-500 mt-2">Selected file: {formData.digitalFile.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Method
                                    </label>
                                    <select
                                        name="deliveryMethod"
                                        value={formData.deliveryMethod}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="instant">Instant Delivery</option>
                                        <option value="email">Email Delivery</option>
                                        <option value="download">Download Link</option>
                                    </select>
                                </div>

                                {formData.deliveryMethod === 'download' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Download Limit (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            name="downloadLimit"
                                            value={formData.downloadLimit}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="1"
                                            min="1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Number of times the file can be downloaded.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        License Type
                                    </label>
                                    <select
                                        name="licenseType"
                                        value={formData.licenseType}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="single-use">Single Use License</option>
                                        <option value="perpetual">Perpetual License</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Fee Calculator */}
                        {formData.category && (formData.price || formData.startingBid) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="font-semibold text-blue-900">Estimated Fees</h3>
                                </div>
                                {(() => {
                                    const price = parseFloat(formData.price || formData.startingBid || 0);
                                    const fees = calculateListingFees(formData.category, price, formData.listingType);
                                    return (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Listing fee:</span>
                                                <span className="font-medium">{fees.breakdown.listingFee}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Success fee:</span>
                                                <span className="font-medium">{fees.breakdown.successFee}</span>
                                            </div>
                                            <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                                                <span className="text-blue-900">Total fees:</span>
                                                <span className="text-blue-900">{fees.breakdown.total}</span>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">
                                                {CATEGORIES[formData.category]?.name} category • {formData.listingType} listing
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition
                            </label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                {conditions.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images (Max 5)
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Tag className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            multiple
                                        />
                                    </label>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? <LoadingSpinner /> : isEdit ? 'Update Listing' : (
                                <>
                                    {formData.listingType === 'auction' ? (
                                        <Gavel className="w-5 h-5 mr-2" />
                                    ) : (
                                        <Tag className="w-5 h-5 mr-2" />
                                    )}
                                    {formData.listingType === 'auction' ? 'Create Auction' : 'Create Listing'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateListingPage;