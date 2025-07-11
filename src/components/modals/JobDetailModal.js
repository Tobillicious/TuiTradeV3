// Job Detail Modal - Seek.co.nz Style Job Details
// Complete job information display with application functionality

import React, { useState } from 'react';
import { 
    X, MapPin, Clock, DollarSign, Calendar, Building, 
    Heart, Share2, Star, ChevronRight, Users, Award,
    CheckCircle, AlertCircle, ExternalLink, Mail, Phone
} from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, NZ_LOCATIONS } from '../../lib/jobsData';

const JobDetailModal = ({ 
    job, 
    isOpen, 
    onClose, 
    onApplyJob, 
    onSaveJob, 
    isWatched = false, 
    currentUser 
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showApplicationForm, setShowApplicationForm] = useState(false);

    if (!isOpen || !job) return null;

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

    const handleApplyJob = () => {
        if (!currentUser) {
            alert('Please log in to apply for jobs');
            return;
        }
        setShowApplicationForm(true);
    };

    const handleSaveJob = () => {
        if (!currentUser) {
            alert('Please log in to save jobs');
            return;
        }
        onSaveJob(job.id);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `${job.title} at ${job.company}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const ApplicationForm = () => {
        const [applicationData, setApplicationData] = useState({
            coverLetter: '',
            resume: null,
            additionalInfo: ''
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onApplyJob(job, applicationData);
            setShowApplicationForm(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                            <button
                                onClick={() => setShowApplicationForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Letter *
                                </label>
                                <textarea
                                    rows={6}
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Why are you interested in this position?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resume/CV *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setApplicationData({...applicationData, resume: e.target.files[0]})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Accepted formats: PDF, DOC, DOCX (max 5MB)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Information
                                </label>
                                <textarea
                                    rows={4}
                                    value={applicationData.additionalInfo}
                                    onChange={(e) => setApplicationData({...applicationData, additionalInfo: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Any additional information you'd like to share..."
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Submit Application
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowApplicationForm(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={job.logo || `https://via.placeholder.com/60x60?text=${job.company.charAt(0)}`}
                                    alt={job.company}
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                    <p className="text-lg text-gray-600">{job.company}</p>
                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <MapPin size={14} className="mr-1" />
                                            <span>{getLocationDisplay(job.region)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            <span>Posted {getTimeAgo(job.postedDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSaveJob}
                                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                                        isWatched ? 'text-red-500' : 'text-gray-400'
                                    }`}
                                    title={isWatched ? 'Remove from saved jobs' : 'Save job'}
                                >
                                    <Heart size={20} fill={isWatched ? 'currentColor' : 'none'} />
                                </button>
                                
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                                    title="Share job"
                                >
                                    <Share2 size={20} />
                                </button>
                                
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center space-x-4">
                            <button
                                onClick={handleApplyJob}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Apply Now
                            </button>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <DollarSign size={16} className="mr-1" />
                                    <span>{getSalaryDisplay(job.salary)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={16} className="mr-1" />
                                    <span>{getJobTypeDisplay(job.type)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Featured Badge */}
                        {job.featured && (
                            <div className="mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                    <Star size={14} className="mr-1" />
                                    Featured Job
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('company')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'company'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Company
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Job Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed">
                                            {job.description}
                                        </p>
                                        <p className="text-gray-700 leading-relaxed mt-4">
                                            This is an exciting opportunity to join a dynamic team and make a significant impact in the {getCategoryDisplay(job.category)} sector. We're looking for someone who is passionate about their work and eager to contribute to our growing company.
                                        </p>
                                    </div>
                                </div>

                                {/* Requirements */}
                                {job.requirements && job.requirements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                                        <ul className="space-y-2">
                                            {job.requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                                    <span className="text-gray-700">{requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Benefits */}
                                {job.benefits && job.benefits.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {job.benefits.map((benefit, index) => (
                                                <div key={index} className="flex items-center">
                                                    <Award size={16} className="text-blue-500 mr-2 flex-shrink-0" />
                                                    <span className="text-gray-700">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Job Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Employment Type</h4>
                                            <p className="text-gray-700">{getJobTypeDisplay(job.type)}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                                            <p className="text-gray-700">{getSalaryDisplay(job.salary)}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                                            <p className="text-gray-700">{getLocationDisplay(job.region)}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Industry</h4>
                                            <p className="text-gray-700">{getCategoryDisplay(job.category)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'company' && (
                            <div className="space-y-8">
                                {/* Company Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About {job.company}</h3>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed">
                                            {job.company} is a leading company in the {getCategoryDisplay(job.category)} industry, 
                                            committed to delivering exceptional results and fostering a collaborative work environment. 
                                            We pride ourselves on innovation, quality, and our people-first approach.
                                        </p>
                                        <p className="text-gray-700 leading-relaxed mt-4">
                                            Our team is passionate about what we do and we're always looking for talented 
                                            individuals who share our values and want to make a meaningful impact.
                                        </p>
                                    </div>
                                </div>

                                {/* Company Stats */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Statistics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">50+</div>
                                            <div className="text-sm text-gray-600">Employees</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">5+</div>
                                            <div className="text-sm text-gray-600">Years in Business</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">10+</div>
                                            <div className="text-sm text-gray-600">Open Positions</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <Building size={16} className="text-gray-400 mr-3" />
                                            <span className="text-gray-700">{job.company}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin size={16} className="text-gray-400 mr-3" />
                                            <span className="text-gray-700">{getLocationDisplay(job.region)}, New Zealand</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail size={16} className="text-gray-400 mr-3" />
                                            <span className="text-gray-700">careers@{job.company.toLowerCase().replace(/\s+/g, '')}.co.nz</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Job ID: {job.id} • Posted {getTimeAgo(job.postedDate)}
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleSaveJob}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${
                                        isWatched
                                            ? 'border-red-300 text-red-600 hover:bg-red-50'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {isWatched ? 'Unsave Job' : 'Save Job'}
                                </button>
                                <button
                                    onClick={handleApplyJob}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Form Modal */}
            {showApplicationForm && <ApplicationForm />}
        </>
    );
};

export default JobDetailModal;