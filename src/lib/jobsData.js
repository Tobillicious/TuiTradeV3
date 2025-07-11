// Jobs Data Structure - Based on Seek.co.nz Categories and Filters
// Complete job categories, subcategories, and search parameters

export const JOB_CATEGORIES = {
  'accounting': {
    name: 'Accounting',
    icon: '📊',
    jobCount: 2847,
    subcategories: {
      'accounts-payable-receivable': 'Accounts Payable & Receivable',
      'bookkeeping': 'Bookkeeping',
      'corporate-reporting': 'Corporate Reporting',
      'cost-accounting': 'Cost Accounting',
      'financial-accounting': 'Financial Accounting',
      'forensic-accounting': 'Forensic Accounting',
      'management-accounting': 'Management Accounting',
      'tax-accounting': 'Tax Accounting',
      'other-accounting': 'Other Accounting'
    }
  },
  'administration': {
    name: 'Administration & Office Support',
    icon: '🏢',
    jobCount: 3421,
    subcategories: {
      'administration': 'Administration',
      'clerical-office-support': 'Clerical & Office Support',
      'data-entry': 'Data Entry',
      'executive-assistant': 'Executive Assistant',
      'personal-assistant': 'Personal Assistant',
      'reception': 'Reception',
      'secretarial': 'Secretarial',
      'other-admin': 'Other Admin & Office Support'
    }
  },
  'advertising': {
    name: 'Advertising, Arts & Media',
    icon: '🎨',
    jobCount: 1234,
    subcategories: {
      'advertising-marketing': 'Advertising & Marketing',
      'design-architecture': 'Design & Architecture',
      'editorial-writing': 'Editorial & Writing',
      'film-television': 'Film & Television',
      'music-theatre': 'Music & Theatre',
      'photography': 'Photography',
      'print-publishing': 'Print & Publishing',
      'radio-podcasting': 'Radio & Podcasting',
      'web-multimedia': 'Web & Multimedia Design'
    }
  },
  'banking': {
    name: 'Banking & Financial Services',
    icon: '🏦',
    jobCount: 1876,
    subcategories: {
      'banking': 'Banking',
      'financial-planning': 'Financial Planning',
      'funds-management': 'Funds Management',
      'insurance': 'Insurance',
      'investment-advisory': 'Investment Advisory',
      'risk-management': 'Risk Management',
      'superannuation': 'Superannuation',
      'other-banking': 'Other Banking & Financial Services'
    }
  },
  'call-centre': {
    name: 'Call Centre & Customer Service',
    icon: '📞',
    jobCount: 2156,
    subcategories: {
      'call-centre': 'Call Centre',
      'customer-service': 'Customer Service',
      'help-desk': 'Help Desk & Technical Support',
      'telesales': 'Telesales',
      'other-call-centre': 'Other Call Centre & Customer Service'
    }
  },
  'ceo-general-management': {
    name: 'CEO & General Management',
    icon: '👔',
    jobCount: 567,
    subcategories: {
      'ceo-managing-director': 'CEO & Managing Director',
      'general-manager': 'General Manager',
      'business-manager': 'Business Manager',
      'operations-manager': 'Operations Manager',
      'other-management': 'Other General Management'
    }
  },
  'community-services': {
    name: 'Community Services & Development',
    icon: '🤝',
    jobCount: 1890,
    subcategories: {
      'community-development': 'Community Development',
      'counselling': 'Counselling',
      'disabilities-services': 'Disabilities Services',
      'family-services': 'Family Services',
      'housing-services': 'Housing Services',
      'social-work': 'Social Work',
      'volunteer-coordination': 'Volunteer Coordination',
      'youth-work': 'Youth Work',
      'other-community': 'Other Community Services'
    }
  },
  'construction': {
    name: 'Construction',
    icon: '🏗️',
    jobCount: 4567,
    subcategories: {
      'bricklaying': 'Bricklaying',
      'carpentry': 'Carpentry',
      'concreting': 'Concreting',
      'electrical': 'Electrical',
      'landscaping': 'Landscaping',
      'painting': 'Painting & Decorating',
      'plumbing': 'Plumbing',
      'roofing': 'Roofing',
      'surveying': 'Surveying',
      'other-construction': 'Other Construction'
    }
  },
  'consulting-strategy': {
    name: 'Consulting & Strategy',
    icon: '💼',
    jobCount: 1432,
    subcategories: {
      'business-consulting': 'Business Consulting',
      'change-management': 'Change Management',
      'hr-consulting': 'HR Consulting',
      'it-consulting': 'IT Consulting',
      'management-consulting': 'Management Consulting',
      'strategy-planning': 'Strategy & Planning',
      'other-consulting': 'Other Consulting'
    }
  },
  'education-training': {
    name: 'Education & Training',
    icon: '📚',
    jobCount: 3456,
    subcategories: {
      'early-childhood': 'Early Childhood',
      'primary-teaching': 'Primary Teaching',
      'secondary-teaching': 'Secondary Teaching',
      'tertiary-education': 'Tertiary Education',
      'training-development': 'Training & Development',
      'tutoring': 'Tutoring',
      'other-education': 'Other Education & Training'
    }
  },
  'engineering': {
    name: 'Engineering',
    icon: '⚙️',
    jobCount: 2987,
    subcategories: {
      'civil-engineering': 'Civil Engineering',
      'electrical-engineering': 'Electrical Engineering',
      'mechanical-engineering': 'Mechanical Engineering',
      'software-engineering': 'Software Engineering',
      'structural-engineering': 'Structural Engineering',
      'environmental-engineering': 'Environmental Engineering',
      'other-engineering': 'Other Engineering'
    }
  },
  'farming-animals': {
    name: 'Farming, Animals & Conservation',
    icon: '🚜',
    jobCount: 1876,
    subcategories: {
      'agriculture': 'Agriculture',
      'animal-care': 'Animal Care',
      'conservation': 'Conservation',
      'dairy-farming': 'Dairy Farming',
      'fishing-aquaculture': 'Fishing & Aquaculture',
      'forestry': 'Forestry',
      'horticulture': 'Horticulture',
      'livestock': 'Livestock',
      'veterinary': 'Veterinary',
      'other-farming': 'Other Farming & Animals'
    }
  },
  'government-defence': {
    name: 'Government & Defence',
    icon: '🏛️',
    jobCount: 2345,
    subcategories: {
      'defence': 'Defence',
      'government-relations': 'Government Relations',
      'local-government': 'Local Government',
      'policy-development': 'Policy Development',
      'public-service': 'Public Service',
      'regulatory-affairs': 'Regulatory Affairs',
      'other-government': 'Other Government'
    }
  },
  'healthcare-medical': {
    name: 'Healthcare & Medical',
    icon: '🏥',
    jobCount: 4321,
    subcategories: {
      'allied-health': 'Allied Health',
      'dentistry': 'Dentistry',
      'medical-administration': 'Medical Administration',
      'medical-technology': 'Medical Technology',
      'nursing': 'Nursing',
      'pharmacy': 'Pharmacy',
      'psychology': 'Psychology',
      'surgery': 'Surgery',
      'other-healthcare': 'Other Healthcare & Medical'
    }
  },
  'hospitality-tourism': {
    name: 'Hospitality & Tourism',
    icon: '🏨',
    jobCount: 2987,
    subcategories: {
      'accommodation': 'Accommodation',
      'bar-work': 'Bar Work',
      'chefs-cooks': 'Chefs & Cooks',
      'front-office': 'Front Office',
      'gaming': 'Gaming',
      'housekeeping': 'Housekeeping',
      'kitchen-hand': 'Kitchen Hand',
      'restaurant-service': 'Restaurant Service',
      'tour-guiding': 'Tour Guiding',
      'travel-agents': 'Travel Agents',
      'other-hospitality': 'Other Hospitality & Tourism'
    }
  },
  'human-resources': {
    name: 'Human Resources & Recruitment',
    icon: '👥',
    jobCount: 1654,
    subcategories: {
      'employee-relations': 'Employee Relations',
      'hr-information-systems': 'HR Information Systems',
      'hr-management': 'HR Management',
      'occupational-health': 'Occupational Health & Safety',
      'recruitment': 'Recruitment',
      'remuneration-benefits': 'Remuneration & Benefits',
      'training-development': 'Training & Development',
      'other-hr': 'Other Human Resources'
    }
  },
  'information-technology': {
    name: 'Information & Communication Technology',
    icon: '💻',
    jobCount: 3789,
    subcategories: {
      'business-systems-analysts': 'Business & Systems Analysts',
      'computer-operators': 'Computer Operators',
      'cyber-security': 'Cyber Security',
      'database-development': 'Database Development & Administration',
      'developers-programmers': 'Developers/Programmers',
      'hardware-networking': 'Hardware & Networking',
      'helpdesk-support': 'Helpdesk & Support',
      'management-executives': 'Management & Executive',
      'project-management': 'Project Management',
      'software-testing': 'Software Testing',
      'systems-administration': 'Systems Administration',
      'telecommunications': 'Telecommunications',
      'web-development': 'Web Development',
      'other-it': 'Other Information Technology'
    }
  },
  'insurance-superannuation': {
    name: 'Insurance & Superannuation',
    icon: '🛡️',
    jobCount: 987,
    subcategories: {
      'claims': 'Claims',
      'insurance-broking': 'Insurance Broking',
      'life-insurance': 'Life Insurance',
      'risk-management': 'Risk Management',
      'superannuation': 'Superannuation',
      'underwriting': 'Underwriting',
      'other-insurance': 'Other Insurance & Superannuation'
    }
  },
  'legal': {
    name: 'Legal',
    icon: '⚖️',
    jobCount: 1234,
    subcategories: {
      'barristers': 'Barristers',
      'corporate-commercial': 'Corporate & Commercial Law',
      'criminal-law': 'Criminal Law',
      'family-law': 'Family Law',
      'generalist-lawyers': 'Generalist Lawyers',
      'in-house-counsel': 'In-house Counsel',
      'legal-administration': 'Legal Administration',
      'legal-practice': 'Legal Practice Management',
      'litigation': 'Litigation',
      'paralegals': 'Paralegals',
      'property-law': 'Property Law',
      'solicitors': 'Solicitors',
      'other-legal': 'Other Legal'
    }
  },
  'manufacturing': {
    name: 'Manufacturing, Transport & Logistics',
    icon: '🏭',
    jobCount: 3456,
    subcategories: {
      'assembly-process-work': 'Assembly & Process Work',
      'freight-logistics': 'Freight & Logistics',
      'machine-operators': 'Machine Operators',
      'manufacturing': 'Manufacturing',
      'packaging': 'Packaging',
      'production-planning': 'Production Planning',
      'quality-assurance': 'Quality Assurance',
      'transport-delivery': 'Transport & Delivery',
      'warehousing-storage': 'Warehousing & Storage',
      'other-manufacturing': 'Other Manufacturing, Transport & Logistics'
    }
  },
  'marketing-communications': {
    name: 'Marketing & Communications',
    icon: '📢',
    jobCount: 2134,
    subcategories: {
      'brand-management': 'Brand Management',
      'digital-marketing': 'Digital Marketing',
      'event-management': 'Event Management',
      'market-research': 'Market Research',
      'marketing-communications': 'Marketing Communications',
      'product-marketing': 'Product Marketing',
      'public-relations': 'Public Relations',
      'social-media': 'Social Media',
      'other-marketing': 'Other Marketing & Communications'
    }
  },
  'mining-resources': {
    name: 'Mining, Resources & Energy',
    icon: '⛏️',
    jobCount: 1567,
    subcategories: {
      'coal-mining': 'Coal Mining',
      'drilling': 'Drilling',
      'energy': 'Energy',
      'environmental': 'Environmental',
      'geosciences': 'Geosciences',
      'mining-engineering': 'Mining Engineering',
      'oil-gas': 'Oil & Gas',
      'renewable-energy': 'Renewable Energy',
      'other-mining': 'Other Mining, Resources & Energy'
    }
  },
  'real-estate': {
    name: 'Real Estate & Property',
    icon: '🏘️',
    jobCount: 1432,
    subcategories: {
      'commercial-property': 'Commercial Property',
      'property-development': 'Property Development',
      'property-management': 'Property Management',
      'real-estate-sales': 'Real Estate Sales',
      'residential-property': 'Residential Property',
      'valuation': 'Valuation',
      'other-real-estate': 'Other Real Estate & Property'
    }
  },
  'retail-consumer': {
    name: 'Retail & Consumer Products',
    icon: '🛍️',
    jobCount: 4567,
    subcategories: {
      'checkout-operators': 'Checkout Operators',
      'fashion': 'Fashion',
      'merchandising': 'Merchandising',
      'retail-assistants': 'Retail Assistants',
      'retail-management': 'Retail Management',
      'store-management': 'Store Management',
      'visual-merchandising': 'Visual Merchandising',
      'other-retail': 'Other Retail & Consumer Products'
    }
  },
  'sales': {
    name: 'Sales',
    icon: '📈',
    jobCount: 3789,
    subcategories: {
      'account-management': 'Account Management',
      'business-development': 'Business Development',
      'key-account-management': 'Key Account Management',
      'sales-coordination': 'Sales Coordination',
      'sales-management': 'Sales Management',
      'sales-representatives': 'Sales Representatives',
      'technical-sales': 'Technical Sales',
      'other-sales': 'Other Sales'
    }
  },
  'science-technology': {
    name: 'Science & Technology',
    icon: '🔬',
    jobCount: 1876,
    subcategories: {
      'biotechnology': 'Biotechnology',
      'chemistry': 'Chemistry',
      'environmental-science': 'Environmental Science',
      'food-technology': 'Food Technology',
      'laboratory-work': 'Laboratory Work',
      'life-sciences': 'Life Sciences',
      'research-development': 'Research & Development',
      'other-science': 'Other Science & Technology'
    }
  },
  'self-employment': {
    name: 'Self Employment',
    icon: '👨‍💼',
    jobCount: 2345,
    subcategories: {
      'business-opportunities': 'Business Opportunities',
      'franchise': 'Franchise',
      'other-self-employment': 'Other Self Employment'
    }
  },
  'sport-recreation': {
    name: 'Sport & Recreation',
    icon: '⚽',
    jobCount: 876,
    subcategories: {
      'coaching': 'Coaching',
      'fitness-instruction': 'Fitness Instruction',
      'personal-training': 'Personal Training',
      'sports-administration': 'Sports Administration',
      'sports-development': 'Sports Development',
      'other-sport': 'Other Sport & Recreation'
    }
  },
  'trades-services': {
    name: 'Trades & Services',
    icon: '🔧',
    jobCount: 3456,
    subcategories: {
      'automotive-trades': 'Automotive Trades',
      'building-trades': 'Building Trades',
      'cleaning-services': 'Cleaning Services',
      'electrical-trades': 'Electrical Trades',
      'gardening-landscaping': 'Gardening & Landscaping',
      'hair-beauty': 'Hair & Beauty',
      'maintenance-handyman': 'Maintenance & Handyman',
      'mechanical-trades': 'Mechanical Trades',
      'plumbing-trades': 'Plumbing Trades',
      'security-services': 'Security Services',
      'other-trades': 'Other Trades & Services'
    }
  }
};

// Job Types (Employment Types)
export const JOB_TYPES = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'contract': 'Contract/Temp',
  'casual': 'Casual/Vacation',
  'internship': 'Internship'
};

// Salary Ranges (NZD per annum)
export const SALARY_RANGES = {
  'under-30k': '$0 - $30,000',
  '30k-40k': '$30,000 - $40,000',
  '40k-50k': '$40,000 - $50,000',
  '50k-60k': '$50,000 - $60,000',
  '60k-70k': '$60,000 - $70,000',
  '70k-80k': '$70,000 - $80,000',
  '80k-100k': '$80,000 - $100,000',
  '100k-120k': '$100,000 - $120,000',
  '120k-150k': '$120,000 - $150,000',
  '150k-200k': '$150,000 - $200,000',
  'over-200k': '$200,000+'
};

// Work Rights (for filtering)
export const WORK_RIGHTS = {
  'nz-citizen': 'NZ Citizen/Resident',
  'work-visa': 'Work Visa Required',
  'no-restrictions': 'No Restrictions'
};

// Experience Levels
export const EXPERIENCE_LEVELS = {
  'entry-level': 'Entry Level (0-2 years)',
  'mid-level': 'Mid Level (2-5 years)',
  'senior-level': 'Senior Level (5+ years)',
  'executive': 'Executive/Management'
};

// New Zealand Regions and Cities
export const NZ_LOCATIONS = {
  'auckland': {
    name: 'Auckland',
    region: 'Auckland',
    cities: ['Auckland Central', 'North Shore', 'Waitakere', 'Manukau', 'Papakura', 'Franklin']
  },
  'bay-of-plenty': {
    name: 'Bay of Plenty',
    region: 'Bay of Plenty',
    cities: ['Tauranga', 'Rotorua', 'Whakatane', 'Taupo']
  },
  'canterbury': {
    name: 'Canterbury',
    region: 'Canterbury',
    cities: ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora']
  },
  'gisborne': {
    name: 'Gisborne',
    region: 'Gisborne',
    cities: ['Gisborne']
  },
  'hawkes-bay': {
    name: 'Hawke\'s Bay',
    region: 'Hawke\'s Bay',
    cities: ['Napier', 'Hastings']
  },
  'manawatu-wanganui': {
    name: 'Manawatu-Wanganui',
    region: 'Manawatu-Wanganui',
    cities: ['Palmerston North', 'Wanganui', 'Levin']
  },
  'marlborough': {
    name: 'Marlborough',
    region: 'Marlborough',
    cities: ['Blenheim', 'Picton']
  },
  'nelson': {
    name: 'Nelson',
    region: 'Nelson',
    cities: ['Nelson', 'Richmond']
  },
  'northland': {
    name: 'Northland',
    region: 'Northland',
    cities: ['Whangarei', 'Kerikeri', 'Kaitaia']
  },
  'otago': {
    name: 'Otago',
    region: 'Otago',
    cities: ['Dunedin', 'Queenstown', 'Oamaru', 'Alexandra']
  },
  'southland': {
    name: 'Southland',
    region: 'Southland',
    cities: ['Invercargill', 'Gore']
  },
  'taranaki': {
    name: 'Taranaki',
    region: 'Taranaki',
    cities: ['New Plymouth', 'Hawera']
  },
  'tasman': {
    name: 'Tasman',
    region: 'Tasman',
    cities: ['Motueka', 'Takaka']
  },
  'waikato': {
    name: 'Waikato',
    region: 'Waikato',
    cities: ['Hamilton', 'Cambridge', 'Te Awamutu', 'Huntly']
  },
  'wellington': {
    name: 'Wellington',
    region: 'Wellington',
    cities: ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti Coast']
  },
  'west-coast': {
    name: 'West Coast',
    region: 'West Coast',
    cities: ['Greymouth', 'Westport', 'Hokitika']
  }
};

// Company Sizes
export const COMPANY_SIZES = {
  'startup': '1-10 employees',
  'small': '11-50 employees',
  'medium': '51-200 employees',
  'large': '201-1000 employees',
  'enterprise': '1000+ employees'
};

// Benefits commonly offered
export const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Life Insurance',
  'KiwiSaver',
  'Flexible Working',
  'Work From Home',
  'Professional Development',
  'Gym Membership',
  'Car Parking',
  'Company Car',
  'Laptop/Phone',
  'Annual Leave',
  'Sick Leave',
  'Study Leave',
  'Maternity/Paternity Leave',
  'Performance Bonuses',
  'Profit Sharing',
  'Stock Options',
  'Meal Allowance',
  'Transport Allowance'
];

// Mock job data for demonstration
export const MOCK_JOBS = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    company: 'Tech Solutions Ltd',
    location: 'Auckland Central',
    region: 'Auckland',
    category: 'information-technology',
    subcategory: 'developers-programmers',
    type: 'full-time',
    salary: '80k-100k',
    experience: 'senior-level',
    workRights: 'nz-citizen',
    postedDate: '2024-01-10',
    description: 'Join our dynamic team as a Senior Software Engineer working on cutting-edge web applications...',
    requirements: ['5+ years experience', 'React/Node.js', 'Agile methodology'],
    benefits: ['Health Insurance', 'Flexible Working', 'Professional Development'],
    logo: 'https://via.placeholder.com/60x60?text=TS',
    featured: true
  },
  {
    id: 'job-002',
    title: 'Marketing Manager',
    company: 'Creative Agency NZ',
    location: 'Wellington',
    region: 'Wellington',
    category: 'marketing-communications',
    subcategory: 'brand-management',
    type: 'full-time',
    salary: '60k-70k',
    experience: 'mid-level',
    workRights: 'no-restrictions',
    postedDate: '2024-01-09',
    description: 'Lead our marketing efforts and drive brand growth across digital and traditional channels...',
    requirements: ['3+ years marketing experience', 'Digital marketing skills', 'Team leadership'],
    benefits: ['KiwiSaver', 'Work From Home', 'Annual Leave'],
    logo: 'https://via.placeholder.com/60x60?text=CA',
    featured: false
  },
  {
    id: 'job-003',
    title: 'Registered Nurse',
    company: 'Auckland Hospital',
    location: 'Auckland Central',
    region: 'Auckland',
    category: 'healthcare-medical',
    subcategory: 'nursing',
    type: 'full-time',
    salary: '50k-60k',
    experience: 'entry-level',
    workRights: 'nz-citizen',
    postedDate: '2024-01-08',
    description: 'Join our nursing team providing quality patient care in a supportive environment...',
    requirements: ['Nursing registration', 'Patient care experience', 'Team collaboration'],
    benefits: ['Health Insurance', 'Shift Allowances', 'Professional Development'],
    logo: 'https://via.placeholder.com/60x60?text=AH',
    featured: true
  }
];

// Helper functions
export const getCategoryByKey = (key) => {
  return JOB_CATEGORIES[key] || null;
};

export const getSubcategoryName = (categoryKey, subcategoryKey) => {
  const category = JOB_CATEGORIES[categoryKey];
  if (!category || !category.subcategories) return null;
  return category.subcategories[subcategoryKey] || null;
};

export const getAllCategories = () => {
  return Object.entries(JOB_CATEGORIES).map(([key, category]) => ({
    key,
    ...category
  }));
};

export const getJobsByCategory = (categoryKey) => {
  return MOCK_JOBS.filter(job => job.category === categoryKey);
};

export const getJobsByLocation = (locationKey) => {
  return MOCK_JOBS.filter(job => job.region.toLowerCase() === locationKey.toLowerCase());
};

export const searchJobs = (filters) => {
  let results = [...MOCK_JOBS];
  
  if (filters.category) {
    results = results.filter(job => job.category === filters.category);
  }
  
  if (filters.subcategory) {
    results = results.filter(job => job.subcategory === filters.subcategory);
  }
  
  if (filters.location) {
    results = results.filter(job => 
      job.region.toLowerCase() === filters.location.toLowerCase() ||
      job.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  if (filters.type) {
    results = results.filter(job => job.type === filters.type);
  }
  
  if (filters.salary) {
    results = results.filter(job => job.salary === filters.salary);
  }
  
  if (filters.experience) {
    results = results.filter(job => job.experience === filters.experience);
  }
  
  if (filters.workRights) {
    results = results.filter(job => job.workRights === filters.workRights);
  }
  
  if (filters.keywords) {
    const keywords = filters.keywords.toLowerCase().split(' ');
    results = results.filter(job => 
      keywords.some(keyword => 
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword)
      )
    );
  }
  
  return results;
};

export default {
  JOB_CATEGORIES,
  JOB_TYPES,
  SALARY_RANGES,
  WORK_RIGHTS,
  EXPERIENCE_LEVELS,
  NZ_LOCATIONS,
  COMPANY_SIZES,
  COMMON_BENEFITS,
  MOCK_JOBS,
  getCategoryByKey,
  getSubcategoryName,
  getAllCategories,
  getJobsByCategory,
  getJobsByLocation,
  searchJobs
};