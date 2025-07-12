// Analytics Dashboard - Comprehensive business intelligence and insights
// Advanced metrics, trends, and performance analytics for employers and admins

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Briefcase, Target, Eye, Clock, DollarSign,
  Calendar, Filter, Download, Settings, Zap, Star, MapPin, Building,
  ArrowUp, ArrowDown, Activity, PieChart, LineChart, BarChart, Globe,
  Award, Bookmark, MessageCircle, Share2, RefreshCw, AlertTriangle,
  CheckCircle, UserCheck, Search, FileText, Heart, Layers
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { 
  getCompanyJobs, 
  getCompanyApplications, 
  getCompanyDashboardStats 
} from '../../lib/jobsService';

const AnalyticsDashboard = ({ onNavigate, currentUser, userRole = 'employer' }) => {
  const { getText } = useTeReo();
  
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('overview');
  
  // Core Analytics Data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      hireRate: 0,
      avgTimeToHire: 0,
      totalViews: 0,
      conversionRate: 0,
      topPerformingJobs: []
    },
    jobPerformance: {
      jobsByStatus: {},
      applicationTrends: [],
      viewTrends: [],
      categoryPerformance: {},
      locationInsights: {}
    },
    candidateInsights: {
      applicationSources: {},
      candidateQuality: {},
      experienceLevels: {},
      geographicDistribution: {},
      skillsAnalysis: {}
    },
    marketIntelligence: {
      industryBenchmarks: {},
      salaryTrends: {},
      competitorAnalysis: {},
      marketDemand: {},
      seasonalTrends: {}
    },
    financialMetrics: {
      costPerHire: 0,
      timeToFill: 0,
      sourceEffectiveness: {},
      budgetUtilization: {},
      roi: 0
    }
  });

  // Chart Data
  const [chartData, setChartData] = useState({
    applicationTrends: [],
    viewTrends: [],
    hireSuccess: [],
    salaryDistribution: [],
    categoryPerformance: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, currentUser]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.uid || 'demo-company';
      
      // Load core data
      const [jobs, applications, stats] = await Promise.all([
        getCompanyJobs(companyId),
        getCompanyApplications(companyId),
        getCompanyDashboardStats(companyId)
      ]);

      // Generate comprehensive analytics
      const processedAnalytics = generateAnalytics(jobs, applications, stats);
      setAnalytics(processedAnalytics);
      
      // Generate chart data
      const charts = generateChartData(jobs, applications);
      setChartData(charts);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (jobs, applications, stats) => {
    // Overview Metrics
    const totalViews = jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0);
    const hiredCount = applications.filter(app => app.status === 'hired').length;
    const conversionRate = totalViews > 0 ? ((applications.length / totalViews) * 100) : 0;
    const hireRate = applications.length > 0 ? ((hiredCount / applications.length) * 100) : 0;
    
    // Top Performing Jobs
    const topPerformingJobs = jobs
      .filter(job => job.applicationsCount > 0)
      .sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0))
      .slice(0, 5)
      .map(job => ({
        title: job.title,
        applications: job.applicationsCount || 0,
        views: job.viewsCount || 0,
        conversionRate: job.viewsCount > 0 ? ((job.applicationsCount / job.viewsCount) * 100) : 0
      }));

    // Job Performance Analytics
    const jobsByStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    const categoryPerformance = jobs.reduce((acc, job) => {
      if (job.category) {
        if (!acc[job.category]) {
          acc[job.category] = { jobs: 0, applications: 0, avgViews: 0 };
        }
        acc[job.category].jobs++;
        acc[job.category].applications += job.applicationsCount || 0;
        acc[job.category].avgViews += job.viewsCount || 0;
      }
      return acc;
    }, {});

    // Process category averages
    Object.keys(categoryPerformance).forEach(cat => {
      if (categoryPerformance[cat].jobs > 0) {
        categoryPerformance[cat].avgViews = Math.round(categoryPerformance[cat].avgViews / categoryPerformance[cat].jobs);
      }
    });

    // Candidate Insights
    const experienceLevels = applications.reduce((acc, app) => {
      const exp = app.experience || 'Not specified';
      acc[exp] = (acc[exp] || 0) + 1;
      return acc;
    }, {});

    const geographicDistribution = applications.reduce((acc, app) => {
      const location = app.location || 'Not specified';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    // Application sources (for demo purposes)
    const applicationSources = {
      'Direct Application': Math.round(applications.length * 0.4),
      'Job Board': Math.round(applications.length * 0.3),
      'Social Media': Math.round(applications.length * 0.15),
      'Referral': Math.round(applications.length * 0.1),
      'Other': Math.round(applications.length * 0.05)
    };

    // Market Intelligence (mock data for demo)
    const salaryTrends = {
      'Junior': { current: 45000, change: 5.2, trend: 'up' },
      'Mid-Level': { current: 65000, change: 3.8, trend: 'up' },
      'Senior': { current: 95000, change: -1.2, trend: 'down' },
      'Lead': { current: 120000, change: 7.5, trend: 'up' }
    };

    const industryBenchmarks = {
      avgApplicationsPerJob: 25,
      avgTimeToHire: 18,
      avgConversionRate: 3.2,
      topSkillsInDemand: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS']
    };

    return {
      overview: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        hireRate: Math.round(hireRate * 10) / 10,
        avgTimeToHire: 14, // Mock data
        totalViews,
        conversionRate: Math.round(conversionRate * 10) / 10,
        topPerformingJobs
      },
      jobPerformance: {
        jobsByStatus,
        categoryPerformance,
        locationInsights: geographicDistribution
      },
      candidateInsights: {
        applicationSources,
        experienceLevels,
        geographicDistribution,
        candidateQuality: {
          highQuality: Math.round(applications.length * 0.3),
          moderate: Math.round(applications.length * 0.5),
          needsReview: Math.round(applications.length * 0.2)
        }
      },
      marketIntelligence: {
        industryBenchmarks,
        salaryTrends,
        marketDemand: {
          increasing: ['Software Engineering', 'Data Science', 'UX Design'],
          stable: ['Marketing', 'Sales', 'Operations'],
          decreasing: ['Print Media', 'Traditional Retail']
        }
      },
      financialMetrics: {
        costPerHire: 2800, // Mock data
        timeToFill: 16,
        roi: 340,
        budgetUtilization: 78
      }
    };
  };

  const generateChartData = (jobs, applications) => {
    // Generate mock time series data for applications
    const applicationTrends = [];
    const viewTrends = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      applicationTrends.push({
        date: date.toISOString().split('T')[0],
        applications: Math.floor(Math.random() * 10) + 1,
        views: Math.floor(Math.random() * 50) + 10
      });
    }

    // Salary distribution data
    const salaryDistribution = [
      { range: '30k-40k', count: 12 },
      { range: '40k-60k', count: 28 },
      { range: '60k-80k', count: 35 },
      { range: '80k-100k', count: 22 },
      { range: '100k+', count: 15 }
    ];

    return {
      applicationTrends,
      viewTrends,
      salaryDistribution,
      categoryPerformance: Object.entries(analytics.jobPerformance?.categoryPerformance || {})
        .map(([category, data]) => ({
          category,
          applications: data.applications,
          jobs: data.jobs
        }))
    };
  };

  const renderMetricCard = (title, value, change, icon, color = 'green') => {
    const Icon = icon;
    const isPositive = change >= 0;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <p className={`text-sm flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                {Math.abs(change)}% from last period
              </p>
            )}
          </div>
          <div className={`bg-${color}-100 rounded-full p-3`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleChart = (data, type = 'bar') => {
    if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

    const maxValue = Math.max(...data.map(d => d.applications || d.count || d.views || 0));
    
    return (
      <div className="space-y-2">
        {data.slice(0, 5).map((item, index) => {
          const value = item.applications || item.count || item.views || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-gray-600 truncate">
                {item.category || item.range || item.date || item.title}
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900 text-right">
                {value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Total Jobs Posted',
          analytics.overview.totalJobs,
          12.5,
          Briefcase,
          'blue'
        )}
        {renderMetricCard(
          'Total Applications',
          analytics.overview.totalApplications,
          8.3,
          Users,
          'green'
        )}
        {renderMetricCard(
          'Hire Rate',
          `${analytics.overview.hireRate}%`,
          -2.1,
          Target,
          'purple'
        )}
        {renderMetricCard(
          'Avg Time to Hire',
          `${analytics.overview.avgTimeToHire} days`,
          -5.8,
          Clock,
          'orange'
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Jobs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="mr-2" size={20} />
            Top Performing Jobs
          </h3>
          <div className="space-y-4">
            {analytics.overview.topPerformingJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">
                    {job.applications} applications • {job.views} views
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {job.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Application Trends (30 days)
          </h3>
          {renderSimpleChart(chartData.applicationTrends.slice(-7))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Sources</h3>
          {renderSimpleChart(
            Object.entries(analytics.candidateInsights.applicationSources).map(([source, count]) => ({
              category: source,
              count
            }))
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Levels</h3>
          {renderSimpleChart(
            Object.entries(analytics.candidateInsights.experienceLevels).map(([level, count]) => ({
              category: level,
              count
            }))
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          {renderSimpleChart(
            Object.entries(analytics.candidateInsights.geographicDistribution)
              .slice(0, 5)
              .map(([location, count]) => ({
                category: location,
                count
              }))
          )}
        </div>
      </div>
    </div>
  );

  const renderMarketIntelligenceTab = () => (
    <div className="space-y-6">
      {/* Industry Benchmarks */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Industry Benchmarks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.marketIntelligence.industryBenchmarks.avgApplicationsPerJob}
            </div>
            <div className="text-sm text-gray-600">Avg Applications/Job</div>
            <div className="text-xs text-gray-500">Industry Standard</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.marketIntelligence.industryBenchmarks.avgTimeToHire}
            </div>
            <div className="text-sm text-gray-600">Avg Time to Hire</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.marketIntelligence.industryBenchmarks.avgConversionRate}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="text-xs text-gray-500">Industry Avg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.overview.conversionRate}%
            </div>
            <div className="text-sm text-gray-600">Your Rate</div>
            <div className={`text-xs ${analytics.overview.conversionRate > analytics.marketIntelligence.industryBenchmarks.avgConversionRate ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.conversionRate > analytics.marketIntelligence.industryBenchmarks.avgConversionRate ? 'Above' : 'Below'} Average
            </div>
          </div>
        </div>
      </div>

      {/* Salary Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="mr-2" size={20} />
          Salary Trends by Experience Level
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.marketIntelligence.salaryTrends).map(([level, data]) => (
            <div key={level} className="border border-gray-200 rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-900">{level}</div>
              <div className="text-2xl font-bold text-green-600">
                ${data.current.toLocaleString()}
              </div>
              <div className={`text-sm flex items-center ${
                data.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.trend === 'up' ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                {Math.abs(data.change)}% change
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills in High Demand</h3>
          <div className="space-y-2">
            {analytics.marketIntelligence.industryBenchmarks.topSkillsInDemand.map((skill, index) => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-gray-700">{skill}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${100 - (index * 15)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{100 - (index * 15)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Demand Trends</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2 flex items-center">
                <ArrowUp size={16} className="mr-1" />
                Increasing Demand
              </h4>
              <div className="space-y-1">
                {analytics.marketIntelligence.marketDemand.increasing.map(category => (
                  <div key={category} className="text-sm text-gray-600">• {category}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                <Activity size={16} className="mr-1" />
                Stable Demand
              </h4>
              <div className="space-y-1">
                {analytics.marketIntelligence.marketDemand.stable.map(category => (
                  <div key={category} className="text-sm text-gray-600">• {category}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <TeReoText english="Analytics Dashboard" teReoKey="analytics" />
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Job Performance', icon: Target },
              { id: 'candidates', label: 'Candidate Insights', icon: Users },
              { id: 'market', label: 'Market Intelligence', icon: Globe },
              { id: 'financial', label: 'Financial Metrics', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetric(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeMetric === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeMetric === 'overview' && renderOverviewTab()}
        {activeMetric === 'market' && renderMarketIntelligenceTab()}
        {/* Add other tab renderers as needed */}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;