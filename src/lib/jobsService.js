// Jobs Service - Real data integration for TuiTrade jobs system
// Handles all Firestore operations for jobs, applications, and employer data

import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Collection names
export const COLLECTIONS = {
  JOBS: 'jobs',
  APPLICATIONS: 'jobApplications',
  COMPANIES: 'companies',
  USERS: 'users',
  NOTIFICATIONS: 'notifications'
};

// Job status types
export const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  FILLED: 'filled'
};

// Application status types
export const APPLICATION_STATUS = {
  NEW: 'new',
  REVIEWING: 'reviewing',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected'
};

// ===== JOB MANAGEMENT =====

/**
 * Create a new job posting
 * @param {Object} jobData - Job data object
 * @param {string} companyId - Company/employer ID
 * @returns {Promise<string>} - Created job ID
 */
export const createJob = async (jobData, companyId) => {
  try {
    const jobDoc = {
      ...jobData,
      companyId,
      status: JOB_STATUS.ACTIVE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      applicationsCount: 0,
      viewsCount: 0,
      featured: jobData.featured || false,
      urgent: jobData.urgent || false
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), jobDoc);
    console.log('Job created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw new Error('Failed to create job posting');
  }
};

/**
 * Update an existing job posting
 * @param {string} jobId - Job ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateJob = async (jobId, updates) => {
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
    await updateDoc(jobRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('Job updated successfully');
  } catch (error) {
    console.error('Error updating job:', error);
    throw new Error('Failed to update job posting');
  }
};

/**
 * Delete a job posting
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export const deleteJob = async (jobId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.JOBS, jobId));
    console.log('Job deleted successfully');
  } catch (error) {
    console.error('Error deleting job:', error);
    throw new Error('Failed to delete job posting');
  }
};

/**
 * Get a single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} - Job data or null if not found
 */
export const getJob = async (jobId) => {
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (jobSnap.exists()) {
      return { id: jobSnap.id, ...jobSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    throw new Error('Failed to fetch job details');
  }
};

/**
 * Get jobs for a specific company
 * @param {string} companyId - Company ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of job objects
 */
export const getCompanyJobs = async (companyId, options = {}) => {
  try {
    const {
      status = null,
      limitCount = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    let q = query(
      collection(db, COLLECTIONS.JOBS),
      where('companyId', '==', companyId),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    if (status) {
      q = query(
        collection(db, COLLECTIONS.JOBS),
        where('companyId', '==', companyId),
        where('status', '==', status),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const jobs = [];
    
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    return jobs;
  } catch (error) {
    console.error('Error getting company jobs:', error);
    throw new Error('Failed to fetch company jobs');
  }
};

/**
 * Search jobs with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} - Array of matching jobs
 */
export const searchJobs = async (filters = {}) => {
  try {
    const {
      keywords = '',
      category = '',
      location = '',
      jobType = '',
      salaryMin = null,
      salaryMax = null,
      limitCount = 50
    } = filters;

    let q = query(
      collection(db, COLLECTIONS.JOBS),
      where('status', '==', JOB_STATUS.ACTIVE),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply filters
    if (category) {
      q = query(q, where('category', '==', category));
    }
    if (location) {
      q = query(q, where('location', '==', location));
    }
    if (jobType) {
      q = query(q, where('type', '==', jobType));
    }

    const querySnapshot = await getDocs(q);
    let jobs = [];
    
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    // Client-side filtering for complex searches
    if (keywords) {
      const keywordLower = keywords.toLowerCase();
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(keywordLower) ||
        job.description?.toLowerCase().includes(keywordLower) ||
        job.company?.toLowerCase().includes(keywordLower)
      );
    }

    if (salaryMin || salaryMax) {
      jobs = jobs.filter(job => {
        const jobMin = parseInt(job.salaryMin) || 0;
        const jobMax = parseInt(job.salaryMax) || Infinity;
        
        if (salaryMin && jobMax < salaryMin) return false;
        if (salaryMax && jobMin > salaryMax) return false;
        return true;
      });
    }

    return jobs;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw new Error('Failed to search jobs');
  }
};

/**
 * Increment job view count
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export const incrementJobViews = async (jobId) => {
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
    await updateDoc(jobRef, {
      viewsCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing job views:', error);
    // Non-critical error, don't throw
  }
};

// ===== APPLICATION MANAGEMENT =====

/**
 * Submit a job application
 * @param {Object} applicationData - Application data
 * @param {Array} files - Array of uploaded files
 * @returns {Promise<string>} - Application ID
 */
export const submitApplication = async (applicationData, files = []) => {
  try {
    // Upload files to Firebase Storage
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = `applications/${applicationData.jobId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, file.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          storagePath: fileName
        };
      })
    );

    // Create application document
    const applicationDoc = {
      ...applicationData,
      files: uploadedFiles,
      status: APPLICATION_STATUS.NEW,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.APPLICATIONS), applicationDoc);

    // Increment job applications count
    const jobRef = doc(db, COLLECTIONS.JOBS, applicationData.jobId);
    await updateDoc(jobRef, {
      applicationsCount: increment(1)
    });

    console.log('Application submitted with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw new Error('Failed to submit application');
  }
};

/**
 * Get applications for a specific job
 * @param {string} jobId - Job ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of application objects
 */
export const getJobApplications = async (jobId, options = {}) => {
  try {
    const {
      status = null,
      limitCount = 100,
      orderByField = 'appliedAt',
      orderDirection = 'desc'
    } = options;

    let q = query(
      collection(db, COLLECTIONS.APPLICATIONS),
      where('jobId', '==', jobId),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() });
    });

    return applications;
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw new Error('Failed to fetch job applications');
  }
};

/**
 * Get applications for a company (all jobs)
 * @param {string} companyId - Company ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of application objects
 */
export const getCompanyApplications = async (companyId, options = {}) => {
  try {
    // First get all jobs for the company
    const companyJobs = await getCompanyJobs(companyId);
    const jobIds = companyJobs.map(job => job.id);

    if (jobIds.length === 0) return [];

    // Get applications for all company jobs
    // Note: Firestore has a limit of 10 items in 'in' queries, so we might need to batch this
    const applications = [];
    
    for (let i = 0; i < jobIds.length; i += 10) {
      const batchJobIds = jobIds.slice(i, i + 10);
      
      let q = query(
        collection(db, COLLECTIONS.APPLICATIONS),
        where('jobId', 'in', batchJobIds),
        orderBy('appliedAt', 'desc')
      );

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() });
      });
    }

    // Sort by appliedAt descending
    applications.sort((a, b) => b.appliedAt?.toDate() - a.appliedAt?.toDate());

    return applications.slice(0, options.limitCount || 100);
  } catch (error) {
    console.error('Error getting company applications:', error);
    throw new Error('Failed to fetch company applications');
  }
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {string} status - New status
 * @param {Object} updates - Additional updates
 * @returns {Promise<void>}
 */
export const updateApplicationStatus = async (applicationId, status, updates = {}) => {
  try {
    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await updateDoc(applicationRef, {
      status,
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('Application status updated successfully');
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

// ===== COMPANY MANAGEMENT =====

/**
 * Create or update company profile
 * @param {string} companyId - Company ID (usually user ID)
 * @param {Object} companyData - Company profile data
 * @returns {Promise<void>}
 */
export const saveCompanyProfile = async (companyId, companyData) => {
  try {
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    await setDoc(companyRef, {
      ...companyData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('Company profile saved successfully');
  } catch (error) {
    console.error('Error saving company profile:', error);
    throw new Error('Failed to save company profile');
  }
};

/**
 * Get company profile
 * @param {string} companyId - Company ID
 * @returns {Promise<Object|null>} - Company data or null
 */
export const getCompanyProfile = async (companyId) => {
  try {
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    const companySnap = await getDoc(companyRef);
    
    if (companySnap.exists()) {
      return { id: companySnap.id, ...companySnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting company profile:', error);
    throw new Error('Failed to fetch company profile');
  }
};

// ===== REAL-TIME SUBSCRIPTIONS =====

/**
 * Subscribe to real-time updates for company jobs
 * @param {string} companyId - Company ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToCompanyJobs = (companyId, callback) => {
  const q = query(
    collection(db, COLLECTIONS.JOBS),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });
    callback(jobs);
  });
};

/**
 * Subscribe to real-time updates for company applications
 * @param {string} companyId - Company ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToCompanyApplications = (companyId, callback) => {
  // This is a complex subscription since we need to get applications for all company jobs
  // For now, we'll use polling, but in a production app you might want to use Cloud Functions
  // to maintain a denormalized collection of company applications
  
  let unsubscribe = null;
  
  const setupSubscription = async () => {
    try {
      const companyJobs = await getCompanyJobs(companyId);
      const jobIds = companyJobs.map(job => job.id);
      
      if (jobIds.length === 0) {
        callback([]);
        return () => {};
      }

      // Subscribe to first batch of job IDs (Firestore limit is 10 for 'in' queries)
      const firstBatch = jobIds.slice(0, 10);
      
      const q = query(
        collection(db, COLLECTIONS.APPLICATIONS),
        where('jobId', 'in', firstBatch),
        orderBy('appliedAt', 'desc')
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applications = [];
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        callback(applications);
      });
    } catch (error) {
      console.error('Error setting up applications subscription:', error);
      callback([]);
    }
  };

  setupSubscription();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
};

// ===== FILE MANAGEMENT =====

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} - Download URL
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

// ===== STATISTICS & ANALYTICS =====

/**
 * Get dashboard statistics for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Dashboard stats
 */
export const getCompanyDashboardStats = async (companyId) => {
  try {
    const [jobs, applications] = await Promise.all([
      getCompanyJobs(companyId),
      getCompanyApplications(companyId)
    ]);

    const activeJobs = jobs.filter(job => job.status === JOB_STATUS.ACTIVE);
    const newApplications = applications.filter(app => app.status === APPLICATION_STATUS.NEW);

    // Calculate average time to hire (mock for now)
    const averageTimeToHire = '14 days';
    const responseRate = '89%';

    return {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalApplications: applications.length,
      newApplications: newApplications.length,
      averageTimeToHire,
      responseRate
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      newApplications: 0,
      averageTimeToHire: '0 days',
      responseRate: '0%'
    };
  }
};

export default {
  // Job management
  createJob,
  updateJob,
  deleteJob,
  getJob,
  getCompanyJobs,
  searchJobs,
  incrementJobViews,
  
  // Application management
  submitApplication,
  getJobApplications,
  getCompanyApplications,
  updateApplicationStatus,
  
  // Company management
  saveCompanyProfile,
  getCompanyProfile,
  
  // Real-time subscriptions
  subscribeToCompanyJobs,
  subscribeToCompanyApplications,
  
  // File management
  uploadFile,
  deleteFile,
  
  // Statistics
  getCompanyDashboardStats,
  
  // Constants
  COLLECTIONS,
  JOB_STATUS,
  APPLICATION_STATUS
};