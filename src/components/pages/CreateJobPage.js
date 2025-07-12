// Create Job Page - Comprehensive job posting creation for employers
// Advanced job posting form with customizable application requirements

import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Eye, Building, MapPin, DollarSign, 
  Clock, Users, Star, Plus, X, AlertCircle, CheckCircle,
  Briefcase, Award, Calendar, FileText, Settings
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, NZ_LOCATIONS, EXPERIENCE_LEVELS } from '../../lib/jobsData';
import { createJob } from '../../lib/jobsService';

const CreateJobPage = ({ onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Job posting data
  const [jobData, setJobData] = useState({
    // Basic Information
    title: '',
    company: 'TechFlow Solutions Ltd', // Pre-filled from company profile
    department: '',
    category: '',
    subcategory: '',
    
    // Location & Work Details
    location: '',
    workLocation: 'office', // 'office', 'remote', 'hybrid'
    type: '',
    schedule: 'full-time', // 'full-time', 'part-time', 'flexible'
    
    // Compensation
    salaryType: 'range', // 'range', 'exact', 'competitive'
    salaryMin: '',
    salaryMax: '',
    salaryExact: '',
    currency: 'NZD',
    benefits: [],
    
    // Job Details
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    experience: '',
    
    // Application Settings
    applicationDeadline: '',
    startDate: '',
    applicationMethod: 'internal', // 'internal', 'external', 'email'
    externalUrl: '',
    contactEmail: '',
    
    // Custom Application Form
    customQuestions: [],
    requireCoverLetter: true,
    requireCV: true,
    requirePortfolio: false,
    requireReferences: true,
    
    // Posting Settings
    featured: false,
    urgent: false,
    companyLogo: true,
    showSalary: true,
    allowRemoteApplications: true
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear subcategory when category changes
    if (field === 'category') {
      setJobData(prev => ({
        ...prev,
        subcategory: ''
      }));
    }
  };

  // Handle array fields (benefits, custom questions)
  const addBenefit = (benefit) => {
    if (!jobData.benefits.includes(benefit)) {
      setJobData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
    }
  };

  const removeBenefit = (benefit) => {
    setJobData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const addCustomQuestion = () => {
    setJobData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, {
        id: Date.now(),
        question: '',
        type: 'text', // 'text', 'textarea', 'select', 'multiselect', 'boolean'
        required: false,
        options: [] // for select/multiselect
      }]
    }));
  };

  const updateCustomQuestion = (questionId, field, value) => {
    setJobData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeCustomQuestion = (questionId) => {
    setJobData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter(q => q.id !== questionId)
    }));
  };

  // Form validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return jobData.title && jobData.category && jobData.location && jobData.type;
      case 2:
        return jobData.description && jobData.responsibilities && jobData.requirements;
      case 3:
        return jobData.salaryType === 'competitive' || 
               (jobData.salaryType === 'range' && jobData.salaryMin && jobData.salaryMax) ||
               (jobData.salaryType === 'exact' && jobData.salaryExact);
      case 4:
        return true; // Application settings are optional
      default:
        return false;
    }
  };

  // Save job posting
  const handleSave = async (status = 'draft') => {
    setIsSaving(true);
    
    try {
      const jobPosting = {
        ...jobData,
        status,
        applicationsCount: 0,
        viewsCount: 0
      };

      // Save to Firestore using the real service
      const jobId = await createJob(jobPosting, currentUser?.uid || 'demo-company');

      console.log('Job posting saved with ID:', jobId);
      
      setSaveStatus('success');
      
      // Auto-redirect after success
      setTimeout(() => {
        onNavigate('employer-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error saving job posting:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Get subcategory options
  const getSubcategoryOptions = () => {
    if (!jobData.category || !JOB_CATEGORIES[jobData.category]) return {};
    return JOB_CATEGORIES[jobData.category].subcategories || {};
  };

  // Common benefits list
  const commonBenefits = [
    'Health Insurance', 'Dental Insurance', 'Life Insurance', 'KiwiSaver',
    'Flexible Working', 'Work From Home', 'Professional Development',
    'Gym Membership', 'Car Parking', 'Company Car', 'Laptop/Phone',
    'Annual Leave', 'Sick Leave', 'Study Leave', 'Performance Bonuses'
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            value={jobData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            value={jobData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="e.g. Engineering, Marketing"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={jobData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select a category</option>
            {Object.entries(JOB_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>
        </div>

        {jobData.category && Object.keys(getSubcategoryOptions()).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              value={jobData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a subcategory</option>
              {Object.entries(getSubcategoryOptions()).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <select
            value={jobData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select location</option>
            {Object.entries(NZ_LOCATIONS).map(([key, location]) => (
              <option key={key} value={location.name}>{location.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Location
          </label>
          <select
            value={jobData.workLocation}
            onChange={(e) => handleInputChange('workLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="office">Office</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type *
          </label>
          <select
            value={jobData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select type</option>
            {Object.entries(JOB_TYPES).map(([key, type]) => (
              <option key={key} value={key}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={jobData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select experience level</option>
            {Object.entries(EXPERIENCE_LEVELS).map(([key, level]) => (
              <option key={key} value={key}>{level}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
        </label>
        <textarea
          value={jobData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Responsibilities *
        </label>
        <textarea
          value={jobData.responsibilities}
          onChange={(e) => handleInputChange('responsibilities', e.target.value)}
          rows={5}
          placeholder="• Lead development of new features&#10;• Mentor junior developers&#10;• Collaborate with product teams"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements & Skills *
        </label>
        <textarea
          value={jobData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          rows={5}
          placeholder="• 5+ years of software development experience&#10;• Proficiency in React and Node.js&#10;• Strong communication skills"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qualifications (Preferred)
        </label>
        <textarea
          value={jobData.qualifications}
          onChange={(e) => handleInputChange('qualifications', e.target.value)}
          rows={3}
          placeholder="• Bachelor's degree in Computer Science or related field&#10;• AWS certifications&#10;• Previous leadership experience"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Compensation & Benefits</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Salary Information *
        </label>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="range"
                checked={jobData.salaryType === 'range'}
                onChange={(e) => handleInputChange('salaryType', e.target.value)}
                className="mr-2"
              />
              Salary Range
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="exact"
                checked={jobData.salaryType === 'exact'}
                onChange={(e) => handleInputChange('salaryType', e.target.value)}
                className="mr-2"
              />
              Exact Salary
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="competitive"
                checked={jobData.salaryType === 'competitive'}
                onChange={(e) => handleInputChange('salaryType', e.target.value)}
                className="mr-2"
              />
              Competitive
            </label>
          </div>

          {jobData.salaryType === 'range' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Minimum Salary</label>
                <input
                  type="number"
                  value={jobData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                  placeholder="45000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maximum Salary</label>
                <input
                  type="number"
                  value={jobData.salaryMax}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                  placeholder="65000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}

          {jobData.salaryType === 'exact' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Salary Amount</label>
              <input
                type="number"
                value={jobData.salaryExact}
                onChange={(e) => handleInputChange('salaryExact', e.target.value)}
                placeholder="55000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Benefits & Perks
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {commonBenefits.map((benefit) => (
            <button
              key={benefit}
              onClick={() => 
                jobData.benefits.includes(benefit) 
                  ? removeBenefit(benefit) 
                  : addBenefit(benefit)
              }
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                jobData.benefits.includes(benefit)
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {benefit}
            </button>
          ))}
        </div>
        
        {jobData.benefits.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Selected benefits:</p>
            <div className="flex flex-wrap gap-2">
              {jobData.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {benefit}
                  <button
                    onClick={() => removeBenefit(benefit)}
                    className="ml-2 hover:text-green-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            value={jobData.applicationDeadline}
            onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Start Date
          </label>
          <input
            type="date"
            value={jobData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mt-0.5 mr-3" size={20} />
          <div>
            <h3 className="font-medium text-blue-900">Customize Your Application Process</h3>
            <p className="text-blue-700 text-sm mt-1">
              Configure what information you want to collect from candidates and how they should apply.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Application Components</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={jobData.requireCV}
              onChange={(e) => handleInputChange('requireCV', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Require CV/Resume</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={jobData.requireCoverLetter}
              onChange={(e) => handleInputChange('requireCoverLetter', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Require Cover Letter</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={jobData.requirePortfolio}
              onChange={(e) => handleInputChange('requirePortfolio', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Require Portfolio/Work Samples</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={jobData.requireReferences}
              onChange={(e) => handleInputChange('requireReferences', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Require References</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Custom Questions</h3>
          <button
            onClick={addCustomQuestion}
            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Question
          </button>
        </div>
        
        <div className="space-y-4">
          {jobData.customQuestions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                <button
                  onClick={() => removeCustomQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateCustomQuestion(question.id, 'question', e.target.value)}
                    placeholder="Enter your question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <select
                    value={question.type}
                    onChange={(e) => updateCustomQuestion(question.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="select">Multiple Choice</option>
                    <option value="boolean">Yes/No</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateCustomQuestion(question.id, 'required', e.target.checked)}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Method</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              value="internal"
              checked={jobData.applicationMethod === 'internal'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="mr-3"
            />
            <span className="text-gray-700">Apply through TuiTrade (Recommended)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="external"
              checked={jobData.applicationMethod === 'external'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="mr-3"
            />
            <span className="text-gray-700">Redirect to external application page</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="email"
              checked={jobData.applicationMethod === 'email'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="mr-3"
            />
            <span className="text-gray-700">Apply via email</span>
          </label>
        </div>

        {jobData.applicationMethod === 'external' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              External Application URL
            </label>
            <input
              type="url"
              value={jobData.externalUrl}
              onChange={(e) => handleInputChange('externalUrl', e.target.value)}
              placeholder="https://company.com/careers/apply"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        )}

        {jobData.applicationMethod === 'email' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={jobData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="careers@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === currentStep
              ? 'bg-green-600 text-white'
              : step < currentStep
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-400'
          }`}>
            {step < currentStep ? <CheckCircle size={16} /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (saveStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Posted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your job posting for <strong>{jobData.title}</strong> has been created and is now live.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to your dashboard...
          </p>
          <button
            onClick={() => onNavigate('employer-dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('employer-dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <TeReoText english="Create Job Posting" teReoKey="post_a_job" />
                </h1>
                <p className="text-gray-600">Step {currentStep} of 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} className="mr-2" />
                Preview
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-sm border p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === 4 ? (
                <>
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={isSaving}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSave('active')}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Publishing...' : 'Publish Job'}
                  </button>
                </>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;