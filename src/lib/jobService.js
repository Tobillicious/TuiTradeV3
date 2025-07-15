// =============================================
// jobService.js - Real Job Management Service
// ---------------------------------------------
// Firebase-based job posting and search functionality
// Replaces mock data with real Firestore integration
// =============================================

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
  serverTimestamp,
  runTransaction,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationService';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, WORK_RIGHTS, EXPERIENCE_LEVELS, NZ_LOCATIONS, COMPANY_SIZES, COMMON_BENEFITS } from './jobsData';

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
  VIEWED: 'viewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

class JobService {
  constructor() {
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('JobService initialized with Firebase integration');
  }

  // Create a new job posting
  async createJob(jobData, employerId) {
    try {
      const job = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employerId,
        
        // Basic information
        title: jobData.title,
        company: jobData.company,
        companyId: jobData.companyId,
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        
        // Location and categorization
        location: jobData.location,
        region: jobData.region,
        isRemote: jobData.isRemote || false,
        category: jobData.category,
        subcategory: jobData.subcategory,
        
        // Job details
        type: jobData.type || JOB_TYPES[0],
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryType: jobData.salaryType || 'annual', // annual, hourly, contract
        experience: jobData.experience,
        workRights: jobData.workRights,
        
        // Benefits and perks
        benefits: jobData.benefits || [],
        perks: jobData.perks || [],
        
        // Company information
        companySize: jobData.companySize,
        companyLogo: jobData.companyLogo,
        companyWebsite: jobData.companyWebsite,
        
        // Application settings
        applicationMethod: jobData.applicationMethod || 'platform', // platform, email, external
        applicationEmail: jobData.applicationEmail,
        applicationUrl: jobData.applicationUrl,
        applicationInstructions: jobData.applicationInstructions,
        
        // Posting settings
        status: JOB_STATUS.ACTIVE,
        featured: jobData.featured || false,
        urgent: jobData.urgent || false,
        expiryDate: jobData.expiryDate,
        
        // Tracking
        views: 0,
        applications: 0,
        saves: 0,
        
        // Arrays for tracking interactions
        viewedBy: [],
        savedBy: [],
        appliedBy: [],
        
        // SEO and search
        keywords: jobData.keywords || [],
        tags: jobData.tags || [],
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp()
      };

      // Add job to Firestore
      const docRef = await addDoc(collection(db, 'jobs'), job);
      const createdJob = { ...job, firestoreId: docRef.id };

      // Update company's job count
      await this.updateCompanyJobCount(jobData.companyId, 1);

      // Create notification for admin
      await createNotification('admin', {
        type: 'new_job_posted',
        title: 'New Job Posted',
        message: `${job.title} at ${job.company}`,
        data: { jobId: docRef.id }
      });

      return createdJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Get jobs with filters and pagination
  async getJobs(filters = {}, paginationOptions = {}) {
    try {
      const {
        category,
        subcategory,
        location,
        region,
        type,
        experience,
        workRights,
        salaryMin,
        salaryMax,
        keywords,
        isRemote,
        featured,
        status = JOB_STATUS.ACTIVE,
        companyId,
        employerId
      } = filters;

      const {
        limitCount = 20,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        lastDoc = null
      } = paginationOptions;

      // Build query
      let q = collection(db, 'jobs');
      const queryConstraints = [];

      // Status filter (always apply)
      queryConstraints.push(where('status', '==', status));

      // Apply filters
      if (category) queryConstraints.push(where('category', '==', category));
      if (subcategory) queryConstraints.push(where('subcategory', '==', subcategory));
      if (region) queryConstraints.push(where('region', '==', region));
      if (type) queryConstraints.push(where('type', '==', type));
      if (experience) queryConstraints.push(where('experience', '==', experience));
      if (workRights) queryConstraints.push(where('workRights', '==', workRights));
      if (isRemote !== undefined) queryConstraints.push(where('isRemote', '==', isRemote));
      if (featured !== undefined) queryConstraints.push(where('featured', '==', featured));
      if (companyId) queryConstraints.push(where('companyId', '==', companyId));
      if (employerId) queryConstraints.push(where('employerId', '==', employerId));

      // Salary filtering (requires composite index)
      if (salaryMin) queryConstraints.push(where('salaryMax', '>=', salaryMin));
      if (salaryMax) queryConstraints.push(where('salaryMin', '<=', salaryMax));

      // Ordering
      queryConstraints.push(orderBy(orderByField, orderDirection));

      // Pagination
      if (lastDoc) queryConstraints.push(startAfter(lastDoc));
      queryConstraints.push(limit(limitCount));

      // Execute query
      q = query(q, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      let jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data()
      }));

      // Client-side filtering for complex queries (keywords, location)
      if (keywords) {
        const keywordArray = keywords.toLowerCase().split(' ').filter(k => k.trim());
        jobs = jobs.filter(job => 
          keywordArray.some(keyword => 
            job.title.toLowerCase().includes(keyword) ||
            job.company.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword) ||
            job.keywords?.some(k => k.toLowerCase().includes(keyword))
          )
        );
      }

      if (location && !region) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      return {
        jobs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  // Get a single job by ID
  async getJob(jobId) {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      const jobData = { id: jobDoc.id, firestoreId: jobDoc.id, ...jobDoc.data() };

      // Get company details if available
      if (jobData.companyId) {
        const companyDoc = await getDoc(doc(db, 'companies', jobData.companyId));
        if (companyDoc.exists()) {
          jobData.companyDetails = companyDoc.data();
        }
      }

      return jobData;
    } catch (error) {
      console.error('Error getting job:', error);
      throw error;
    }
  }

  // Update job
  async updateJob(jobId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'jobs', jobId), updateData);
      return await this.getJob(jobId);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  // Track job view
  async trackJobView(jobId, userId = null) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await transaction.get(jobRef);

        if (!jobDoc.exists()) {
          throw new Error('Job not found');
        }

        const jobData = jobDoc.data();
        const viewedBy = jobData.viewedBy || [];
        
        // Only increment if user hasn't viewed before (or if no user)
        let shouldIncrement = true;
        if (userId && viewedBy.includes(userId)) {
          shouldIncrement = false;
        }

        if (shouldIncrement) {
          const updates = {
            views: (jobData.views || 0) + 1,
            updatedAt: serverTimestamp()
          };

          if (userId && !viewedBy.includes(userId)) {
            updates.viewedBy = arrayUnion(userId);
          }

          transaction.update(jobRef, updates);
        }

        return jobData.views + (shouldIncrement ? 1 : 0);
      });

      return result;
    } catch (error) {
      console.error('Error tracking job view:', error);
      throw error;
    }
  }

  // Save/unsave job
  async toggleJobSave(jobId, userId) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await transaction.get(jobRef);

        if (!jobDoc.exists()) {
          throw new Error('Job not found');
        }

        const jobData = jobDoc.data();
        const savedBy = jobData.savedBy || [];
        const isSaved = savedBy.includes(userId);

        const updates = {
          savedBy: isSaved ? arrayRemove(userId) : arrayUnion(userId),
          saves: Math.max(0, (jobData.saves || 0) + (isSaved ? -1 : 1)),
          updatedAt: serverTimestamp()
        };

        transaction.update(jobRef, updates);

        return !isSaved;
      });

      return result;
    } catch (error) {
      console.error('Error toggling job save:', error);
      throw error;
    }
  }

  // Apply to job
  async applyToJob(jobId, userId, applicationData) {
    try {
      const application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobId,
        applicantId: userId,
        
        // Application content
        coverLetter: applicationData.coverLetter || '',
        resumeUrl: applicationData.resumeUrl,
        portfolioUrl: applicationData.portfolioUrl,
        answers: applicationData.answers || {}, // Custom questions
        
        // Status tracking
        status: APPLICATION_STATUS.PENDING,
        
        // Timestamps
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Check if user already applied
      const existingApplications = await getDocs(query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        where('applicantId', '==', userId)
      ));

      if (!existingApplications.empty) {
        throw new Error('You have already applied to this job');
      }

      // Add application
      const docRef = await addDoc(collection(db, 'applications'), application);
      const createdApplication = { ...application, firestoreId: docRef.id };

      // Update job application count
      await runTransaction(db, async (transaction) => {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await transaction.get(jobRef);

        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          transaction.update(jobRef, {
            applications: (jobData.applications || 0) + 1,
            appliedBy: arrayUnion(userId),
            updatedAt: serverTimestamp()
          });
        }
      });

      // Get job details for notification
      const job = await this.getJob(jobId);
      
      // Notify employer
      await createNotification(job.employerId, {
        type: 'new_application',
        title: 'New Job Application',
        message: `New application for ${job.title}`,
        data: { jobId, applicationId: docRef.id }
      });

      return createdApplication;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  // Get applications for a job (employer view)
  async getJobApplications(jobId, status = null) {
    try {
      let q = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        orderBy('appliedAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data()
      }));

      // Get applicant details
      for (const application of applications) {
        const userDoc = await getDoc(doc(db, 'users', application.applicantId));
        if (userDoc.exists()) {
          application.applicantDetails = {
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            email: userDoc.data().email,
            profileImage: userDoc.data().profileImage,
            location: userDoc.data().location
          };
        }
      }

      return applications;
    } catch (error) {
      console.error('Error getting job applications:', error);
      throw error;
    }
  }

  // Get user's applications (candidate view)
  async getUserApplications(userId, status = null) {
    try {
      let q = query(
        collection(db, 'applications'),
        where('applicantId', '==', userId),
        orderBy('appliedAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data()
      }));

      // Get job details for each application
      for (const application of applications) {
        const job = await this.getJob(application.jobId);
        application.jobDetails = {
          title: job.title,
          company: job.company,
          location: job.location,
          companyLogo: job.companyLogo
        };
      }

      return applications;
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw error;
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        statusNotes: notes,
        updatedAt: serverTimestamp()
      });

      // Get application details for notification
      const appDoc = await getDoc(doc(db, 'applications', applicationId));
      if (appDoc.exists()) {
        const appData = appDoc.data();
        const job = await this.getJob(appData.jobId);

        // Notify applicant of status change
        await createNotification(appData.applicantId, {
          type: 'application_status_update',
          title: 'Application Status Update',
          message: `Your application for ${job.title} has been ${status}`,
          data: { jobId: appData.jobId, applicationId, status }
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Search jobs with advanced filters
  async searchJobs(searchParams) {
    const {
      keywords = '',
      location = '',
      category = '',
      salaryMin = 0,
      sortBy = 'relevance', // relevance, date, salary
      limit: limitCount = 20,
      offset = 0
    } = searchParams;

    try {
      // Get base results
      const filters = {};
      if (category) filters.category = category;
      if (location) filters.region = location;
      if (salaryMin > 0) filters.salaryMin = salaryMin;

      const result = await this.getJobs(filters, {
        limitCount: limitCount + offset,
        orderByField: sortBy === 'date' ? 'createdAt' : 'featured',
        orderDirection: 'desc'
      });

      let jobs = result.jobs;

      // Apply keyword search
      if (keywords.trim()) {
        const keywordArray = keywords.toLowerCase().split(' ').filter(k => k.trim());
        jobs = jobs.filter(job => {
          const searchableText = [
            job.title,
            job.company,
            job.description,
            job.location,
            ...(job.keywords || [])
          ].join(' ').toLowerCase();

          return keywordArray.every(keyword => searchableText.includes(keyword));
        });
      }

      // Sort by relevance if needed
      if (sortBy === 'relevance' && keywords.trim()) {
        jobs = this.sortJobsByRelevance(jobs, keywords);
      } else if (sortBy === 'salary') {
        jobs = jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      }

      // Apply pagination
      const paginatedJobs = jobs.slice(offset, offset + limitCount);

      return {
        jobs: paginatedJobs,
        total: jobs.length,
        hasMore: offset + limitCount < jobs.length
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  // Sort jobs by relevance score
  sortJobsByRelevance(jobs, keywords) {
    const keywordArray = keywords.toLowerCase().split(' ').filter(k => k.trim());
    
    return jobs.map(job => {
      let score = 0;
      const title = job.title.toLowerCase();
      const description = job.description.toLowerCase();
      const company = job.company.toLowerCase();

      keywordArray.forEach(keyword => {
        // Title matches get highest score
        if (title.includes(keyword)) score += 10;
        // Company name matches
        if (company.includes(keyword)) score += 5;
        // Description matches
        if (description.includes(keyword)) score += 1;
      });

      // Boost featured jobs
      if (job.featured) score += 2;
      
      // Boost recent jobs
      const daysSincePosted = (Date.now() - job.createdAt?.toDate?.()?.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePosted < 7) score += 1;

      return { ...job, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Update company job count
  async updateCompanyJobCount(companyId, increment) {
    try {
      if (!companyId) return;

      const companyRef = doc(db, 'companies', companyId);
      const companyDoc = await getDoc(companyRef);

      if (companyDoc.exists()) {
        const currentCount = companyDoc.data().activeJobs || 0;
        await updateDoc(companyRef, {
          activeJobs: Math.max(0, currentCount + increment),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating company job count:', error);
    }
  }

  // Close/expire job
  async closeJob(jobId, reason = 'closed') {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: reason === 'expired' ? JOB_STATUS.EXPIRED : JOB_STATUS.CLOSED,
        closedAt: serverTimestamp(),
        closureReason: reason,
        updatedAt: serverTimestamp()
      });

      const job = await this.getJob(jobId);
      await this.updateCompanyJobCount(job.companyId, -1);

      return true;
    } catch (error) {
      console.error('Error closing job:', error);
      throw error;
    }
  }

  // Get job statistics
  async getJobStats(employerId = null, companyId = null) {
    try {
      let baseQuery = collection(db, 'jobs');
      const constraints = [];

      if (employerId) constraints.push(where('employerId', '==', employerId));
      if (companyId) constraints.push(where('companyId', '==', companyId));

      if (constraints.length > 0) {
        baseQuery = query(baseQuery, ...constraints);
      }

      const snapshot = await getDocs(baseQuery);
      const jobs = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: jobs.length,
        active: jobs.filter(job => job.status === JOB_STATUS.ACTIVE).length,
        draft: jobs.filter(job => job.status === JOB_STATUS.DRAFT).length,
        closed: jobs.filter(job => job.status === JOB_STATUS.CLOSED).length,
        totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
        totalApplications: jobs.reduce((sum, job) => sum + (job.applications || 0), 0),
        averageApplicationsPerJob: jobs.length > 0 
          ? Math.round(jobs.reduce((sum, job) => sum + (job.applications || 0), 0) / jobs.length) 
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw error;
    }
  }

  cleanup() {
    this.isInitialized = false;
  }
}

// Create singleton instance
const jobService = new JobService();

// Export service and constants
export default jobService;
export { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, WORK_RIGHTS, EXPERIENCE_LEVELS, NZ_LOCATIONS, COMPANY_SIZES, COMMON_BENEFITS };