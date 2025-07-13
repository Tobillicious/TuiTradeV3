// Advanced Job Search - AI-powered job matching and intelligent search
// Smart search with machine learning-based candidate-job matching

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, MapPin, DollarSign,
  Target, Brain, Clock, Heart,
  Eye, Bookmark, AlertCircle, CheckCircle, X,
  Sparkles, Bot, BarChart3, Building
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { searchJobs } from '../../lib/jobsService';
import { JOB_CATEGORIES, JOB_TYPES, NZ_LOCATIONS } from '../../lib/jobsData';

const AdvancedJobSearch = ({ onNavigate, currentUser }) => {
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('standard'); // standard, ai, smart
  
  // AI Matching State
  const [userProfile, setUserProfile] = useState({
    skills: [],
    experience: '',
    location: '',
    salaryRange: { min: '', max: '' },
    preferredRoles: [],
    workPreferences: {
      remote: false,
      hybrid: false,
      office: false
    }
  });

  // Search Filters
  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    category: '',
    jobType: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    remote: false,
    postedDate: '', // last24h, last7d, last30d
    company: ''
  });

  // AI Search State
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [matchingScore, setMatchingScore] = useState({});

  // Search Analytics
  const [searchAnalytics, setSearchAnalytics] = useState({
    totalResults: 0,
    averageMatch: 0,
    topCategories: [],
    salaryInsights: {},
    locationTrends: []
  });

  const enhanceFiltersWithAI = (query, profile) => {
    // AI-enhanced search logic
    const newFilters = { ...filters };
    
    // Parse natural language query
    const queryLower = query.toLowerCase();
    
    // Extract location from query
    Object.keys(NZ_LOCATIONS).forEach(locationKey => {
      const location = NZ_LOCATIONS[locationKey];
      if (queryLower.includes(location.name.toLowerCase())) {
        newFilters.location = location.name;
      }
    });
    
    // Extract job types from query
    Object.entries(JOB_TYPES).forEach(([key, type]) => {
      if (queryLower.includes(type.toLowerCase())) {
        newFilters.jobType = key;
      }
    });
    
    // Extract categories from query
    Object.entries(JOB_CATEGORIES).forEach(([key, category]) => {
      if (queryLower.includes(category.name.toLowerCase())) {
        newFilters.category = key;
      }
    });
    
    // Use user profile for intelligent defaults
    if (profile.location && !newFilters.location) {
      newFilters.location = profile.location;
    }
    
    if (profile.salaryRange.min && !newFilters.salaryMin) {
      newFilters.salaryMin = profile.salaryRange.min;
    }
    
    if (profile.salaryRange.max && !newFilters.salaryMax) {
      newFilters.salaryMax = profile.salaryRange.max;
    }
    
    return newFilters;
  };

  const calculateMatchScore = (job, profile, query) => {
    let score = 0;
    
    // Skills matching (40% weight)
    if (profile.skills && profile.skills.length > 0) {
      const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
      const matchingSkills = profile.skills.filter(skill => 
        jobText.includes(skill.toLowerCase())
      );
      score += (matchingSkills.length / profile.skills.length) * 40;
    }
    
    // Location matching (20% weight)
    if (profile.location === job.location) {
      score += 20;
    }
    
    // Salary matching (20% weight)
    if (profile.salaryRange.min && profile.salaryRange.max && job.salaryMin && job.salaryMax) {
      const profileMin = parseInt(profile.salaryRange.min);
      const profileMax = parseInt(profile.salaryRange.max);
      const jobMin = parseInt(job.salaryMin);
      const jobMax = parseInt(job.salaryMax);
      
      // Check if ranges overlap
      if (jobMax >= profileMin && jobMin <= profileMax) {
        score += 20;
      }
    }
    
    // Experience level matching (10% weight)
    if (profile.experience === job.experience) {
      score += 10;
    }
    
    // Work preferences matching (10% weight)
    if (job.workLocation) {
      if (job.workLocation === 'remote' && profile.workPreferences.remote) score += 10;
      if (job.workLocation === 'hybrid' && profile.workPreferences.hybrid) score += 10;
      if (job.workLocation === 'office' && profile.workPreferences.office) score += 10;
    }
    
    // Query relevance boost
    if (query) {
      const queryLower = query.toLowerCase();
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      if (jobText.includes(queryLower)) {
        score += 10;
      }
    }
    
    return Math.min(Math.round(score), 100);
  };
  
  const performStandardSearch = useCallback(async () => {
    try {
      setLoading(true);
      const searchResults = await searchJobs(filters);
      setJobs(searchResults);
      generateSearchAnalytics(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const performAISearch = useCallback(async () => {
    try {
      setLoading(true);
      
      // Combine user query with AI analysis
      const enhancedFilters = enhanceFiltersWithAI(aiSearchQuery, userProfile);
      const searchResults = await searchJobs(enhancedFilters);
      
      // Calculate matching scores for each job
      const jobsWithScores = searchResults.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, userProfile, aiSearchQuery)
      }));
      
      // Sort by match score
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      
      setJobs(jobsWithScores);
      generateMatchingScores(jobsWithScores);
      generateSearchAnalytics(jobsWithScores);
      
    } catch (error) {
      console.error('Error performing AI search:', error);
    } finally {
      setLoading(false);
    }
  }, [aiSearchQuery, userProfile, filters]);

  useEffect(() => {
    // Load initial job data and user profile
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load all jobs initially
        const allJobs = await searchJobs({});
        setJobs(allJobs);
        
        // Load user profile for AI matching
        if (currentUser) {
          await loadUserProfile();
        }
        
        // Generate search analytics
        generateSearchAnalytics(allJobs);
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [currentUser]);

  useEffect(() => {
    // Perform search when filters change
    if (searchMode === 'standard') {
      performStandardSearch();
    } else if (searchMode === 'ai') {
      performAISearch();
    }
  }, [filters, searchMode, performStandardSearch, performAISearch]);

  const loadUserProfile = async () => {
    // In a real app, this would load from Firestore
    // For now, we'll use mock data
    const mockProfile = {
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: 'intermediate',
      location: 'Auckland',
      salaryRange: { min: '50000', max: '80000' },
      preferredRoles: ['Software Engineer', 'Frontend Developer'],
      workPreferences: {
        remote: true,
        hybrid: true,
        office: false
      }
    };
    setUserProfile(mockProfile);
  };

  const generateMatchingScores = (jobsWithScores) => {
    const scores = {};
    jobsWithScores.forEach(job => {
      scores[job.id] = job.matchScore;
    });
    setMatchingScore(scores);
  };

  const generateSearchAnalytics = (searchResults) => {
    const analytics = {
      totalResults: searchResults.length,
      averageMatch: searchResults.reduce((sum, job) => sum + (job.matchScore || 0), 0) / searchResults.length,
      topCategories: getTopCategories(searchResults),
      salaryInsights: getSalaryInsights(searchResults),
      locationTrends: getLocationTrends(searchResults)
    };
    setSearchAnalytics(analytics);
  };

  const getTopCategories = (jobs) => {
    const categories = {};
    jobs.forEach(job => {
      if (job.category) {
        categories[job.category] = (categories[job.category] || 0) + 1;
      }
    });
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({
        category: JOB_CATEGORIES[category]?.name || category,
        count
      }));
  };

  const getSalaryInsights = (jobs) => {
    const salaries = jobs
      .filter(job => job.salaryMin && job.salaryMax)
      .map(job => (parseInt(job.salaryMin) + parseInt(job.salaryMax)) / 2);
    
    if (salaries.length === 0) return {};
    
    return {
      average: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  };

  const getLocationTrends = (jobs) => {
    const locations = {};
    jobs.forEach(job => {
      if (job.location) {
        locations[job.location] = (locations[job.location] || 0) + 1;
      }
    });
    
    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keywords: '',
      location: '',
      category: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      experience: '',
      remote: false,
      postedDate: '',
      company: ''
    });
    setAiSearchQuery('');
  };

  const getMatchBadge = (score) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', text: 'Excellent Match', icon: Target };
    if (score >= 60) return { color: 'bg-blue-100 text-blue-800', text: 'Good Match', icon: CheckCircle };
    if (score >= 40) return { color: 'bg-yellow-100 text-yellow-800', text: 'Partial Match', icon: AlertCircle };
    return { color: 'bg-gray-100 text-gray-800', text: 'Basic Match', icon: Eye };
  };

  const renderJobCard = (job) => {
    const matchScore = matchingScore[job.id] || 0;
    const matchBadge = getMatchBadge(matchScore);
    const MatchIcon = matchBadge.icon;

    return (
      <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-green-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                {job.title}
              </h3>
              {searchMode === 'ai' && matchScore > 0 && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${matchBadge.color}`}>
                  <MatchIcon size={12} className="mr-1" />
                  {matchScore}% {matchBadge.text}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-gray-600 space-x-4 mb-3">
              <div className="flex items-center">
                <Building size={14} className="mr-1" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {job.location}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center">
                  <DollarSign size={14} className="mr-1" />
                  ${parseInt(job.salaryMin).toLocaleString()} - ${parseInt(job.salaryMax).toLocaleString()}
                </div>
              )}
            </div>
            
            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
              {job.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {job.type}
                </span>
                {job.workLocation && (
                  <span className="capitalize">{job.workLocation}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-red-500">
                  <Heart size={16} />
                </button>
                <button className="text-gray-400 hover:text-blue-500">
                  <Bookmark size={16} />
                </button>
                <button
                  onClick={() => onNavigate('job-application', { job })}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearchAnalytics = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 size={20} className="mr-2" />
        Search Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{searchAnalytics.totalResults}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        
        {searchMode === 'ai' && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(searchAnalytics.averageMatch)}%</div>
            <div className="text-sm text-gray-600">Avg Match</div>
          </div>
        )}
        
        {searchAnalytics.salaryInsights.average && (
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${searchAnalytics.salaryInsights.average.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Avg Salary</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{searchAnalytics.topCategories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <TeReoText english="Advanced Job Search" teReoKey="search" />
              </h1>
              <p className="text-gray-600 mt-1">
                Find your perfect job with AI-powered matching
              </p>
            </div>
            
            {/* Search Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMode('standard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'standard' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search size={16} className="mr-2 inline" />
                Standard
              </button>
              <button
                onClick={() => setSearchMode('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'ai' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain size={16} className="mr-2 inline" />
                AI Match
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {searchMode === 'ai' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="text-purple-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Search</h3>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  placeholder="Tell me what you're looking for... e.g., 'Remote frontend developer role in Auckland with React experience'"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={performAISearch}
                  className="absolute right-2 top-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Bot size={16} className="mr-2 inline" />
                  AI Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Keywords..."
                value={filters.keywords}
                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Locations</option>
                {Object.entries(NZ_LOCATIONS).map(([key, location]) => (
                  <option key={key} value={location.name}>{location.name}</option>
                ))}
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {Object.entries(JOB_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                {Object.entries(JOB_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type}</option>
                ))}
              </select>
              
              <button
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={16} className="mr-2" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Search Analytics */}
        {renderSearchAnalytics()}

        {/* Job Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or using AI search for better results.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                  {searchMode === 'ai' && (
                    <span className="ml-2 text-sm font-normal text-purple-600">
                      • AI-matched and sorted by relevance
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="space-y-4">
                {jobs.map(renderJobCard)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedJobSearch;