// Applications Management Page - Advanced application review and management
// Comprehensive application filtering, bulk operations, and candidate pipeline management

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Mail, Phone, Calendar, CheckCircle, XCircle,
  Eye, Star, Users, User, Briefcase, MapPin, Clock, ArrowUpDown, Grid, List,
  MoreHorizontal, Tag, Flag, MessageCircle, Video, FileText, Award,
  TrendingUp, BarChart3, Target, AlertCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { 
  getCompanyApplications, 
  getCompanyJobs, 
  updateApplicationStatus 
} from '../../lib/jobsService';
import { createApplicationStatusNotification } from '../../lib/notificationService';

const ApplicationsManagementPage = ({ onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // list, grid, pipeline
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    jobId: '',
    search: '',
    dateRange: '',
    experience: '',
    location: '',
    rating: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(20);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.uid || 'demo-company';
      
      const [applicationsData, jobsData] = await Promise.all([
        getCompanyApplications(companyId),
        getCompanyJobs(companyId)
      ]);
      
      setApplications(applicationsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading applications data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort applications
  const filteredApplications = applications.filter(app => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.jobId && app.jobId !== filters.jobId) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!app.candidateName?.toLowerCase().includes(searchLower) &&
          !app.candidateEmail?.toLowerCase().includes(searchLower) &&
          !app.jobTitle?.toLowerCase().includes(searchLower)) return false;
    }
    if (filters.experience && app.experience !== filters.experience) return false;
    if (filters.location && !app.location?.includes(filters.location)) return false;
    if (filters.rating) {
      const rating = parseInt(filters.rating);
      if (!app.candidateScore || app.candidateScore < rating) return false;
    }
    return true;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortBy === 'appliedAt' || sortBy === 'updatedAt') {
      const aDate = aValue?.toDate ? aValue.toDate() : new Date(aValue);
      const bDate = bValue?.toDate ? bValue.toDate() : new Date(bValue);
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    }
    
    if (sortOrder === 'desc') {
      return bValue?.localeCompare?.(aValue) || (bValue > aValue ? 1 : -1);
    }
    return aValue?.localeCompare?.(bValue) || (aValue > bValue ? 1 : -1);
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + applicationsPerPage);

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedApplications.length === 0) return;
    
    try {
      const updatePromises = selectedApplications.map(async (appId) => {
        const app = applications.find(a => a.id === appId);
        if (app) {
          await updateApplicationStatus(appId, newStatus);
          await createApplicationStatusNotification(app.applicantId, {
            id: app.id,
            jobId: app.jobId,
            jobTitle: app.jobTitle,
            company: app.company,
            status: newStatus
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        selectedApplications.includes(app.id) ? { ...app, status: newStatus } : app
      ));
      
      setSelectedApplications([]);
      console.log(`Updated ${selectedApplications.length} applications to ${newStatus}`);
    } catch (error) {
      console.error('Error updating applications:', error);
      alert('Failed to update applications');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { color: 'bg-blue-100 text-blue-800', text: 'New' },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', text: 'Reviewing' },
      'interviewed': { color: 'bg-purple-100 text-purple-800', text: 'Interviewed' },
      'offered': { color: 'bg-green-100 text-green-800', text: 'Offered' },
      'hired': { color: 'bg-green-200 text-green-900', text: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig['new'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusStats = () => {
    return {
      total: applications.length,
      new: applications.filter(app => app.status === 'new').length,
      reviewing: applications.filter(app => app.status === 'reviewing').length,
      interviewed: applications.filter(app => app.status === 'interviewed').length,
      offered: applications.filter(app => app.status === 'offered').length,
      hired: applications.filter(app => app.status === 'hired').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const formatDate = (date) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
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
                <TeReoText english="Applications Management" teReoKey="applications" />
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage all job applications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
              >
                {viewMode === 'list' ? <Grid size={20} /> : <List size={20} />}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Download size={16} className="mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
              <div className="text-sm text-gray-600">Reviewing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.interviewed}</div>
              <div className="text-sm text-gray-600">Interviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.offered}</div>
              <div className="text-sm text-gray-600">Offered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{stats.hired}</div>
              <div className="text-sm text-gray-600">Hired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Job Filter */}
            <select
              value={filters.jobId}
              onChange={(e) => setFilters(prev => ({ ...prev, jobId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="appliedAt-desc">Newest First</option>
              <option value="appliedAt-asc">Oldest First</option>
              <option value="candidateName-asc">Name A-Z</option>
              <option value="candidateName-desc">Name Z-A</option>
              <option value="candidateScore-desc">Highest Rated</option>
              <option value="candidateScore-asc">Lowest Rated</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-700">
                {selectedApplications.length} application(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('reviewing')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Mark as Reviewing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('interviewed')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Mark as Interviewed
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedApplications([])}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {paginatedApplications.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {applications.length === 0 
                  ? "You haven't received any applications yet."
                  : "No applications match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApplications.length === paginatedApplications.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplications(paginatedApplications.map(app => app.id));
                          } else {
                            setSelectedApplications([]);
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications(prev => [...prev, application.id]);
                            } else {
                              setSelectedApplications(prev => prev.filter(id => id !== application.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.candidateName}</div>
                            <div className="text-sm text-gray-500">{application.candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.jobTitle}</div>
                        <div className="text-sm text-gray-500">{application.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.candidateScore ? renderStars(application.candidateScore) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.appliedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => onNavigate('application-detail', { applicationId: application.id })}
                            className="text-green-600 hover:text-green-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => window.open(`mailto:${application.candidateEmail}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send Email"
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            title="More Actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + applicationsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsManagementPage;