// Enhanced Multi-Level Category System for TuiTrade
// Inspired by TradeMe with deep brand/model hierarchies

import {
    ShoppingCart, Car, Briefcase, Home as HomeIcon, Wrench, Gift, 
    Smartphone, Laptop, Camera, Gamepad2, Monitor, Headphones
} from 'lucide-react';

// Brand data for various categories
export const BRANDS = {
    mobilePhones: {
        apple: {
            name: 'Apple',
            models: {
                'iphone-15': { name: 'iPhone 15', variants: ['128GB', '256GB', '512GB'], colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'] },
                'iphone-15-plus': { name: 'iPhone 15 Plus', variants: ['128GB', '256GB', '512GB'], colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'] },
                'iphone-15-pro': { name: 'iPhone 15 Pro', variants: ['128GB', '256GB', '512GB', '1TB'], colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] },
                'iphone-15-pro-max': { name: 'iPhone 15 Pro Max', variants: ['256GB', '512GB', '1TB'], colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] },
                'iphone-14': { name: 'iPhone 14', variants: ['128GB', '256GB', '512GB'], colors: ['Blue', 'Purple', 'Midnight', 'Starlight', 'Red'] },
                'iphone-13': { name: 'iPhone 13', variants: ['128GB', '256GB', '512GB'], colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Red'] },
                'iphone-12': { name: 'iPhone 12', variants: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', 'Red', 'Green', 'Blue', 'Purple'] }
            }
        },
        samsung: {
            name: 'Samsung',
            models: {
                'galaxy-s24': { name: 'Galaxy S24', variants: ['128GB', '256GB'], colors: ['Onyx Black', 'Marble Gray', 'Cobalt Violet', 'Amber Yellow'] },
                'galaxy-s24-plus': { name: 'Galaxy S24+', variants: ['256GB', '512GB'], colors: ['Onyx Black', 'Marble Gray', 'Cobalt Violet', 'Amber Yellow'] },
                'galaxy-s24-ultra': { name: 'Galaxy S24 Ultra', variants: ['256GB', '512GB', '1TB'], colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'] },
                'galaxy-s23': { name: 'Galaxy S23', variants: ['128GB', '256GB'], colors: ['Phantom Black', 'Cream', 'Green', 'Lavender'] },
                'galaxy-a54': { name: 'Galaxy A54', variants: ['128GB', '256GB'], colors: ['Awesome Black', 'Awesome White', 'Awesome Violet', 'Awesome Lime'] }
            }
        },
        google: {
            name: 'Google',
            models: {
                'pixel-8': { name: 'Pixel 8', variants: ['128GB', '256GB'], colors: ['Obsidian', 'Snow', 'Rose'] },
                'pixel-8-pro': { name: 'Pixel 8 Pro', variants: ['128GB', '256GB', '512GB'], colors: ['Obsidian', 'Snow', 'Bay'] },
                'pixel-7': { name: 'Pixel 7', variants: ['128GB', '256GB'], colors: ['Obsidian', 'Snow', 'Lemongrass'] }
            }
        },
        oneplus: {
            name: 'OnePlus',
            models: {
                'oneplus-12': { name: 'OnePlus 12', variants: ['256GB', '512GB'], colors: ['Silky Black', 'Flowy Emerald'] },
                'oneplus-11': { name: 'OnePlus 11', variants: ['128GB', '256GB'], colors: ['Titan Black', 'Eternal Green'] }
            }
        }
    },
    cars: {
        toyota: {
            name: 'Toyota',
            models: {
                'corolla': { name: 'Corolla', variants: ['2.0L Petrol', '1.8L Hybrid'], bodyTypes: ['Hatchback', 'Sedan'] },
                'camry': { name: 'Camry', variants: ['2.5L Petrol', '2.5L Hybrid'], bodyTypes: ['Sedan'] },
                'rav4': { name: 'RAV4', variants: ['2.0L Petrol', '2.5L Hybrid'], bodyTypes: ['SUV'] },
                'hilux': { name: 'Hilux', variants: ['2.4L Diesel', '2.8L Diesel'], bodyTypes: ['Single Cab', 'Double Cab'] },
                'prius': { name: 'Prius', variants: ['1.8L Hybrid'], bodyTypes: ['Hatchback'] }
            }
        },
        ford: {
            name: 'Ford',
            models: {
                'ranger': { name: 'Ranger', variants: ['2.0L Diesel', '3.2L Diesel'], bodyTypes: ['Single Cab', 'Double Cab'] },
                'territory': { name: 'Territory', variants: ['2.7L Petrol'], bodyTypes: ['SUV'] },
                'mustang': { name: 'Mustang', variants: ['2.3L Turbo', '5.0L V8'], bodyTypes: ['Coupe', 'Convertible'] }
            }
        },
        holden: {
            name: 'Holden',
            models: {
                'commodore': { name: 'Commodore', variants: ['3.6L V6', '6.2L V8'], bodyTypes: ['Sedan', 'Wagon', 'Ute'] },
                'colorado': { name: 'Colorado', variants: ['2.8L Diesel'], bodyTypes: ['Single Cab', 'Double Cab'] }
            }
        },
        mazda: {
            name: 'Mazda',
            models: {
                'cx-5': { name: 'CX-5', variants: ['2.0L Petrol', '2.5L Petrol'], bodyTypes: ['SUV'] },
                'mazda3': { name: 'Mazda3', variants: ['2.0L Petrol', '2.5L Petrol'], bodyTypes: ['Hatchback', 'Sedan'] },
                'bt-50': { name: 'BT-50', variants: ['3.0L Diesel'], bodyTypes: ['Single Cab', 'Double Cab'] }
            }
        }
    },
    laptops: {
        apple: {
            name: 'Apple',
            models: {
                'macbook-air-m3': { name: 'MacBook Air M3', variants: ['13"', '15"'], specs: ['8GB RAM', '16GB RAM', '24GB RAM'] },
                'macbook-pro-m3': { name: 'MacBook Pro M3', variants: ['14"', '16"'], specs: ['8GB RAM', '16GB RAM', '32GB RAM'] },
                'macbook-air-m2': { name: 'MacBook Air M2', variants: ['13"'], specs: ['8GB RAM', '16GB RAM', '24GB RAM'] }
            }
        },
        dell: {
            name: 'Dell',
            models: {
                'xps-13': { name: 'XPS 13', variants: ['13.4"'], specs: ['8GB RAM', '16GB RAM', '32GB RAM'] },
                'xps-15': { name: 'XPS 15', variants: ['15.6"'], specs: ['16GB RAM', '32GB RAM', '64GB RAM'] },
                'inspiron-15': { name: 'Inspiron 15', variants: ['15.6"'], specs: ['8GB RAM', '16GB RAM'] }
            }
        },
        hp: {
            name: 'HP',
            models: {
                'spectre-x360': { name: 'Spectre x360', variants: ['13.5"', '16"'], specs: ['16GB RAM', '32GB RAM'] },
                'pavilion': { name: 'Pavilion', variants: ['14"', '15.6"'], specs: ['8GB RAM', '16GB RAM'] },
                'envy': { name: 'Envy', variants: ['13.3"', '15.6"'], specs: ['8GB RAM', '16GB RAM'] }
            }
        },
        lenovo: {
            name: 'Lenovo',
            models: {
                'thinkpad-x1': { name: 'ThinkPad X1 Carbon', variants: ['14"'], specs: ['16GB RAM', '32GB RAM'] },
                'thinkpad-t14': { name: 'ThinkPad T14', variants: ['14"'], specs: ['8GB RAM', '16GB RAM', '32GB RAM'] },
                'legion': { name: 'Legion Gaming', variants: ['15.6"', '17.3"'], specs: ['16GB RAM', '32GB RAM'] }
            }
        }
    }
};

// Enhanced category structure with deep hierarchies
export const ENHANCED_CATEGORIES = {
    marketplace: {
        name: 'Marketplace',
        icon: ShoppingCart,
        color: 'blue',
        listingTypes: ['auction', 'fixed-price'],
        defaultDuration: 7,
        fees: { listingFee: 0, successFeeRate: 0.079, maxSuccessFee: 499 },
        subcategories: {
            'electronics': {
                name: 'Electronics',
                icon: Laptop,
                subcategories: {
                    'mobile-phones': {
                        name: 'Mobile Phones',
                        icon: Smartphone,
                        brands: BRANDS.mobilePhones,
                        attributes: ['Brand', 'Model', 'Storage', 'Color', 'Network', 'Condition'],
                        required: ['Brand', 'Model', 'Storage', 'Condition'],
                        filters: {
                            storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
                            network: ['5G', '4G LTE'],
                            condition: ['New', 'Excellent', 'Good', 'Fair'],
                            priceRange: { min: 50, max: 3000 }
                        }
                    },
                    'computers-laptops': {
                        name: 'Computers & Laptops',
                        icon: Laptop,
                        subcategories: {
                            'laptops': {
                                name: 'Laptops',
                                brands: BRANDS.laptops,
                                attributes: ['Brand', 'Model', 'Screen Size', 'RAM', 'Storage', 'Processor', 'Graphics'],
                                required: ['Brand', 'Model', 'Screen Size', 'RAM'],
                                filters: {
                                    screenSize: ['11"', '12"', '13"', '14"', '15"', '16"', '17"'],
                                    ram: ['4GB', '8GB', '16GB', '32GB', '64GB'],
                                    storage: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
                                    processor: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3']
                                }
                            },
                            'desktops': {
                                name: 'Desktop Computers',
                                attributes: ['Brand', 'Processor', 'RAM', 'Storage', 'Graphics Card', 'Operating System'],
                                filters: {
                                    formFactor: ['Tower', 'Mini PC', 'All-in-One'],
                                    graphics: ['Integrated', 'GTX 1660', 'RTX 3060', 'RTX 3070', 'RTX 3080', 'RTX 4060', 'RTX 4070', 'RTX 4080']
                                }
                            },
                            'tablets': {
                                name: 'Tablets',
                                attributes: ['Brand', 'Model', 'Screen Size', 'Storage', 'Connectivity'],
                                brands: {
                                    apple: { name: 'Apple', models: ['iPad', 'iPad Air', 'iPad Pro', 'iPad Mini'] },
                                    samsung: { name: 'Samsung', models: ['Galaxy Tab S9', 'Galaxy Tab A', 'Galaxy Tab S8'] },
                                    microsoft: { name: 'Microsoft', models: ['Surface Pro', 'Surface Go'] }
                                }
                            }
                        }
                    },
                    'cameras-photography': {
                        name: 'Cameras & Photography',
                        icon: Camera,
                        subcategories: {
                            'digital-cameras': {
                                name: 'Digital Cameras',
                                attributes: ['Brand', 'Type', 'Megapixels', 'Lens Mount', 'Video Quality'],
                                brands: {
                                    canon: { name: 'Canon', models: ['EOS R5', 'EOS R6', 'EOS 90D', 'PowerShot'] },
                                    nikon: { name: 'Nikon', models: ['D850', 'Z6', 'Z7', 'D7500'] },
                                    sony: { name: 'Sony', models: ['A7 IV', 'A7R V', 'FX3', 'A6000'] }
                                },
                                filters: {
                                    type: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera'],
                                    megapixels: ['Under 20MP', '20-30MP', '30-50MP', 'Over 50MP']
                                }
                            },
                            'lenses': {
                                name: 'Camera Lenses',
                                attributes: ['Brand', 'Mount', 'Focal Length', 'Aperture', 'Lens Type']
                            },
                            'accessories': {
                                name: 'Camera Accessories',
                                attributes: ['Type', 'Brand', 'Compatibility']
                            }
                        }
                    },
                    'gaming': {
                        name: 'Gaming',
                        icon: Gamepad2,
                        subcategories: {
                            'consoles': {
                                name: 'Gaming Consoles',
                                attributes: ['Brand', 'Model', 'Storage', 'Condition'],
                                brands: {
                                    sony: { name: 'Sony', models: ['PlayStation 5', 'PlayStation 4', 'PlayStation VR2'] },
                                    microsoft: { name: 'Microsoft', models: ['Xbox Series X', 'Xbox Series S', 'Xbox One'] },
                                    nintendo: { name: 'Nintendo', models: ['Switch OLED', 'Switch', 'Switch Lite'] }
                                }
                            },
                            'games': {
                                name: 'Video Games',
                                attributes: ['Platform', 'Genre', 'Rating', 'Condition']
                            },
                            'accessories': {
                                name: 'Gaming Accessories',
                                attributes: ['Type', 'Compatibility', 'Brand']
                            }
                        }
                    }
                }
            },
            'fashion': {
                name: 'Fashion',
                subcategories: {
                    'womens-clothing': {
                        name: "Women's Clothing",
                        attributes: ['Size', 'Brand', 'Color', 'Material', 'Style'],
                        filters: {
                            size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16', '18', '20'],
                            type: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Activewear', 'Lingerie', 'Sleepwear']
                        }
                    },
                    'mens-clothing': {
                        name: "Men's Clothing",
                        attributes: ['Size', 'Brand', 'Color', 'Material', 'Style'],
                        filters: {
                            size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
                            type: ['Shirts', 'Pants', 'Suits', 'Casual', 'Activewear', 'Underwear']
                        }
                    },
                    'shoes': {
                        name: 'Shoes',
                        attributes: ['Size', 'Brand', 'Type', 'Color', 'Material'],
                        brands: {
                            nike: { name: 'Nike', models: ['Air Max', 'Air Force 1', 'Jordan', 'React'] },
                            adidas: { name: 'Adidas', models: ['Ultraboost', 'Stan Smith', 'Superstar', 'NMD'] },
                            newBalance: { name: 'New Balance', models: ['990', '997', '1080', 'Fresh Foam'] }
                        }
                    }
                }
            },
            'home-garden': {
                name: 'Home & Garden',
                subcategories: {
                    'furniture': {
                        name: 'Furniture',
                        subcategories: {
                            'bedroom': { name: 'Bedroom Furniture', attributes: ['Material', 'Size', 'Style', 'Color'] },
                            'living-room': { name: 'Living Room', attributes: ['Material', 'Seating Capacity', 'Style'] },
                            'dining': { name: 'Dining Furniture', attributes: ['Material', 'Seating Capacity', 'Shape'] },
                            'office': { name: 'Office Furniture', attributes: ['Material', 'Dimensions', 'Ergonomic Features'] }
                        }
                    },
                    'garden': {
                        name: 'Garden & Outdoor',
                        subcategories: {
                            'tools': { name: 'Garden Tools', attributes: ['Type', 'Power Source', 'Brand'] },
                            'plants': { name: 'Plants', attributes: ['Type', 'Size', 'Care Level', 'Indoor/Outdoor'] },
                            'outdoor-furniture': { name: 'Outdoor Furniture', attributes: ['Material', 'Weather Resistant', 'Size'] }
                        }
                    }
                }
            }
        }
    },
    services: {
        name: 'Services',
        icon: Wrench,
        color: 'orange',
        listingTypes: ['classified'],
        defaultDuration: 30,
        fees: { listingFee: 10, successFeeRate: 0.05, maxSuccessFee: 150 },
        subcategories: {
            'trades': {
                name: 'Trades & Home Services',
                subcategories: {
                    'building': { name: 'Building & Construction' },
                    'plumbing': { name: 'Plumbing & Gas Fitting' },
                    'electrical': { name: 'Electrical' },
                    'painting': { name: 'Painting & Decorating' },
                    'gardening': { name: 'Gardening & Landscaping' },
                }
            },
            'professional': {
                name: 'Professional Services',
                subcategories: {
                    'accounting': { name: 'Accounting & Bookkeeping' },
                    'legal': { name: 'Legal Services' },
                    'marketing': { name: 'Marketing & Design' },
                    'it': { name: 'IT & Web Development' },
                }
            },
            'creative': {
                name: 'Creative Services',
                subcategories: {
                    'photography': { name: 'Photography & Video' },
                    'writing': { name: 'Writing & Translation' },
                    'music': { name: 'Music & Audio' },
                }
            }
        }
    },
    motors: {
        name: 'Motors',
        icon: Car,
        color: 'red',
        listingTypes: ['auction', 'classified'],
        defaultDuration: 90,
        fees: { listingFee: 49, successFeeRate: 0.02, maxSuccessFee: 99 },
        subcategories: {
            'cars': {
                name: 'Cars',
                brands: BRANDS.cars,
                attributes: ['Make', 'Model', 'Year', 'Mileage', 'Engine Size', 'Transmission', 'Fuel Type', 'Body Type', 'Doors', 'Color', 'Registration', 'WOF'],
                required: ['Make', 'Model', 'Year', 'Mileage'],
                filters: {
                    year: { min: 1990, max: new Date().getFullYear() + 1 },
                    mileage: { min: 0, max: 500000 },
                    fuelType: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'],
                    transmission: ['Manual', 'Automatic', 'CVT'],
                    bodyType: ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Ute', 'Convertible', 'Coupe'],
                    doors: ['2', '3', '4', '5'],
                    engineSize: ['Under 1.0L', '1.0-1.5L', '1.5-2.0L', '2.0-3.0L', '3.0-4.0L', 'Over 4.0L']
                }
            },
            'motorcycles': {
                name: 'Motorcycles',
                attributes: ['Make', 'Model', 'Year', 'Engine Size', 'Type', 'Color', 'Registration', 'WOF'],
                brands: {
                    harley: { name: 'Harley-Davidson', models: ['Sportster', 'Street', 'Touring', 'Softail'] },
                    honda: { name: 'Honda', models: ['CBR', 'CRF', 'Gold Wing', 'Rebel'] },
                    yamaha: { name: 'Yamaha', models: ['YZF', 'MT', 'FJR', 'Tenere'] },
                    kawasaki: { name: 'Kawasaki', models: ['Ninja', 'Z', 'Versys', 'KX'] }
                },
                filters: {
                    type: ['Sport', 'Cruiser', 'Touring', 'Adventure', 'Dirt Bike', 'Scooter'],
                    engineSize: ['Under 250cc', '250-500cc', '500-750cc', '750-1000cc', 'Over 1000cc']
                }
            }
        }
    },
    property: {
        name: 'Property',
        icon: HomeIcon,
        color: 'purple',
        listingTypes: ['classified'],
        defaultDuration: 28,
        fees: { listingFee: 0, successFeeRate: 0 },
        subcategories: {
            'residential-sale': {
                name: 'Residential for Sale',
                attributes: ['Price', 'Bedrooms', 'Bathrooms', 'Property Type', 'Land Area', 'Floor Area', 'Parking', 'Year Built'],
                filters: {
                    bedrooms: ['1', '2', '3', '4', '5', '6+'],
                    bathrooms: ['1', '2', '3', '4', '5+'],
                    propertyType: ['House', 'Apartment', 'Townhouse', 'Unit', 'Section', 'Lifestyle Block'],
                    priceRange: { min: 100000, max: 5000000 }
                }
            },
            'residential-rent': {
                name: 'Residential for Rent',
                attributes: ['Rent per Week', 'Bedrooms', 'Bathrooms', 'Parking', 'Pets Allowed', 'Furnished', 'Available From'],
                filters: {
                    rentRange: { min: 200, max: 2000 },
                    furnished: ['Yes', 'No', 'Partial'],
                    petsAllowed: ['Yes', 'No', 'Cats Only', 'Small Dogs']
                }
            }
        }
    },
    jobs: {
        name: 'Jobs',
        icon: Briefcase,
        color: 'green',
        listingTypes: ['classified'],
        defaultDuration: 30,
        fees: { listingFee: 0, successFeeRate: 0 },
        subcategories: {
            'technology': {
                name: 'Technology',
                subcategories: {
                    'software': { name: 'Software Development', attributes: ['Experience Level', 'Programming Languages', 'Salary Range'] },
                    'it-support': { name: 'IT Support', attributes: ['Experience Level', 'Certifications', 'Salary Range'] },
                    'data': { name: 'Data & Analytics', attributes: ['Experience Level', 'Tools', 'Salary Range'] }
                }
            },
            'healthcare': {
                name: 'Healthcare',
                subcategories: {
                    'nursing': { name: 'Nursing', attributes: ['Registration', 'Specialization', 'Experience'] },
                    'medical': { name: 'Medical', attributes: ['Qualification', 'Specialization', 'Registration'] }
                }
            }
        }
    },
    digitalGoods: {
        name: 'Digital Goods',
        icon: Monitor,
        color: 'indigo',
        listingTypes: ['fixed-price', 'auction'],
        defaultDuration: 30,
        fees: { listingFee: 0, successFeeRate: 0.05, maxSuccessFee: 199 },
        attributes: ['Category', 'License Type', 'Format', 'Compatibility', 'Delivery Method', 'Language'],
        subcategories: {
            'software': {
                name: 'Software',
                attributes: ['Software Type', 'Operating System', 'License Type', 'Version', 'Language'],
                required: ['Software Type', 'Operating System', 'License Type'],
                subcategories: {
                    'applications': { 
                        name: 'Applications', 
                        attributes: ['Category', 'Platform', 'License Duration', 'Updates Included'],
                        filters: {
                            category: ['Productivity', 'Creative', 'Business', 'Education', 'Utilities'],
                            platform: ['Windows', 'macOS', 'Linux', 'Cross-Platform'],
                            licenseType: ['Lifetime', 'Annual', 'Monthly', 'One-Time']
                        }
                    },
                    'games': { 
                        name: 'PC Games', 
                        attributes: ['Genre', 'Platform', 'Age Rating', 'Multiplayer', 'VR Support'],
                        filters: {
                            genre: ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing'],
                            platform: ['Steam', 'Epic Games', 'GOG', 'Origin', 'Ubisoft Connect'],
                            ageRating: ['E (Everyone)', 'T (Teen)', 'M (Mature)', 'AO (Adults Only)']
                        }
                    },
                    'mobile-apps': { 
                        name: 'Mobile Apps', 
                        attributes: ['Platform', 'App Type', 'In-App Purchases', 'Offline Support'],
                        filters: {
                            platform: ['iOS', 'Android', 'Cross-Platform'],
                            appType: ['Games', 'Productivity', 'Social', 'Education', 'Health', 'Entertainment']
                        }
                    }
                }
            },
            'ebooks': {
                name: 'eBooks & Audiobooks',
                attributes: ['Format', 'Language', 'Genre', 'Page Count', 'Publisher', 'DRM Protection'],
                required: ['Format', 'Language', 'Genre'],
                subcategories: {
                    'fiction': { 
                        name: 'Fiction', 
                        attributes: ['Sub-Genre', 'Series', 'Author', 'Publication Year'],
                        filters: {
                            subGenre: ['Romance', 'Mystery', 'Sci-Fi', 'Fantasy', 'Thriller', 'Historical', 'Contemporary']
                        }
                    },
                    'non-fiction': { 
                        name: 'Non-Fiction', 
                        attributes: ['Subject', 'Author', 'Publication Year', 'Target Audience'],
                        filters: {
                            subject: ['Business', 'Self-Help', 'History', 'Science', 'Biography', 'Health', 'Technology']
                        }
                    },
                    'educational': { 
                        name: 'Educational', 
                        attributes: ['Subject', 'Grade Level', 'Publisher', 'Edition'],
                        filters: {
                            subject: ['Mathematics', 'Science', 'Language Arts', 'History', 'Programming', 'Business']
                        }
                    }
                },
                filters: {
                    format: ['PDF', 'EPUB', 'MOBI', 'MP3 (Audiobook)', 'M4A (Audiobook)'],
                    language: ['English', 'Te Reo Māori', 'Spanish', 'French', 'German', 'Japanese', 'Chinese']
                }
            },
            'graphics': {
                name: 'Graphics & Design',
                attributes: ['File Format', 'Resolution', 'Color Mode', 'License Type', 'Software Compatibility'],
                required: ['File Format', 'License Type'],
                subcategories: {
                    'stock-photos': { 
                        name: 'Stock Photos', 
                        attributes: ['Resolution', 'Orientation', 'Subject', 'Color Palette'],
                        filters: {
                            resolution: ['Web (72 DPI)', 'Print (300 DPI)', 'High-Res (600+ DPI)'],
                            orientation: ['Landscape', 'Portrait', 'Square'],
                            subject: ['Nature', 'Business', 'People', 'Technology', 'Abstract', 'Food']
                        }
                    },
                    'templates': { 
                        name: 'Design Templates', 
                        attributes: ['Template Type', 'Software', 'Customizable Elements', 'Color Scheme'],
                        filters: {
                            templateType: ['Logo', 'Brochure', 'Website', 'Social Media', 'Presentation', 'Print'],
                            software: ['Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Canva', 'PowerPoint']
                        }
                    },
                    'fonts': { 
                        name: 'Fonts & Typography', 
                        attributes: ['Font Style', 'Character Set', 'License Scope', 'File Format'],
                        filters: {
                            fontStyle: ['Serif', 'Sans-Serif', 'Script', 'Display', 'Monospace'],
                            licenseScope: ['Personal Use', 'Commercial Use', 'Extended Commercial']
                        }
                    }
                }
            },
            'music': {
                name: 'Music & Audio',
                attributes: ['Format', 'Quality', 'Duration', 'Genre', 'Licensing', 'Instruments'],
                required: ['Format', 'Quality', 'Licensing'],
                subcategories: {
                    'tracks': { 
                        name: 'Music Tracks', 
                        attributes: ['Genre', 'Mood', 'Tempo', 'Key', 'Vocals'],
                        filters: {
                            genre: ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'Country'],
                            mood: ['Happy', 'Sad', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Mysterious'],
                            tempo: ['Slow', 'Medium', 'Fast', 'Variable']
                        }
                    },
                    'sound-effects': { 
                        name: 'Sound Effects', 
                        attributes: ['Category', 'Duration', 'Loop Ready', 'Environment'],
                        filters: {
                            category: ['Nature', 'Urban', 'Mechanical', 'Electronic', 'Human', 'Animals'],
                            duration: ['Under 5s', '5-30s', '30s-2min', 'Over 2min']
                        }
                    },
                    'beats': { 
                        name: 'Beats & Loops', 
                        attributes: ['BPM', 'Key', 'Style', 'Instruments', 'Loop Length'],
                        filters: {
                            bpm: ['60-80', '80-100', '100-120', '120-140', '140+'],
                            style: ['Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Trap']
                        }
                    }
                }
            },
            'videos': {
                name: 'Videos & Animation',
                attributes: ['Format', 'Resolution', 'Frame Rate', 'Duration', 'License Type', 'Audio Included'],
                required: ['Format', 'Resolution', 'License Type'],
                subcategories: {
                    'stock-footage': { 
                        name: 'Stock Footage', 
                        attributes: ['Subject', 'Style', 'Camera Movement', 'Lighting'],
                        filters: {
                            subject: ['Nature', 'Business', 'Technology', 'People', 'Abstract', 'Travel'],
                            style: ['Cinematic', 'Documentary', 'Time-lapse', 'Slow Motion'],
                            resolution: ['HD (1080p)', '4K (2160p)', '8K', 'Ultra HD']
                        }
                    },
                    'animations': { 
                        name: 'Animations', 
                        attributes: ['Animation Type', 'Style', 'Character Count', 'Background'],
                        filters: {
                            animationType: ['2D', '3D', 'Motion Graphics', 'Whiteboard', 'Stop Motion'],
                            style: ['Cartoon', 'Realistic', 'Minimalist', 'Corporate', 'Artistic']
                        }
                    },
                    'tutorials': { 
                        name: 'Educational Videos', 
                        attributes: ['Subject', 'Skill Level', 'Duration', 'Language', 'Instructor'],
                        filters: {
                            subject: ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music'],
                            skillLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
                        }
                    }
                }
            },
            'courses': {
                name: 'Online Courses',
                attributes: ['Subject', 'Level', 'Duration', 'Language', 'Certification', 'Format'],
                required: ['Subject', 'Level', 'Duration'],
                subcategories: {
                    'programming': { 
                        name: 'Programming & Development', 
                        attributes: ['Programming Language', 'Framework', 'Project Included', 'Prerequisites'],
                        filters: {
                            language: ['JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust'],
                            framework: ['React', 'Angular', 'Vue', 'Node.js', 'Django', 'Laravel', 'Spring']
                        }
                    },
                    'design': { 
                        name: 'Design & Creative', 
                        attributes: ['Design Type', 'Software', 'Portfolio Projects', 'Style Focus'],
                        filters: {
                            designType: ['UI/UX', 'Graphic Design', 'Web Design', 'Brand Design', 'Illustration'],
                            software: ['Adobe Creative Suite', 'Figma', 'Sketch', 'Canva', 'Procreate']
                        }
                    },
                    'business': { 
                        name: 'Business & Marketing', 
                        attributes: ['Business Area', 'Case Studies', 'Tools Covered', 'Industry Focus'],
                        filters: {
                            businessArea: ['Marketing', 'Sales', 'Management', 'Finance', 'Entrepreneurship', 'HR'],
                            industryFocus: ['E-commerce', 'SaaS', 'Retail', 'Healthcare', 'Education', 'General']
                        }
                    }
                }
            },
            'nft': {
                name: 'NFTs & Digital Art',
                attributes: ['Blockchain', 'Collection', 'Rarity', 'Utility', 'Artist', 'Mint Date'],
                required: ['Blockchain', 'Collection', 'Rarity'],
                subcategories: {
                    'art': { 
                        name: 'Digital Art', 
                        attributes: ['Art Style', 'Medium', 'Dimensions', 'Color Palette'],
                        filters: {
                            artStyle: ['Abstract', 'Realistic', 'Cartoon', 'Pixel Art', 'Minimalist', 'Surreal'],
                            medium: ['Digital Painting', 'Photography', '3D Render', 'AI Generated', 'Mixed Media']
                        }
                    },
                    'collectibles': { 
                        name: 'Collectibles', 
                        attributes: ['Collection Size', 'Traits', 'Rarity Score', 'Community'],
                        filters: {
                            blockchain: ['Ethereum', 'Polygon', 'Solana', 'Cardano', 'Tezos'],
                            rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
                        }
                    },
                    'utility': { 
                        name: 'Utility NFTs', 
                        attributes: ['Utility Type', 'Access Rights', 'Expiration', 'Transferable'],
                        filters: {
                            utilityType: ['Game Items', 'Membership', 'Access Pass', 'Voting Rights', 'Rewards']
                        }
                    }
                }
            }
        }
    }
};

// New Zealand specific data
export const NZ_DATA = {
    regions: [
        'Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Gisborne',
        'Hawke\'s Bay', 'Taranaki', 'Manawatū-Whanganui', 'Wellington',
        'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury',
        'Timaru', 'Otago', 'Southland'
    ],
    cities: {
        auckland: ['Auckland Central', 'North Shore', 'Waitakere', 'Manukau', 'Papakura', 'Franklin'],
        wellington: ['Wellington Central', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti Coast'],
        christchurch: ['Christchurch Central', 'Riccarton', 'Papanui', 'Fendalton', 'Cashmere'],
        hamilton: ['Hamilton Central', 'Hamilton East', 'Hamilton West', 'Hillcrest'],
        tauranga: ['Tauranga Central', 'Mount Maunganui', 'Papamoa', 'Bethlehem'],
        dunedin: ['Dunedin Central', 'North Dunedin', 'South Dunedin', 'Mosgiel']
    },
    shippingZones: {
        'metro-auckland': { name: 'Metro Auckland', baseRate: 5.99 },
        'metro-wellington': { name: 'Metro Wellington', baseRate: 5.99 },
        'metro-christchurch': { name: 'Metro Christchurch', baseRate: 5.99 },
        'north-island': { name: 'North Island', baseRate: 9.99 },
        'south-island': { name: 'South Island', baseRate: 12.99 },
        'rural': { name: 'Rural Areas', baseRate: 15.99 }
    }
};

// Utility functions for the enhanced category system
export const findCategoryPath = (categoryId, subcategoryId, subSubcategoryId) => {
    const category = ENHANCED_CATEGORIES[categoryId];
    if (!category) return null;

    const path = [{ id: categoryId, name: category.name, level: 0 }];

    if (subcategoryId && category.subcategories?.[subcategoryId]) {
        const subcategory = category.subcategories[subcategoryId];
        path.push({ id: subcategoryId, name: subcategory.name, level: 1 });

        if (subSubcategoryId && subcategory.subcategories?.[subSubcategoryId]) {
            const subSubcategory = subcategory.subcategories[subSubcategoryId];
            path.push({ id: subSubcategoryId, name: subSubcategory.name, level: 2 });
        }
    }

    return path;
};

export const getBrandsForCategory = (categoryId, subcategoryId, subSubcategoryId) => {
    const category = ENHANCED_CATEGORIES[categoryId];
    if (!category) return null;

    let targetCategory = category;
    
    if (subcategoryId) {
        targetCategory = targetCategory.subcategories?.[subcategoryId];
        if (!targetCategory) return null;
        
        if (subSubcategoryId) {
            targetCategory = targetCategory.subcategories?.[subSubcategoryId];
            if (!targetCategory) return null;
        }
    }

    return targetCategory.brands || null;
};

export const getAttributesForCategory = (categoryId, subcategoryId, subSubcategoryId) => {
    const category = ENHANCED_CATEGORIES[categoryId];
    if (!category) return [];

    let targetCategory = category;
    
    if (subcategoryId) {
        targetCategory = targetCategory.subcategories?.[subcategoryId];
        if (!targetCategory) return [];
        
        if (subSubcategoryId) {
            targetCategory = targetCategory.subcategories?.[subSubcategoryId];
            if (!targetCategory) return [];
        }
    }

    return {
        attributes: targetCategory.attributes || [],
        required: targetCategory.required || [],
        filters: targetCategory.filters || {}
    };
};

export const getFiltersForCategory = (categoryId, subcategoryId, subSubcategoryId) => {
    const categoryData = getAttributesForCategory(categoryId, subcategoryId, subSubcategoryId);
    return categoryData.filters || {};
};

export default ENHANCED_CATEGORIES;