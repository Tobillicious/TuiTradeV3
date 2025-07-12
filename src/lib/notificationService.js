// Notification Service - Real-time notifications and job alerts
// Manages user notifications, job alerts, and application status updates

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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Notification types
export const NOTIFICATION_TYPES = {
  JOB_ALERT: 'job_alert',
  APPLICATION_STATUS: 'application_status',
  NEW_APPLICATION: 'new_application',
  MESSAGE: 'message',
  SYSTEM: 'system'
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Create a new notification
 * @param {string} userId - Target user ID
 * @param {Object} notificationData - Notification data
 * @returns {Promise<string>} - Notification ID
 */
export const createNotification = async (userId, notificationData) => {
  try {
    const notification = {
      userId,
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log('Notification created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      unreadOnly = false,
      limitCount = 50,
      type = null
    } = options;

    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    if (type) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Notification marked as read');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notifications = await getUserNotifications(userId, { unreadOnly: true });
    
    const updatePromises = notifications.map(notification =>
      markNotificationAsRead(notification.id)
    );
    
    await Promise.all(updatePromises);
    console.log(`Marked ${notifications.length} notifications as read`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }
};

/**
 * Subscribe to real-time notifications for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToUserNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  });
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Unread count
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const unreadNotifications = await getUserNotifications(userId, { unreadOnly: true });
    return unreadNotifications.length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// ===== JOB ALERT SYSTEM =====

/**
 * Create job alert preferences for a user
 * @param {string} userId - User ID
 * @param {Object} alertData - Alert preferences
 * @returns {Promise<void>}
 */
export const saveJobAlertPreferences = async (userId, alertData) => {
  try {
    const alertRef = doc(db, 'jobAlerts', userId);
    await setDoc(alertRef, {
      ...alertData,
      userId,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('Job alert preferences saved');
  } catch (error) {
    console.error('Error saving job alert preferences:', error);
    throw new Error('Failed to save job alert preferences');
  }
};

/**
 * Get job alert preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Alert preferences or null
 */
export const getJobAlertPreferences = async (userId) => {
  try {
    const alertRef = doc(db, 'jobAlerts', userId);
    const alertSnap = await getDoc(alertRef);
    
    if (alertSnap.exists()) {
      return { id: alertSnap.id, ...alertSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting job alert preferences:', error);
    throw new Error('Failed to fetch job alert preferences');
  }
};

// ===== NOTIFICATION TEMPLATES =====

/**
 * Create a job alert notification
 * @param {string} userId - User ID
 * @param {Object} job - Job data
 * @returns {Promise<string>} - Notification ID
 */
export const createJobAlertNotification = async (userId, job) => {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.JOB_ALERT,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    title: 'New Job Match',
    message: `New job "${job.title}" at ${job.company} matches your preferences`,
    data: {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location
    },
    actionUrl: `/job-detail/${job.id}`
  });
};

/**
 * Create an application status notification
 * @param {string} userId - User ID
 * @param {Object} applicationData - Application data
 * @returns {Promise<string>} - Notification ID
 */
export const createApplicationStatusNotification = async (userId, applicationData) => {
  const statusMessages = {
    'new': 'Your application has been received',
    'reviewing': 'Your application is being reviewed',
    'interviewed': 'You have been scheduled for an interview',
    'offered': 'Congratulations! You have received a job offer',
    'hired': 'Congratulations! You have been hired',
    'rejected': 'Your application was not successful this time'
  };

  const priorities = {
    'new': NOTIFICATION_PRIORITY.LOW,
    'reviewing': NOTIFICATION_PRIORITY.MEDIUM,
    'interviewed': NOTIFICATION_PRIORITY.HIGH,
    'offered': NOTIFICATION_PRIORITY.URGENT,
    'hired': NOTIFICATION_PRIORITY.URGENT,
    'rejected': NOTIFICATION_PRIORITY.MEDIUM
  };

  return createNotification(userId, {
    type: NOTIFICATION_TYPES.APPLICATION_STATUS,
    priority: priorities[applicationData.status] || NOTIFICATION_PRIORITY.MEDIUM,
    title: 'Application Update',
    message: `${statusMessages[applicationData.status]} for ${applicationData.jobTitle} at ${applicationData.company}`,
    data: {
      applicationId: applicationData.id,
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      company: applicationData.company,
      status: applicationData.status
    },
    actionUrl: `/application-detail/${applicationData.id}`
  });
};

/**
 * Create a new application notification for employers
 * @param {string} employerId - Employer user ID
 * @param {Object} applicationData - Application data
 * @returns {Promise<string>} - Notification ID
 */
export const createNewApplicationNotification = async (employerId, applicationData) => {
  return createNotification(employerId, {
    type: NOTIFICATION_TYPES.NEW_APPLICATION,
    priority: NOTIFICATION_PRIORITY.HIGH,
    title: 'New Job Application',
    message: `${applicationData.candidateName} applied for ${applicationData.jobTitle}`,
    data: {
      applicationId: applicationData.id,
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      candidateName: applicationData.candidateName,
      candidateEmail: applicationData.candidateEmail
    },
    actionUrl: `/employer-dashboard?tab=applications&applicationId=${applicationData.id}`
  });
};

/**
 * Create a system notification
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Notification ID
 */
export const createSystemNotification = async (userId, title, message, options = {}) => {
  return createNotification(userId, {
    type: NOTIFICATION_TYPES.SYSTEM,
    priority: options.priority || NOTIFICATION_PRIORITY.MEDIUM,
    title,
    message,
    data: options.data || {},
    actionUrl: options.actionUrl || null
  });
};

// ===== BATCH OPERATIONS =====

/**
 * Send job alert notifications to all users with matching preferences
 * @param {Object} job - New job data
 * @returns {Promise<number>} - Number of notifications sent
 */
export const sendJobAlertNotifications = async (job) => {
  try {
    // Get all active job alert preferences
    const alertsRef = collection(db, 'jobAlerts');
    const q = query(alertsRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    let notificationsSent = 0;
    const promises = [];

    querySnapshot.forEach((doc) => {
      const alertPrefs = doc.data();
      
      // Check if job matches user preferences
      if (jobMatchesPreferences(job, alertPrefs)) {
        promises.push(
          createJobAlertNotification(alertPrefs.userId, job)
            .then(() => notificationsSent++)
            .catch(error => console.error('Failed to send job alert:', error))
        );
      }
    });

    await Promise.all(promises);
    console.log(`Sent ${notificationsSent} job alert notifications for job: ${job.title}`);
    return notificationsSent;
  } catch (error) {
    console.error('Error sending job alert notifications:', error);
    return 0;
  }
};

/**
 * Check if a job matches user alert preferences
 * @param {Object} job - Job data
 * @param {Object} preferences - User preferences
 * @returns {boolean} - Whether job matches
 */
const jobMatchesPreferences = (job, preferences) => {
  // Match by keywords
  if (preferences.keywords && preferences.keywords.length > 0) {
    const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    const hasMatchingKeyword = preferences.keywords.some(keyword =>
      jobText.includes(keyword.toLowerCase())
    );
    if (!hasMatchingKeyword) return false;
  }

  // Match by location
  if (preferences.locations && preferences.locations.length > 0) {
    if (!preferences.locations.includes(job.location)) return false;
  }

  // Match by job type
  if (preferences.jobTypes && preferences.jobTypes.length > 0) {
    if (!preferences.jobTypes.includes(job.type)) return false;
  }

  // Match by salary range
  if (preferences.salaryMin && job.salaryMax) {
    if (parseInt(job.salaryMax) < parseInt(preferences.salaryMin)) return false;
  }
  if (preferences.salaryMax && job.salaryMin) {
    if (parseInt(job.salaryMin) > parseInt(preferences.salaryMax)) return false;
  }

  return true;
};

export default {
  // Core notification functions
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToUserNotifications,
  getUnreadNotificationCount,
  
  // Job alert functions
  saveJobAlertPreferences,
  getJobAlertPreferences,
  sendJobAlertNotifications,
  
  // Notification templates
  createJobAlertNotification,
  createApplicationStatusNotification,
  createNewApplicationNotification,
  createSystemNotification,
  
  // Constants
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY
};