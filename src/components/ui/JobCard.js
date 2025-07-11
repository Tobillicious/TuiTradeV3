// Job Card Component - Seek.co.nz Style Job Listing
// Individual job listing card with all essential information

import React from 'react';
import { 
    MapPin, Clock, DollarSign, Building, Calendar, 
    Heart, Share2, Star, ChevronRight 
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, NZ_LOCATIONS } from '../../lib/jobsData';

const JobCard = ({ 
    job, 
    onJobClick, 
    onSaveJob, 
    onApplyJob, 
    isWatched = false, 
    showCompanyLogo = true,
    compact = false 
}) => {
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

    return (
        <div 
            onClick={handleCardClick}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300 ${
                job.featured ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
            } ${compact ? 'p-4' : 'p-6'}`}
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

                        {/* Job Description Preview */}
                        {!compact && (
                            <div className="mt-3">
                                <p className="text-gray-700 text-sm line-clamp-2">
                                    {job.description}
                                </p>
                            </div>
                        )}

                        {/* Job Tags/Skills */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {job.requirements.slice(0, 3).map((requirement, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                    >
                                        {requirement}
                                    </span>
                                ))}
                                {job.requirements.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                        +{job.requirements.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Benefits Preview */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {job.benefits.slice(0, 2).map((benefit, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
                                    >
                                        {benefit}
                                    </span>
                                ))}
                                {job.benefits.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                        +{job.benefits.length - 2} benefits
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleApplyJob}
                                    className="job-action-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Apply Now
                                </button>
                                
                                <button
                                    onClick={handleCardClick}
                                    className="job-action-button text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center"
                                >
                                    View Details
                                    <ChevronRight size={16} className="ml-1" />
                                </button>
                            </div>

                            <div className="text-xs text-gray-500">
                                {getCategoryDisplay(job.category)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;