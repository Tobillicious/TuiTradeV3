// Jobs Landing Page - Complete Seek.co.nz Style Employment Portal
// Full job marketplace with advanced search, filtering, and job listings

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, MapPin, Users, Target, Award, ChevronRight,
  BookmarkPlus, Bell, BarChart3, Zap
} from 'lucide-react';

// Import our comprehensive job data structures
import { 
  JOB_CATEGORIES, NZ_LOCATIONS, MOCK_JOBS, searchJobs 
} from '../../lib/jobsData';
import { getBilingualText, TE_REO_TRANSLATIONS } from '../../lib/nzLocalizationEnhanced';

// Import job-specific components
import JobCard from '../ui/JobCard';
import { usePerformanceMonitor } from '../ui/PerformanceOptimizer';

const JobsLanding = ({ onNavigate }) => {
  // Performance monitoring
  usePerformanceMonitor('JobsLanding');

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    // Initialize with mock data - in real app this would come from API
    setFeaturedJobs(MOCK_JOBS.filter(job => job.featured));
    setRecentJobs(MOCK_JOBS.slice(0, 6));
  }, []);

  const handleSearch = useCallback((filters) => {
    const results = searchJobs(filters);
    // Navigate to search results page with filters
    onNavigate('search-results', { filters, results, searchType: 'jobs' });
  }, [onNavigate]);

  const handleJobClick = useCallback((job) => {
    onNavigate('item-detail', { 
      id: job.id, 
      type: 'job',
      job: job 
    });
  }, [onNavigate]);

  const handleCategoryClick = useCallback((categoryKey) => {
    const category = JOB_CATEGORIES[categoryKey];
    onNavigate('category', { 
      category: 'jobs',
      subcategory: categoryKey,
      title: category.name,
      jobCategory: categoryKey
    });
  }, [onNavigate]);

  const handleSaveJob = useCallback((jobId) => {
    // Implement save job functionality
    console.log('Save job:', jobId);
  }, []);

  const handleApplyJob = useCallback((job) => {
    // Implement job application functionality
    console.log('Apply for job:', job);
    onNavigate('job-application', { job });
  }, [onNavigate]);

  // Memoize expensive calculations
  const topCategories = useMemo(() => 
    Object.entries(JOB_CATEGORIES)
      .sort((a, b) => b[1].jobCount - a[1].jobCount)
      .slice(0, 12)
      .map(([key, category]) => ({ key, ...category })),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {getBilingualText('Find Your Dream Job', 'find_your_next_role')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-2">
              Discover thousands of opportunities across Aotearoa New Zealand
            </p>
            <p className="text-lg text-green-200">
              {TE_REO_TRANSLATIONS.phrases.find_your_next_role} - Kia kaha, kia maia!
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-lg"
                  />
                </div>
                
                <div className="lg:w-64 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 appearance-none">
                    <option>All New Zealand</option>
                    {Object.entries(NZ_LOCATIONS).map(([key, location]) => (
                      <option key={key} value={key}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => handleSearch({})}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Search size={20} className="mr-2" />
                  Search Jobs
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Popular searches:</span>
                {['Software Developer', 'Nurse', 'Teacher', 'Manager', 'Electrician'].map((term) => (
                  <button
                    key={term}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">15,000+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">2,500+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">50K+</div>
              <div className="text-gray-600">Daily Views</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">89%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Browse by Category Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {getBilingualText('Browse by Category', 'browse_categories')}
              </h2>
              <p className="text-gray-600">Find opportunities in your field of expertise</p>
            </div>
            <button className="text-green-600 hover:text-green-700 font-semibold flex items-center">
              View All Categories <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {topCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryClick(category.key)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all group"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {category.jobCount.toLocaleString()} jobs
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getBilingualText('Featured Jobs', 'featured_jobs')}
                </h2>
                <p className="text-gray-600">Premium opportunities from top employers</p>
              </div>
              <button className="text-green-600 hover:text-green-700 font-semibold flex items-center">
                View All Featured <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onJobClick={handleJobClick}
                  onSaveJob={handleSaveJob}
                  onApplyJob={handleApplyJob}
                  showCompanyLogo={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Jobs Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {getBilingualText('Latest Jobs', 'latest_jobs')}
              </h2>
              <p className="text-gray-600">Fresh opportunities posted today</p>
            </div>
            <button className="text-green-600 hover:text-green-700 font-semibold flex items-center">
              View All Recent <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onJobClick={handleJobClick}
                onSaveJob={handleSaveJob}
                onApplyJob={handleApplyJob}
                compact={true}
              />
            ))}
          </div>
        </section>

        {/* Features & Benefits Section */}
        <section className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose TuiTrade Jobs?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aotearoa's most trusted job platform connecting talent with opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Job Matching</h3>
              <p className="text-gray-600">
                AI-powered recommendations based on your skills, experience, and career goals.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Employers</h3>
              <p className="text-gray-600">
                All employers are verified with company profiles, reviews, and salary transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Bell className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
              <p className="text-gray-600">
                Get instant notifications for new jobs matching your criteria and application updates.
              </p>
            </div>
          </div>
        </section>

        {/* Career Resources Section */}
        <section className="bg-white rounded-lg border p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Career Resources & Tips
            </h2>
            <p className="text-gray-600">
              Tools and advice to help you succeed in your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all">
              <BookmarkPlus className="text-green-600 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Resume Builder</h3>
              <p className="text-sm text-gray-600">Create a professional CV that stands out</p>
            </button>

            <button className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all">
              <BarChart3 className="text-green-600 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Salary Guide</h3>
              <p className="text-sm text-gray-600">Discover salary ranges for your role</p>
            </button>

            <button className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all">
              <Users className="text-green-600 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Interview Tips</h3>
              <p className="text-sm text-gray-600">Ace your next job interview</p>
            </button>

            <button className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all">
              <Zap className="text-green-600 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Career Advice</h3>
              <p className="text-sm text-gray-600">Expert guidance for career growth</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(JobsLanding);