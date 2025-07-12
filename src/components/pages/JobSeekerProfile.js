// Job Seeker Profile - Enhanced profile management for job seekers
// Comprehensive profile builder with skills, experience, and job preferences

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, Award,
  Plus, Edit, Trash2, Save, Upload, FileText, Bell, Settings,
  Search, Filter, Eye, Download, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { 
  getDoc, 
  setDoc, 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

const JobSeekerProfile = ({ onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'New Zealand',
    
    // Professional Information
    currentTitle: '',
    summary: '',
    yearsExperience: '',
    industry: '',
    
    // Skills & Qualifications
    skills: [],
    qualifications: [],
    certifications: [],
    languages: [{ language: 'English', proficiency: 'Native' }],
    
    // Work Experience
    workExperience: [],
    
    // Education
    education: [],
    
    // Job Preferences
    jobPreferences: {
      desiredRoles: [],
      preferredLocations: [],
      salaryRange: { min: '', max: '' },
      workArrangement: '', // remote, hybrid, office
      availability: '', // immediate, 2weeks, 1month, etc
      workRights: ''
    },
    
    // Profile Settings
    profileVisibility: 'public', // public, private, employers-only
    jobAlerts: true,
    profileComplete: false,
    
    // Documents
    resumeUrl: '',
    portfolioUrl: '',
    linkedInUrl: '',
    
    // Timestamps
    createdAt: null,
    updatedAt: null
  });

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadMyApplications();
      loadSavedJobs();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setProfileData(prev => ({
          ...prev,
          ...userData,
          email: currentUser.email // Always use current auth email
        }));
      } else {
        // Initialize with basic info from auth
        setProfileData(prev => ({
          ...prev,
          firstName: currentUser.displayName?.split(' ')[0] || '',
          lastName: currentUser.displayName?.split(' ')[1] || '',
          email: currentUser.email
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadMyApplications = async () => {
    try {
      const applicationsRef = collection(db, 'jobApplications');
      const q = query(
        applicationsRef,
        where('applicantId', '==', currentUser.uid),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const applications = [];
      querySnapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      setMyApplications(applications);
    } catch (error) {
      console.error('Error loading applications:', error);
      setMyApplications([]);
    }
  };

  const loadSavedJobs = async () => {
    // For now, we'll use a simple saved jobs array in the user profile
    // In a full implementation, you might have a separate savedJobs collection
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSavedJobs(userData.savedJobs || []);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      setSavedJobs([]);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...profileData,
        updatedAt: new Date(),
        profileComplete: calculateProfileCompleteness(profileData) > 70
      };
      
      if (!profileData.createdAt) {
        updateData.createdAt = new Date();
      }
      
      await setDoc(userRef, updateData, { merge: true });
      setIsEditing(false);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompleteness = (profile) => {
    const fields = [
      profile.firstName, profile.lastName, profile.phone, profile.address,
      profile.currentTitle, profile.summary, profile.yearsExperience,
      profile.skills.length > 0, profile.workExperience.length > 0,
      profile.education.length > 0, profile.resumeUrl
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addWorkExperience = () => {
    setProfileData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        id: Date.now(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateWorkExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  const formatApplicationDate = (date) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { color: 'bg-blue-100 text-blue-800', text: 'Applied' },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      'interviewed': { color: 'bg-purple-100 text-purple-800', text: 'Interviewed' },
      'offered': { color: 'bg-green-100 text-green-800', text: 'Offer Received' },
      'hired': { color: 'bg-green-200 text-green-900', text: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Not Selected' }
    };
    
    const config = statusConfig[status] || statusConfig['new'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Completeness */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completeness</h3>
          <div className="text-sm text-gray-500">
            {calculateProfileCompleteness(profileData)}% Complete
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${calculateProfileCompleteness(profileData)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Complete your profile to increase your visibility to employers
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-green-600 hover:text-green-700 flex items-center"
          >
            <Edit size={16} className="mr-1" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-900">{profileData.firstName || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-900">{profileData.lastName || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{profileData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Street, City, Postcode"
              />
            ) : (
              <p className="text-gray-900">{profileData.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Professional Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
        {isEditing ? (
          <textarea
            value={profileData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Write a brief summary of your professional background and career goals..."
          />
        ) : (
          <p className="text-gray-900">{profileData.summary || 'No summary provided yet.'}</p>
        )}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {profileData.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
            >
              {skill}
              {isEditing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-green-600"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <div className="text-sm text-gray-600">
          {myApplications.length} applications submitted
        </div>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">Start applying to jobs that match your skills and interests.</p>
          <button
            onClick={() => onNavigate('jobs-landing')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 space-y-4">
            {myApplications.map((application) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
                    <p className="text-gray-600 mb-2">{application.company}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Applied: {formatApplicationDate(application.appliedAt)}</span>
                      <span>•</span>
                      <span>Application ID: {application.id.slice(-8)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(application.status)}
                    <button
                      onClick={() => onNavigate('application-detail', { applicationId: application.id })}
                      className="text-green-600 hover:text-green-700"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderJobAlertsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Job Alerts & Preferences</h2>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Salary Range</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Min"
                value={profileData.jobPreferences.salaryRange.min}
                onChange={(e) => handleNestedChange('jobPreferences', 'salaryRange', {
                  ...profileData.jobPreferences.salaryRange,
                  min: e.target.value
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                placeholder="Max"
                value={profileData.jobPreferences.salaryRange.max}
                onChange={(e) => handleNestedChange('jobPreferences', 'salaryRange', {
                  ...profileData.jobPreferences.salaryRange,
                  max: e.target.value
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Arrangement</label>
            <select
              value={profileData.jobPreferences.workArrangement}
              onChange={(e) => handleNestedChange('jobPreferences', 'workArrangement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="office">Office</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
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
                <TeReoText english="My Profile" teReoKey="profile" />
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your professional profile and job applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                {myApplications.filter(app => app.status === 'new').length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-400"></span>
                )}
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
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'applications', label: 'My Applications', icon: Briefcase },
              { id: 'alerts', label: 'Job Alerts', icon: Bell }
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
                  {tab.id === 'applications' && myApplications.length > 0 && (
                    <span className="ml-2 bg-gray-200 text-gray-800 text-xs rounded-full px-2 py-1">
                      {myApplications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'alerts' && renderJobAlertsTab()}
      </div>
    </div>
  );
};

export default JobSeekerProfile;