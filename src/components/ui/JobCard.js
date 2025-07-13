// Job Card Component - Seek.co.nz Style Job Listing
// Individual job listing card with all essential information

import React from 'react';
import { 
    MapPin, Clock, DollarSign, Calendar, 
    Heart, Share2, Star, ChevronRight 
} from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, NZ_LOCATIONS } from '../../lib/jobsData';

const JobCard = ({ 
    job, 
    onJobClick, 
    onSaveJob, 
    onApplyJob, 
    isWatched = false, 
    showCompanyLogo = true,
    compact = false,
    autoSize = true // New prop for automatic sizing
}) => {
    
    // Calculate dynamic card size based on content and importance
    const calculateCardSize = () => {
        if (!autoSize) return compact ? 'small' : 'medium';
        
        let score = 0;
        
        // Content richness scoring
        if (job.description?.length > 200) score += 2;
        else if (job.description?.length > 100) score += 1;
        
        if (job.requirements?.length > 5) score += 2;
        else if (job.requirements?.length > 2) score += 1;
        
        if (job.benefits?.length > 3) score += 1;
        
        // Priority scoring
        if (job.featured) score += 3;
        if (job.salary === 'high' || job.salary === 'very-high') score += 2;
        if (job.urgent) score += 2;
        
        // Recency scoring (newer jobs get larger cards)
        const daysOld = Math.floor((new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24));
        if (daysOld <= 1) score += 2;
        else if (daysOld <= 7) score += 1;
        
        // Company tier scoring
        const bigCompanies = ['microsoft', 'google', 'apple', 'amazon', 'meta'];
        if (bigCompanies.some(company => job.company.toLowerCase().includes(company))) score += 2;
        
        // Determine size based on score
        if (score >= 8) return 'hero';
        if (score >= 5) return 'large';
        if (score >= 3) return 'medium';
        return 'small';
    };
    
    const cardSize = calculateCardSize();
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const getSalaryDisplay = (salaryRange) => {
        if (!salaryRange || !SALARY_RANGES[salaryRange]) return 'Salary not specified';
        return SALARY_RANGES[salaryRange];
    };

    const getJobTypeDisplay = (type) => {
        return JOB_TYPES[type] || type;
    };

    const getCategoryDisplay = (categoryKey) => {
        const category = JOB_CATEGORIES[categoryKey];
        return category ? category.name : categoryKey;
    };

    const getLocationDisplay = (region) => {
        const location = Object.values(NZ_LOCATIONS).find(loc => 
            loc.name.toLowerCase() === region.toLowerCase()
        );
        return location ? location.name : region;
    };

    const handleCardClick = (e) => {
        // Prevent card click when clicking on action buttons
        if (e.target.closest('.job-action-button')) return;
        onJobClick(job);
    };

    const handleSaveJob = (e) => {
        e.stopPropagation();
        onSaveJob(job.id);
    };

    const handleApplyJob = (e) => {
        e.stopPropagation();
        onApplyJob(job);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `${job.title} at ${job.company}`,
                url: window.location.href
            });
        } else {
            // Fallback to copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Dynamic styling based on card size
    const getSizeClasses = () => {
        const baseClasses = "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300";
        const featuredRing = job.featured ? 'ring-2 ring-blue-500 ring-opacity-20' : '';
        
        switch (cardSize) {
            case 'hero':
                return `${baseClasses} ${featuredRing} p-8 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl bg-gradient-to-br from-blue-50 to-white border-blue-200`;
            case 'large':
                return `${baseClasses} ${featuredRing} p-6 transform hover:scale-[1.01] shadow-md hover:shadow-xl`;
            case 'medium':
                return `${baseClasses} ${featuredRing} p-5 hover:shadow-lg`;
            case 'small':
                return `${baseClasses} ${featuredRing} p-4 text-sm`;
            default:
                return `${baseClasses} ${featuredRing} p-5`;
        }
    };

    return (
        <div 
            onClick={handleCardClick}
            className={getSizeClasses()}
        >
            {/* Featured Badge */}
            {job.featured && (
                <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <Star size={12} className="mr-1" />
                        Featured
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    {showCompanyLogo && (
                        <div className="flex-shrink-0">
                            <img 
                                src={job.logo || `https://via.placeholder.com/60x60?text=${job.company.charAt(0)}`}
                                alt={job.company}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                        </div>
                    )}

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-gray-600 font-medium">{job.company}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 ml-4">
                                <button
                                    onClick={handleSaveJob}
                                    className={`job-action-button p-2 rounded-full hover:bg-gray-100 transition-colors ${
                                        isWatched ? 'text-red-500' : 'text-gray-400'
                                    }`}
                                    title={isWatched ? 'Remove from saved jobs' : 'Save job'}
                                >
                                    <Heart size={18} fill={isWatched ? 'currentColor' : 'none'} />
                                </button>
                                
                                <button
                                    onClick={handleShare}
                                    className="job-action-button p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                                    title="Share job"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Job Meta Information */}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-1 text-gray-400" />
                                <span>{getLocationDisplay(job.region)}</span>
                            </div>

                            <div className="flex items-center">
                                <DollarSign size={16} className="mr-1 text-gray-400" />
                                <span>{getSalaryDisplay(job.salary)}</span>
                            </div>

                            <div className="flex items-center">
                                <Clock size={16} className="mr-1 text-gray-400" />
                                <span>{getJobTypeDisplay(job.type)}</span>
                            </div>

                            <div className="flex items-center">
                                <Calendar size={16} className="mr-1 text-gray-400" />
                                <span>{getTimeAgo(job.postedDate)}</span>
                            </div>
                        </div>

                        {/* Job Description Preview - Size-aware */}
                        {cardSize !== 'small' && (
                            <div className="mt-3">
                                <p className={`text-gray-700 ${
                                    cardSize === 'hero' ? 'text-base line-clamp-4' : 
                                    cardSize === 'large' ? 'text-sm line-clamp-3' : 
                                    'text-sm line-clamp-2'
                                }`}>
                                    {job.description}
                                </p>
                            </div>
                        )}

                        {/* Job Tags/Skills - Size-aware */}
                        {job.requirements && job.requirements.length > 0 && cardSize !== 'small' && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(() => {
                                    const maxTags = cardSize === 'hero' ? 6 : cardSize === 'large' ? 4 : 3;
                                    return job.requirements.slice(0, maxTags).map((requirement, index) => (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center px-2 py-1 rounded-full ${
                                                cardSize === 'hero' ? 'text-sm bg-blue-100 text-blue-800' : 'text-xs bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {requirement}
                                        </span>
                                    ));
                                })()}
                                {job.requirements.length > (cardSize === 'hero' ? 6 : cardSize === 'large' ? 4 : 3) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                        +{job.requirements.length - (cardSize === 'hero' ? 6 : cardSize === 'large' ? 4 : 3)} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Benefits Preview - Size-aware */}
                        {job.benefits && job.benefits.length > 0 && cardSize !== 'small' && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(() => {
                                    const maxBenefits = cardSize === 'hero' ? 4 : cardSize === 'large' ? 3 : 2;
                                    return job.benefits.slice(0, maxBenefits).map((benefit, index) => (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center px-2 py-1 rounded-full ${
                                                cardSize === 'hero' ? 'text-sm bg-green-100 text-green-800' : 'text-xs bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {benefit}
                                        </span>
                                    ));
                                })()}
                                {job.benefits.length > (cardSize === 'hero' ? 4 : cardSize === 'large' ? 3 : 2) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                        +{job.benefits.length - (cardSize === 'hero' ? 4 : cardSize === 'large' ? 3 : 2)} benefits
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Hero Card Special Features */}
                        {cardSize === 'hero' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">🌟 Premium Opportunity</h4>
                                        <p className="text-xs text-blue-600">High-priority position with immediate hiring</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-blue-600 font-medium">Quick Apply</div>
                                        <div className="text-xs text-blue-500">⚡ Fast response</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Size-aware */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className={`flex items-center ${cardSize === 'hero' ? 'space-x-4' : 'space-x-3'}`}>
                                <button
                                    onClick={handleApplyJob}
                                    className={`job-action-button bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                                        cardSize === 'hero' ? 'px-6 py-3 text-base' : 
                                        cardSize === 'large' ? 'px-5 py-2.5 text-sm' : 
                                        'px-4 py-2 text-sm'
                                    }`}
                                >
                                    {cardSize === 'hero' ? '🚀 Apply Now' : 'Apply Now'}
                                </button>
                                
                                {cardSize !== 'small' && (
                                    <button
                                        onClick={handleCardClick}
                                        className={`job-action-button text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center ${
                                            cardSize === 'hero' ? 'text-base' : 'text-sm'
                                        }`}
                                    >
                                        View Details
                                        <ChevronRight size={cardSize === 'hero' ? 18 : 16} className="ml-1" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`${cardSize === 'hero' ? 'text-sm' : 'text-xs'} text-gray-500`}>
                                    {getCategoryDisplay(job.category)}
                                </div>
                                
                                {/* Size indicator (for demo - remove in production) */}
                                <div className="text-xs text-gray-400 font-mono mt-1">
                                    {cardSize.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(JobCard);