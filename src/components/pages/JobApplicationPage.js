// Job Application Page - Complete job application system with file uploads
// Allows users to apply for jobs with CV upload and cover letter

import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, User, Mail, Phone, MapPin, 
  Calendar, Building, Award, AlertCircle, CheckCircle,
  X, Download, Eye, Trash2, Plus
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { submitApplication } from '../../lib/jobsService';

const JobApplicationPage = ({ job, onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  const fileInputRef = useRef(null);
  
  const [applicationData, setApplicationData] = useState({
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ')[1] || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    coverLetter: '',
    availability: '',
    salaryExpectation: '',
    workRights: '',
    experience: '',
    references: [
      { name: '', company: '', position: '', email: '', phone: '' }
    ]
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle reference changes
  const handleReferenceChange = (index, field, value) => {
    const newReferences = [...applicationData.references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setApplicationData(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  // Add new reference
  const addReference = () => {
    setApplicationData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', company: '', position: '', email: '', phone: '' }]
    }));
  };

  // Remove reference
  const removeReference = (index) => {
    setApplicationData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // Handle file uploads
  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }));

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const validFiles = newFiles.filter(fileObj => {
      if (!allowedTypes.includes(fileObj.type)) {
        alert(`${fileObj.name} is not a supported file type. Please upload PDF, DOC, DOCX, or TXT files.`);
        return false;
      }
      if (fileObj.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${fileObj.name} is too large. Please upload files smaller than 10MB.`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate form
  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'coverLetter'];
    const missing = required.filter(field => !applicationData[field].trim());
    
    if (missing.length > 0) {
      alert(`Please fill in the following required fields: ${missing.join(', ')}`);
      return false;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload your CV/Resume');
      return false;
    }

    return true;
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Create application object
      const applicationSubmission = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        applicantId: currentUser?.uid || 'demo-user',
        candidateName: `${applicationData.firstName} ${applicationData.lastName}`,
        candidateEmail: applicationData.email,
        ...applicationData
      };

      // Submit application with file uploads using real service
      const applicationId = await submitApplication(applicationSubmission, uploadedFiles);

      console.log('Job application submitted successfully with ID:', applicationId);
      
      setSubmitStatus('success');
      
      // Auto-redirect after success
      setTimeout(() => {
        onNavigate('jobs-landing');
      }, 3000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <TeReoText english="Application Submitted!" teReoKey="apply" />
          </h2>
          <p className="text-gray-600 mb-4">
            Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been successfully submitted.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            <TeReoText english="You will be redirected shortly..." teReoKey="apply" />
          </p>
          <button
            onClick={() => onNavigate('jobs-landing')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <TeReoText english="Back to Jobs" teReoKey="jobs" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                <TeReoText english="Apply for Job" teReoKey="apply" />
              </h1>
              <div className="text-lg font-semibold text-green-600">{job.title}</div>
              <div className="text-gray-600 flex items-center mt-1">
                <Building size={16} className="mr-2" />
                {job.company}
              </div>
            </div>
            <button
              onClick={() => onNavigate('jobs-landing')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              <TeReoText english="Personal Information" teReoKey="profile" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="First Name" teReoKey="contact" /> *
                </label>
                <input
                  type="text"
                  value={applicationData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="Last Name" teReoKey="contact" /> *
                </label>
                <input
                  type="text"
                  value={applicationData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="Email Address" teReoKey="contact" /> *
                </label>
                <input
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="Phone Number" teReoKey="contact" /> *
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TeReoText english="Address" teReoKey="location" />
              </label>
              <input
                type="text"
                value={applicationData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Street, City, Postcode"
              />
            </div>
          </div>

          {/* CV/Resume Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              <TeReoText english="CV/Resume Upload" teReoKey="apply" /> *
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                <TeReoText english="Upload your CV or Resume" teReoKey="apply" />
              </p>
              <p className="text-gray-600 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-gray-900">Uploaded Files:</h3>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <TeReoText english="Cover Letter" teReoKey="apply" /> *
            </h2>
            <textarea
              value={applicationData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Tell us why you're the perfect fit for this role..."
              required
            />
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <TeReoText english="Additional Information" teReoKey="experience" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="Work Rights" teReoKey="work_rights" />
                </label>
                <select
                  value={applicationData.workRights}
                  onChange={(e) => handleInputChange('workRights', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select work rights</option>
                  <option value="nz-citizen">NZ Citizen/Permanent Resident</option>
                  <option value="work-visa">Work Visa Holder</option>
                  <option value="need-visa">Need Work Visa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TeReoText english="Salary Expectation" teReoKey="salary" />
                </label>
                <input
                  type="text"
                  value={applicationData.salaryExpectation}
                  onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. $60,000 - $70,000"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TeReoText english="Availability" teReoKey="experience" />
              </label>
              <input
                type="text"
                value={applicationData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. Immediate, 2 weeks notice, etc."
              />
            </div>
          </div>

          {/* References */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                <TeReoText english="References" teReoKey="contact" />
              </h2>
              <button
                type="button"
                onClick={addReference}
                className="text-green-600 hover:text-green-700 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Reference
              </button>
            </div>
            
            {applicationData.references.map((reference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Reference {index + 1}</h3>
                  {applicationData.references.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={reference.name}
                    onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={reference.company}
                    onChange={(e) => handleReferenceChange(index, 'company', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={reference.position}
                    onChange={(e) => handleReferenceChange(index, 'position', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={reference.email}
                    onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={reference.phone}
                    onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 md:col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                * Required fields
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => onNavigate('jobs-landing')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <TeReoText english="Submit Application" teReoKey="apply" />
                  )}
                </button>
              </div>
            </div>
            
            {submitStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>There was an error submitting your application. Please try again.</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationPage;