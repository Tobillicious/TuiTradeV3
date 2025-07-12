// Comprehensive API Service - Secure, scalable API integration layer
// Handles authentication, rate limiting, caching, and error handling

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { auth, db, storage } from './firebase';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://api.tuitrade.co.nz',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  }
};

// Rate limiting store
const rateLimitStore = new Map();

// Cache store
const cacheStore = new Map();

// Security utilities
class SecurityManager {
  static validateInput(input, type) {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'password':
        return input.length >= 8 && 
               /[A-Z]/.test(input) && 
               /[a-z]/.test(input) && 
               /\d/.test(input);
      case 'phone':
        return /^(\+64|0)[2-9]\d{7,9}$/.test(input.replace(/\s/g, ''));
      case 'postcode':
        return /^\d{4}$/.test(input);
      case 'name':
        return input.length >= 2 && input.length <= 50 && /^[a-zA-Z\s'-]+$/.test(input);
      case 'businessNumber':
        return /^\d{8}$/.test(input); // NZ Company Number
      case 'irdNumber':
        return /^\d{8,9}$/.test(input); // NZ IRD Number
      default:
        return true;
    }
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static checkRateLimit(userId, endpoint) {
    const key = `${userId}-${endpoint}`;
    const now = Date.now();
    const requests = rateLimitStore.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(
      timestamp => now - timestamp < API_CONFIG.rateLimit.windowMs
    );
    
    if (validRequests.length >= API_CONFIG.rateLimit.maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    return true;
  }
}

// Advanced caching with TTL
class CacheManager {
  static set(key, data, ttl = 300000) { // 5 minutes default
    const expiresAt = Date.now() + ttl;
    cacheStore.set(key, { data, expiresAt });
  }

  static get(key) {
    const cached = cacheStore.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static invalidate(pattern) {
    for (const [key] of cacheStore.entries()) {
      if (key.includes(pattern)) {
        cacheStore.delete(key);
      }
    }
  }

  static clear() {
    cacheStore.clear();
  }
}

// Enhanced error handling
class APIError extends Error {
  constructor(message, code, statusCode = 500, details = {}) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Retry mechanism
async function withRetry(operation, maxAttempts = API_CONFIG.retryAttempts) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.code === 'permission-denied' ||
        error.code === 'unauthenticated' ||
        error.statusCode === 400 ||
        error.statusCode === 401 ||
        error.statusCode === 403
      ) {
        throw error;
      }
      
      if (attempt < maxAttempts) {
        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Main API Service Class
export class APIService {
  // Authentication Methods
  static async signUp(email, password, userData) {
    try {
      // Validate inputs
      if (!SecurityManager.validateInput(email, 'email')) {
        throw new APIError('Invalid email format', 'INVALID_EMAIL', 400);
      }
      
      if (!SecurityManager.validateInput(password, 'password')) {
        throw new APIError(
          'Password must be at least 8 characters with uppercase, lowercase, and number',
          'WEAK_PASSWORD',
          400
        );
      }

      // Sanitize user data
      const sanitizedUserData = {
        firstName: SecurityManager.sanitizeInput(userData.firstName),
        lastName: SecurityManager.sanitizeInput(userData.lastName),
        phone: SecurityManager.sanitizeInput(userData.phone),
        location: SecurityManager.sanitizeInput(userData.location),
        userType: userData.userType || 'job_seeker',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        emailVerified: false,
        profileCompletion: 30
      };

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: `${sanitizedUserData.firstName} ${sanitizedUserData.lastName}`
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...sanitizedUserData,
        email: email.toLowerCase(),
        uid: user.uid
      });

      // Create user preferences
      await setDoc(doc(db, 'userPreferences', user.uid), {
        notifications: {
          email: true,
          push: true,
          jobAlerts: true,
          applicationUpdates: true
        },
        privacy: {
          profileVisible: true,
          contactInfoVisible: false,
          resumeVisible: false
        },
        jobSearch: {
          savedSearches: [],
          preferredLocations: [],
          salaryRange: { min: 0, max: 200000 }
        },
        createdAt: serverTimestamp()
      });

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...sanitizedUserData
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw new APIError(
        error.message || 'Failed to create account',
        error.code || 'SIGNUP_FAILED',
        500,
        { originalError: error }
      );
    }
  }

  static async signIn(email, password) {
    try {
      if (!SecurityManager.validateInput(email, 'email')) {
        throw new APIError('Invalid email format', 'INVALID_EMAIL', 400);
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new APIError(
        error.message || 'Failed to sign in',
        error.code || 'SIGNIN_FAILED',
        401,
        { originalError: error }
      );
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw new APIError(
        'Failed to sign out',
        'SIGNOUT_FAILED',
        500,
        { originalError: error }
      );
    }
  }

  // User Management
  static async getUserProfile(userId) {
    try {
      const cacheKey = `user-profile-${userId}`;
      const cached = CacheManager.get(cacheKey);
      if (cached) return cached;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new APIError('User not found', 'USER_NOT_FOUND', 404);
      }

      const userData = userDoc.data();
      CacheManager.set(cacheKey, userData, 600000); // 10 minutes cache
      
      return userData;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new APIError(
        'Failed to get user profile',
        'GET_PROFILE_FAILED',
        500,
        { originalError: error }
      );
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      SecurityManager.checkRateLimit(userId, 'update-profile');

      // Sanitize updates
      const sanitizedUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'string') {
          sanitizedUpdates[key] = SecurityManager.sanitizeInput(value);
        } else {
          sanitizedUpdates[key] = value;
        }
      }

      sanitizedUpdates.updatedAt = serverTimestamp();

      await updateDoc(doc(db, 'users', userId), sanitizedUpdates);
      
      // Invalidate cache
      CacheManager.invalidate(`user-profile-${userId}`);
      
      return { success: true, updates: sanitizedUpdates };
    } catch (error) {
      console.error('Update user profile error:', error);
      throw new APIError(
        'Failed to update user profile',
        'UPDATE_PROFILE_FAILED',
        500,
        { originalError: error }
      );
    }
  }

  // File Upload with Security
  static async uploadFile(file, path, userId) {
    try {
      SecurityManager.checkRateLimit(userId, 'file-upload');

      // Validate file
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new APIError(
          'File type not allowed',
          'INVALID_FILE_TYPE',
          400,
          { allowedTypes }
        );
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new APIError(
          'File size exceeds 10MB limit',
          'FILE_TOO_LARGE',
          400,
          { maxSize: '10MB' }
        );
      }

      // Generate secure filename
      const timestamp = Date.now();
      const secureToken = SecurityManager.generateSecureToken().substring(0, 8);
      const fileExtension = file.name.split('.').pop();
      const secureFileName = `${timestamp}_${secureToken}.${fileExtension}`;
      const fullPath = `${path}/${userId}/${secureFileName}`;

      // Upload file
      const storageRef = ref(storage, fullPath);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Log upload for security audit
      await setDoc(doc(db, 'fileUploads', secureToken), {
        fileName: secureFileName,
        originalName: file.name,
        filePath: fullPath,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: userId,
        uploadedAt: serverTimestamp(),
        downloadURL
      });

      return {
        fileName: secureFileName,
        downloadURL,
        filePath: fullPath,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new APIError(
        'Failed to upload file',
        'UPLOAD_FAILED',
        500,
        { originalError: error }
      );
    }
  }

  // Security audit logging
  static async logSecurityEvent(userId, eventType, details = {}) {
    try {
      await setDoc(doc(collection(db, 'securityLogs')), {
        userId,
        eventType,
        details,
        timestamp: serverTimestamp(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      });
    } catch (error) {
      console.error('Security logging error:', error);
      // Don't throw - logging should be silent
    }
  }

  // Health check and monitoring
  static async healthCheck() {
    try {
      const testDoc = await getDoc(doc(db, 'system', 'health'));
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          firestore: 'operational',
          auth: 'operational',
          storage: 'operational'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// Export utility classes
export { SecurityManager, CacheManager, APIError };

// Default export
export default APIService;