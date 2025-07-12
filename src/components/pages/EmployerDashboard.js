// Employer Dashboard - Complete hiring management center
// Main hub for employers to manage jobs, applications, and company profile

import React, { useState, useEffect } from 'react';
import { 
  Plus, Briefcase, Users, Eye, Edit, Trash2, Calendar,
  TrendingUp, Clock, CheckCircle, AlertCircle, 
  Search, Filter, Download, Settings, Bell,
  BarChart3, Target, Star, MessageCircle, Building
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { 
  getCompanyJobs, 
  getCompanyApplications, 
  getCompanyDashboardStats,
  subscribeToCompanyJobs,
  subscribeToCompanyApplications 
} from '../../lib/jobsService';

const EmployerDashboard = ({ onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [companyJobs, setCompanyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    averageTimeToHire: '14 days',
    responseRate: '89%'
  });
  
  // Mock company data - in real app, this would come from Firestore
  const [companyProfile, setCompanyProfile] = useState({
    name: 'TechFlow Solutions Ltd',
    logo: 'https://via.placeholder.com/120x120?text=TF',
    website: 'https://techflow.co.nz',
    industry: 'Technology',
    size: '51-200 employees',
    location: 'Auckland, New Zealand',
    description: 'Leading software development company in Aotearoa specializing in innovative digital solutions.',
    culture: 'We foster innovation, collaboration, and work-life balance in a diverse, inclusive environment.',
    benefits: ['Health Insurance', 'Flexible Working', 'Professional Development', 'KiwiSaver', 'Annual Leave']
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions for live updates
    const unsubscribeJobs = subscribeToCompanyJobs(
      currentUser?.uid || 'demo-company', 
      (jobs) => {
        setCompanyJobs(jobs);
        updateStats(jobs, applications);
      }
    );

    const unsubscribeApplications = subscribeToCompanyApplications(
      currentUser?.uid || 'demo-company', 
      (apps) => {
        setApplications(apps);
        updateStats(companyJobs, apps);
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeJobs();
      unsubscribeApplications();
    };
  }, [currentUser]);

  const updateStats = (jobs, apps) => {
    const activeJobs = jobs.filter(job => job.status === 'active');
    const newApplications = apps.filter(app => app.status === 'new');

    setDashboardStats({
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalApplications: apps.length,
      newApplications: newApplications.length,
      averageTimeToHire: '14 days',
      responseRate: '89%'
    });
  };

  const loadDashboardData = async () => {
    try {
      const companyId = currentUser?.uid || 'demo-company';
      
      // Load initial data
      const [jobs, apps, stats] = await Promise.all([
        getCompanyJobs(companyId),
        getCompanyApplications(companyId),
        getCompanyDashboardStats(companyId)
      ]);

      setCompanyJobs(jobs);
      setApplications(apps);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data rather than crashing
      setCompanyJobs([]);
      setApplications([]);
      setDashboardStats({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        averageTimeToHire: '0 days',
        responseRate: '0%'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', text: 'Active' },
      'draft': { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      'paused': { color: 'bg-yellow-100 text-yellow-800', text: 'Paused' },
      'expired': { color: 'bg-red-100 text-red-800', text: 'Expired' }
    };
    
    const config = statusConfig[status] || statusConfig['draft'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      'new': { color: 'bg-blue-100 text-blue-800', text: 'New', icon: AlertCircle },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', text: 'Reviewing', icon: Eye },
      'interviewed': { color: 'bg-purple-100 text-purple-800', text: 'Interviewed', icon: Calendar },
      'offered': { color: 'bg-green-100 text-green-800', text: 'Offered', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig['new'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    // Handle Firestore timestamp or regular Date
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  };

  const formatTimeAgo = (date) => {
    // Handle Firestore timestamp or regular Date
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - dateObj) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Tab content renderers
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeJobs}</p>
              <p className="text-xs text-gray-500">of {dashboardStats.totalJobs} total</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Applications</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.newApplications}</p>
              <p className="text-xs text-gray-500">of {dashboardStats.totalApplications} total</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageTimeToHire}</p>
              <p className="text-xs text-green-600">↓ 2 days faster</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <div className="flex space-x-3">
                <button 
                  onClick={() => onNavigate('applications-management')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Advanced Management
                </button>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {applications.slice(0, 3).map((application) => (
              <div key={application.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{application.candidateName}</h4>
                  <p className="text-sm text-gray-600">{application.jobTitle}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(application.appliedAt)}</p>
                </div>
                <div>
                  {getApplicationStatusBadge(application.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs Performance */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Job Performance</h3>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {companyJobs.filter(job => job.status === 'active').slice(0, 3).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.applicationsCount} applications</p>
                  <p className="text-xs text-gray-500">{job.viewsCount} views</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {((job.applicationsCount / job.viewsCount) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      {/* Jobs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
          <p className="text-gray-600">Manage your job listings and track performance</p>
        </div>
        <button
          onClick={() => onNavigate('create-job')}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          <TeReoText english="Post New Job" teReoKey="post_a_job" />
        </button>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companyJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.applicationsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.viewsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => onNavigate('job-applications', { jobId: job.id })}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Applications"
                      >
                        <Users size={16} />
                      </button>
                      <button
                        onClick={() => onNavigate('edit-job', { jobId: job.id })}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Job"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => console.log('Delete job:', job.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Applications Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.candidateName}</h3>
                    {getApplicationStatusBadge(application.status)}
                  </div>
                  <p className="text-gray-600 mb-1">{application.candidateEmail}</p>
                  <p className="text-sm text-gray-500 mb-3">Applied for: {application.jobTitle}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <span className="ml-2 text-gray-600">{application.experience}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-600">{application.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied:</span>
                      <span className="ml-2 text-gray-600">{formatTimeAgo(application.appliedAt)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 line-clamp-2">{application.coverLetter}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => onNavigate('application-detail', { applicationId: application.id })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => console.log('Contact candidate:', application.id)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompanyProfile = () => (
    <div className="space-y-6">
      {/* Company Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
          <p className="text-gray-600">Manage your company information and branding</p>
        </div>
        <button
          onClick={() => onNavigate('edit-company-profile')}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Edit size={20} className="mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Company Profile Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start space-x-6 mb-8">
          <img
            src={companyProfile.logo}
            alt={companyProfile.name}
            className="w-24 h-24 rounded-lg object-cover border"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{companyProfile.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <span className="ml-2 text-gray-600">{companyProfile.industry}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Company Size:</span>
                <span className="ml-2 text-gray-600">{companyProfile.size}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-600">{companyProfile.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <a href={companyProfile.website} className="ml-2 text-green-600 hover:text-green-700">
                  {companyProfile.website}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Company Description</h4>
            <p className="text-gray-700">{companyProfile.description}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Company Culture</h4>
            <p className="text-gray-700">{companyProfile.culture}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Benefits & Perks</h4>
            <div className="flex flex-wrap gap-2">
              {companyProfile.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
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
                <TeReoText english="Employer Dashboard" teReoKey="company" />
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back to your hiring command center
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
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
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'company', label: 'Company Profile', icon: Building }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-6">Get comprehensive insights into your hiring performance</p>
            <button
              onClick={() => onNavigate('analytics-dashboard')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <BarChart3 size={20} className="mr-2" />
              View Analytics Dashboard
            </button>
          </div>
        )}
        {activeTab === 'company' && renderCompanyProfile()}
      </div>
    </div>
  );
};

export default EmployerDashboard;