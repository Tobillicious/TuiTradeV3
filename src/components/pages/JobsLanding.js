import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import JobCard from '../ui/JobCard';
import { Briefcase, MapPin, DollarSign, Clock, Star, TrendingUp, Crown, Sparkles, Building, Users, Award, Zap } from 'lucide-react';
import { getBilingualText, TE_REO_TRANSLATIONS } from '../../lib/nzLocalizationEnhanced';

const JobsLanding = () => {
  const { onWatchToggle, watchedItems = [], onAddToCart, cartItems = [] } = useAppContext() || {};
  const navigate = useNavigate();
  
  const handleItemClick = (item) => {
    navigate(`/item/${item.id}`);
  };
  const [jobs, setJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMountedRef = useRef(true);

  const fetchJobs = useCallback(async (loadMore = false) => {
    if (!isMountedRef.current) return;
    if (!loadMore) setIsLoading(true);
    try {
      const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
      const jobsSnapshot = await getDocs(jobsQuery);

      let allJobs = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        listingType: 'job'
      }));

      // Extract featured jobs (high engagement items)
      const featured = allJobs
        .filter(job => (job.watchCount || 0) > 5 || (job.views || 0) > 50 || job.salary > 80000)
        .sort((a, b) => {
          const scoreA = (a.watchCount || 0) * 2 + (a.views || 0) * 0.1 + (a.salary || 0) * 0.001;
          const scoreB = (b.watchCount || 0) * 2 + (b.views || 0) * 0.1 + (b.salary || 0) * 0.001;
          return scoreB - scoreA;
        })
        .slice(0, 8);

      if (!isMountedRef.current) return;

      if (loadMore) {
        setJobs(prev => [...prev, ...allJobs]);
      } else {
        setJobs(allJobs);
        setFeaturedJobs(featured);
      }
      setHasMoreItems(allJobs.length === LISTINGS_LIMIT);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      if (!loadMore && isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchJobs]);

  const handleLoadMore = async () => {
    if (hasMoreItems && !isLoadingMore) {
      setIsLoadingMore(true);
      await fetchJobs(true);
      setIsLoadingMore(false);
    }
  };

  const jobCategories = [
    { name: 'Technology', icon: <Zap className="w-6 h-6" />, color: 'text-blue-500', route: 'jobs-landing' },
    { name: 'Healthcare', icon: <Award className="w-6 h-6" />, color: 'text-green-500', route: 'jobs-landing' },
    { name: 'Finance', icon: <DollarSign className="w-6 h-6" />, color: 'text-yellow-500', route: 'jobs-landing' },
    { name: 'Education', icon: <Users className="w-6 h-6" />, color: 'text-purple-500', route: 'jobs-landing' },
    { name: 'Construction', icon: <Building className="w-6 h-6" />, color: 'text-orange-500', route: 'jobs-landing' },
    { name: 'Retail', icon: <Briefcase className="w-6 h-6" />, color: 'text-pink-500', route: 'jobs-landing' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {getBilingualText('Find Your Dream Job', 'find_job')}
          </h1>
          <p className="text-xl mb-2 text-purple-200">
            {TE_REO_TRANSLATIONS.greetings.hello}! {getBilingualText('Your next career move awaits', 'career_move')}
          </p>
          <p className="text-lg mb-8 text-purple-100">
            {getBilingualText('Discover opportunities across Aotearoa', 'opportunities')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/advanced-job-search')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <Briefcase className="inline mr-2" size={20} />
              {getBilingualText('Search Jobs', 'search_jobs')}
            </button>
            <button
              onClick={() => navigate('/create-job')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              {getBilingualText('Post a Job', 'post_job')}
            </button>
          </div>

          {/* Job Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {jobCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => navigate(`/${category.route}?category=${category.name.toLowerCase()}`)}
                className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <div className={`${category.color} mb-2`}>
                  {category.icon}
                </div>
                <span className="font-semibold text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Featured Opportunities</h2>
                <Crown className="w-8 h-8 text-yellow-500 ml-3" />
              </div>
              <p className="text-gray-600">Top jobs with great benefits and growth potential</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSaveJob={() => onWatchToggle(job.id)}
                  onApplyJob={(job) => navigate(`/job-application/${job.id}`)}
                  onJobClick={() => handleItemClick(job)}
                  isWatched={watchedItems?.includes(job.id) || false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">All Job Opportunities</h2>
          </div>
          <p className="text-gray-600">Browse all available positions on TuiTrade</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kāore anō he mahi</h3>
              <p className="text-gray-500 mb-2">No jobs posted yet</p>
              <p className="text-gray-500 mb-6">Be the first to post a job opportunity!</p>
              <p className="text-sm text-gray-400 italic">Tīmata mai - Start here</p>
              <button
                onClick={() => navigate('/create-job')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Post First Job
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSaveJob={() => onWatchToggle(job.id)}
                  onApplyJob={(job) => navigate(`/job-application/${job.id}`)}
                  onJobClick={() => handleItemClick(job)}
                  isWatched={watchedItems?.includes(job.id) || false}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5 mr-2" />
                      Load More Jobs
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Kia kaha - Keep going!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TuiTrade Jobs?</h2>
            <p className="text-gray-600">Join thousands of Kiwis finding their dream careers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">10,000+ Active Job Seekers</h3>
              <p className="text-gray-600">Connect with a large pool of qualified candidates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">500+ Companies</h3>
              <p className="text-gray-600">From startups to established businesses</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">95% Success Rate</h3>
              <p className="text-gray-600">High placement rate for job seekers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsLanding;
