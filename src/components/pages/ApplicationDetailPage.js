// Application Detail Page - Comprehensive application review for employers
// Advanced candidate evaluation with scoring, notes, and interview scheduling

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Download,
  Star, Edit, Save, X, CheckCircle, XCircle, Clock, MessageCircle,
  Briefcase, Award, GraduationCap, Globe, Heart, ThumbsUp, ThumbsDown,
  Eye, Flag, Share, Bookmark, AlertTriangle, Coffee, Video, Users
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import {
  getDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateApplicationStatus, getJob } from '../../lib/jobsService';
import { createApplicationStatusNotification } from '../../lib/notificationService';
import { fetchUserReputation } from '../../lib/reputationService';
import { USER_BADGES } from '../../lib/communityFeatures';

const ApplicationDetailPage = ({ applicationId, onNavigate, currentUser }) => {
  const { getText } = useTeReo();

  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [employerNotes, setEmployerNotes] = useState('');
  const [candidateScore, setCandidateScore] = useState(0);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [reputation, setReputation] = useState(null);

  // Interview scheduling state
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [interviewData, setInterviewData] = useState({
    type: 'video', // video, phone, in-person
    date: '',
    time: '',
    duration: '60',
    location: '',
    interviewers: [],
    notes: ''
  });

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);

      // Load application data
      const applicationRef = doc(db, 'jobApplications', applicationId);
      const applicationSnap = await getDoc(applicationRef);

      if (applicationSnap.exists()) {
        const appData = { id: applicationSnap.id, ...applicationSnap.data() };
        setApplication(appData);
        setEmployerNotes(appData.employerNotes || '');
        setCandidateScore(appData.candidateScore || 0);

        // Load related job data
        if (appData.jobId) {
          const jobData = await getJob(appData.jobId);
          setJob(jobData);
        }

        // Load reputation data
        if (appData.applicantId) {
          const repData = await fetchUserReputation(appData.applicantId);
          setReputation(repData);
        }
      } else {
        console.error('Application not found');
      }
    } catch (error) {
      console.error('Error loading application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!application) return;

    setStatusUpdating(true);
    try {
      // Update application status
      await updateApplicationStatus(application.id, newStatus, {
        statusUpdatedBy: currentUser?.uid,
        statusUpdatedAt: serverTimestamp()
      });

      // Send notification to candidate
      await createApplicationStatusNotification(application.applicantId, {
        id: application.id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        company: application.company,
        status: newStatus
      });

      // Update local state
      setApplication(prev => ({ ...prev, status: newStatus }));

      console.log(`Application status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const applicationRef = doc(db, 'jobApplications', application.id);
      await updateDoc(applicationRef, {
        employerNotes,
        candidateScore,
        notesUpdatedAt: serverTimestamp(),
        notesUpdatedBy: currentUser?.uid
      });

      setIsEditingNotes(false);
      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const applicationRef = doc(db, 'jobApplications', application.id);
      await updateDoc(applicationRef, {
        interviewScheduled: true,
        interviewDetails: {
          ...interviewData,
          scheduledBy: currentUser?.uid,
          scheduledAt: serverTimestamp()
        },
        status: 'interviewed'
      });

      // Send notification to candidate about interview
      await createApplicationStatusNotification(application.applicantId, {
        id: application.id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        company: application.company,
        status: 'interviewed'
      });

      setApplication(prev => ({
        ...prev,
        status: 'interviewed',
        interviewScheduled: true,
        interviewDetails: interviewData
      }));

      setShowInterviewScheduler(false);
      console.log('Interview scheduled successfully');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { color: 'bg-blue-100 text-blue-800', text: 'New Application', icon: AlertTriangle },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review', icon: Eye },
      'interviewed': { color: 'bg-purple-100 text-purple-800', text: 'Interviewed', icon: Video },
      'offered': { color: 'bg-green-100 text-green-800', text: 'Offer Made', icon: CheckCircle },
      'hired': { color: 'bg-green-200 text-green-900', text: 'Hired', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Not Selected', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['new'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={14} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const renderScoreStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setCandidateScore(star)}
            className={`${candidateScore >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            disabled={!isEditingNotes}
          >
            <Star size={20} fill={candidateScore >= star ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {candidateScore > 0 ? `${candidateScore}/5 stars` : 'Not rated'}
        </span>
      </div>
    );
  };

  const TuiTradeProfile = ({ reputation }) => {
    if (!reputation) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">TuiTrade Profile</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{reputation.averageSellerRating.toFixed(1)} / 5.0</p>
              <p className="text-sm text-gray-600">Average Seller Rating</p>
            </div>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{reputation.totalTrades}</p>
              <p className="text-sm text-gray-600">Completed Trades</p>
            </div>
          </div>
          {reputation.badges && reputation.badges.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-2">Community Badges</h4>
              <div className="flex flex-wrap gap-2">
                {reputation.badges.map(badge => (
                  <div key={badge.id} className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium" title={badge.description}>
                    <Award className="w-4 h-4 mr-1.5" style={{ color: badge.color }} />
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => onNavigate('employer-dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button>
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
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('employer-dashboard', { tab: 'applications' })}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
                <p className="text-gray-600">
                  {application.candidateName} • {application.jobTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(application.status)}
              <button
                onClick={() => setShowInterviewScheduler(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                disabled={application.status === 'hired' || application.status === 'rejected'}
              >
                <Calendar size={16} className="mr-2" />
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.candidateName}</p>
                      <p className="text-sm text-gray-600">Full Name</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.candidateEmail}</p>
                      <p className="text-sm text-gray-600">Email Address</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.phone || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.address || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Address</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.experience || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Experience Level</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{application.workRights || 'Not specified'}</p>
                      <p className="text-sm text-gray-600">Work Rights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.coverLetter || 'No cover letter provided.'}
                </p>
              </div>
            </div>

            {/* Uploaded Files */}
            {application.files && application.files.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
                <div className="space-y-3">
                  {application.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB •
                            Uploaded {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          className="text-green-600 hover:text-green-700"
                          title="Download Document"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {application.references && application.references.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.references.filter(ref => ref.name).map((reference, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{reference.name}</h3>
                      <p className="text-sm text-gray-600">{reference.position}</p>
                      <p className="text-sm text-gray-600">{reference.company}</p>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">{reference.email}</p>
                        <p className="text-gray-600">{reference.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('reviewing')}
                  disabled={statusUpdating || application.status === 'reviewing'}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Eye size={16} className="mr-2" />
                  Mark as Reviewing
                </button>

                <button
                  onClick={() => handleStatusUpdate('offered')}
                  disabled={statusUpdating || application.status === 'hired'}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Make Offer
                </button>

                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={statusUpdating || application.status === 'hired'}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <XCircle size={16} className="mr-2" />
                  Decline
                </button>
              </div>
            </div>

            {/* TuiTrade Profile */}
            <TuiTradeProfile reputation={reputation} />

            {/* Candidate Rating */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Rating</h3>
              {renderScoreStars()}
            </div>

            {/* Employer Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Internal Notes</h3>
                <button
                  onClick={() => isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true)}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  {isEditingNotes ? <Save size={16} className="mr-1" /> : <Edit size={16} className="mr-1" />}
                  {isEditingNotes ? 'Save' : 'Edit'}
                </button>
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={employerNotes}
                    onChange={(e) => setEmployerNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Add your notes about this candidate..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveNotes}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {employerNotes || 'No notes added yet. Click Edit to add your thoughts about this candidate.'}
                </p>
              )}
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <FileText size={12} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
                  </div>
                </div>

                {application.status !== 'new' && (
                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-full p-2 mr-3">
                      <Eye size={12} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Status Updated</p>
                      <p className="text-sm text-gray-600">Current status: {application.status}</p>
                    </div>
                  </div>
                )}

                {application.interviewScheduled && (
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Calendar size={12} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Interview Scheduled</p>
                      <p className="text-sm text-gray-600">
                        {application.interviewDetails?.type} interview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
              <button
                onClick={() => setShowInterviewScheduler(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={interviewData.duration}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              {interviewData.type === 'in-person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={interviewData.location}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Interview location address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes for the candidate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleScheduleInterview}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => setShowInterviewScheduler(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;