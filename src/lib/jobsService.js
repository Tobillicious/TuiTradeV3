// Real Job Service - Firestore integration for job listings and applications
// Replaces mock data with actual database operations

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Job status constants
export const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  EXPIRED: 'expired'
};

// Application status constants
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

class JobService {
  constructor() {
    this.isInitialized = false;
  }

  initialize() {
    this.isInitialized = true;
    console.log('JobService initialized');
  }

  // Create a new job listing
  async createJob(jobData, employerId) {
    try {
      const job = {
        ...jobData,
        employerId,
        status: JOB_STATUS.ACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationsCount: 0,
        viewsCount: 0,
        featured: false,
        expiresAt: this.calculateExpiryDate(jobData.duration || 30)
      };

      const docRef = await addDoc(collection(db, 'jobs'), job);

      // Update employer's job count
      await this.updateEmployerJobCount(employerId, 1);

      return { id: docRef.id, ...job };
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job listing');
    }
  }

  // Update job listing
  async updateJob(jobId, updates) {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job listing');
    }
  }

  // Delete job listing
  async deleteJob(jobId, employerId) {
    try {
      const batch = writeBatch(db);

      // Delete the job
      const jobRef = doc(db, 'jobs', jobId);
      batch.delete(jobRef);

      // Delete all applications for this job
      const applicationsQuery = query(
        collection(db, 'jobApplications'),
        where('jobId', '==', jobId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      applicationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Update employer's job count
      await this.updateEmployerJobCount(employerId, -1);

      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job listing');
    }
  }

  // Get job by ID
  async getJob(jobId) {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);

      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      return { id: jobDoc.id, ...jobDoc.data() };
    } catch (error) {
      console.error('Error getting job:', error);
      throw error;
    }
  }

  // Search jobs with filters
  async searchJobs(filters = {}, options = {}) {
    try {
      let q = collection(db, 'jobs');
      const constraints = [];

      // Add filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.subcategory) {
        constraints.push(where('subcategory', '==', filters.subcategory));
      }

      if (filters.location) {
        constraints.push(where('region', '==', filters.location));
      }

      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters.experience) {
        constraints.push(where('experience', '==', filters.experience));
      }

      if (filters.workRights) {
        constraints.push(where('workRights', '==', filters.workRights));
      }

      // Only show active jobs
      constraints.push(where('status', '==', JOB_STATUS.ACTIVE));

      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'));

      // Add limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Apply keyword filter if provided
      if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase().split(' ');
        jobs = jobs.filter(job =>
          keywords.some(keyword =>
            job.title.toLowerCase().includes(keyword) ||
            job.company.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword)
          )
        );
      }

      return jobs;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw new Error('Failed to search jobs');
    }
  }

  // Get jobs by employer
  async getEmployerJobs(employerId, status = null) {
    try {
      let q = query(
        collection(db, 'jobs'),
        where('employerId', '==', employerId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employer jobs:', error);
      throw new Error('Failed to get employer jobs');
    }
  }

  // Get company jobs (alias for getEmployerJobs)
  async getCompanyJobs(employerId, status = null) {
    return this.getEmployerJobs(employerId, status);
  }

  // Get company applications
  async getCompanyApplications(employerId, status = null) {
    try {
      // First get all jobs by this employer
      const jobs = await this.getEmployerJobs(employerId);
      const jobIds = jobs.map(job => job.id);

      if (jobIds.length === 0) return [];

      // Get applications for these jobs
      const applicationsQuery = query(
        collection(db, 'jobApplications'),
        where('jobId', 'in', jobIds),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(applicationsQuery);
      let applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter by status if provided
      if (status) {
        applications = applications.filter(app => app.status === status);
      }

      return applications;
    } catch (error) {
      console.error('Error getting company applications:', error);
      throw new Error('Failed to get company applications');
    }
  }

  // Get company dashboard stats
  async getCompanyDashboardStats(employerId) {
    try {
      const [jobs, applications] = await Promise.all([
        this.getEmployerJobs(employerId),
        this.getCompanyApplications(employerId)
      ]);

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === JOB_STATUS.ACTIVE).length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === APPLICATION_STATUS.PENDING).length,
        shortlistedApplications: applications.filter(app => app.status === APPLICATION_STATUS.SHORTLISTED).length,
        totalViews: jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting company dashboard stats:', error);
      throw new Error('Failed to get company dashboard stats');
    }
  }

  // Subscribe to company jobs
  subscribeToCompanyJobs(employerId, callback) {
    const q = query(
      collection(db, 'jobs'),
      where('employerId', '==', employerId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(jobs);
    });
  }

  // Subscribe to company applications
  subscribeToCompanyApplications(employerId, callback) {
    // This is a simplified version - in production you'd need to handle the 'in' query limitation
    return this.getCompanyApplications(employerId).then(applications => {
      callback(applications);
      return () => { }; // Return cleanup function
    });
  }

  // Apply for a job
  async applyForJob(jobId, applicationData, applicantId) {
    try {
      // Check if already applied
      const existingApplication = await this.getApplication(jobId, applicantId);
      if (existingApplication) {
        throw new Error('You have already applied for this job');
      }

      const application = {
        jobId,
        applicantId,
        status: APPLICATION_STATUS.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...applicationData
      };

      const docRef = await addDoc(collection(db, 'jobApplications'), application);

      // Update job application count
      await this.updateJobApplicationCount(jobId, 1);

      return { id: docRef.id, ...application };
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  }

  // Submit application (alias for applyForJob)
  async submitApplication(jobId, applicationData, applicantId) {
    return this.applyForJob(jobId, applicationData, applicantId);
  }

  // Get application by job and applicant
  async getApplication(jobId, applicantId) {
    try {
      const q = query(
        collection(db, 'jobApplications'),
        where('jobId', '==', jobId),
        where('applicantId', '==', applicantId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting application:', error);
      return null;
    }
  }

  // Get applications for a job
  async getJobApplications(jobId, status = null) {
    try {
      let q = query(
        collection(db, 'jobApplications'),
        where('jobId', '==', jobId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting job applications:', error);
      throw new Error('Failed to get job applications');
    }
  }

  // Get applications by applicant
  async getApplicantApplications(applicantId, status = null) {
    try {
      let q = query(
        collection(db, 'jobApplications'),
        where('applicantId', '==', applicantId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting applicant applications:', error);
      throw new Error('Failed to get applicant applications');
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      const applicationRef = doc(db, 'jobApplications', applicationId);
      await updateDoc(applicationRef, {
        status,
        notes,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  // Track job view
  async trackJobView(jobId) {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        viewsCount: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error tracking job view:', error);
    }
  }

  // Helper methods
  calculateExpiryDate(durationDays) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    return expiryDate;
  }

  async updateEmployerJobCount(employerId, increment) {
    try {
      const employerRef = doc(db, 'users', employerId);
      await updateDoc(employerRef, {
        jobCount: arrayUnion(increment)
      });
    } catch (error) {
      console.error('Error updating employer job count:', error);
    }
  }

  async updateJobApplicationCount(jobId, increment) {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        applicationsCount: arrayUnion(increment)
      });
    } catch (error) {
      console.error('Error updating job application count:', error);
    }
  }

  // Real-time listeners
  subscribeToJobUpdates(jobId, callback) {
    const jobRef = doc(db, 'jobs', jobId);
    return onSnapshot(jobRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }

  subscribeToJobApplications(jobId, callback) {
    const q = query(
      collection(db, 'jobApplications'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(applications);
    });
  }

  cleanup() {
    this.isInitialized = false;
  }
}

// Create singleton instance
const jobService = new JobService();

// Export individual methods for direct import
export const {
  createJob,
  updateJob,
  deleteJob,
  getJob,
  searchJobs,
  getEmployerJobs,
  getCompanyJobs,
  getCompanyApplications,
  getCompanyDashboardStats,
  subscribeToCompanyJobs,
  subscribeToCompanyApplications,
  applyForJob,
  submitApplication,
  getApplication,
  getJobApplications,
  getApplicantApplications,
  updateApplicationStatus,
  trackJobView,
  subscribeToJobUpdates,
  subscribeToJobApplications
} = jobService;

export default jobService;