// =============================================
// securityService.js - Security & Compliance Utilities
// ----------------------------------------------------
// Provides helpers for enforcing security best practices, input validation,
// and compliance checks throughout the app.
// =============================================

import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Security Configuration
const SECURITY_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  passwordComplexity: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  trustedDomains: [
    'tuitrade.co.nz',
    'localhost',
    '127.0.0.1'
  ],
  suspiciousPatterns: [
    /script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]
};

// Threat detection patterns
const THREAT_PATTERNS = {
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(';|';--|'\/\*)/gi
  ],
  xss: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /eval\s*\(/gi
  ],
  pathTraversal: [
    /\.\.\//g,
    /\.\.\\\\?/g,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi
  ],
  commandInjection: [
    /;\s*(cat|ls|pwd|whoami|id|uname)/gi,
    /\|\s*(cat|ls|pwd|whoami|id|uname)/gi,
    /&&\s*(cat|ls|pwd|whoami|id|uname)/gi
  ]
};

// Content Security Policy
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://www.gstatic.com', 'https://www.google.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://api.tuitrade.co.nz', 'wss://'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Security event types
const SECURITY_EVENTS = {
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  ACCOUNT_LOCKED: 'account_locked',
  PASSWORD_CHANGE: 'password_change',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  XSS_ATTEMPT: 'xss_attempt',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  FILE_UPLOAD_BLOCKED: 'file_upload_blocked',
  CSRF_TOKEN_MISMATCH: 'csrf_token_mismatch'
};

class SecurityService {
  // Initialize security headers and CSP
  static initializeSecurityHeaders() {
    // Set Content Security Policy
    const csp = Object.entries(CSP_DIRECTIVES)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    // Set additional security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' }
    ];

    securityHeaders.forEach(header => {
      const meta = document.createElement('meta');
      meta.name = header.name;
      meta.content = header.content;
      document.head.appendChild(meta);
    });
  }

  // CSRF Protection
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Store in session storage
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  static validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken && storedToken === token;
  }

  // Input Sanitization and Validation
  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return input;

    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Basic XSS protection
    if (!options.allowHTML) {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Remove suspicious patterns
    SECURITY_CONFIG.suspiciousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Trim whitespace
    sanitized = sanitized.trim();

    // Length limiting
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  // Threat Detection
  static detectThreats(input) {
    const threats = [];

    if (typeof input !== 'string') return threats;

    // Check for SQL injection
    THREAT_PATTERNS.sqlInjection.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'sql_injection',
          pattern: index,
          severity: 'high',
          matched: input.match(pattern)
        });
      }
    });

    // Check for XSS
    THREAT_PATTERNS.xss.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'xss',
          pattern: index,
          severity: 'high',
          matched: input.match(pattern)
        });
      }
    });

    // Check for path traversal
    THREAT_PATTERNS.pathTraversal.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'path_traversal',
          pattern: index,
          severity: 'medium',
          matched: input.match(pattern)
        });
      }
    });

    // Check for command injection
    THREAT_PATTERNS.commandInjection.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'command_injection',
          pattern: index,
          severity: 'high',
          matched: input.match(pattern)
        });
      }
    });

    return threats;
  }

  // Password Security
  static validatePasswordStrength(password) {
    const result = {
      isValid: true,
      score: 0,
      feedback: []
    };

    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      result.isValid = false;
      result.feedback.push(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`);
    } else {
      result.score += 25;
    }

    if (SECURITY_CONFIG.passwordComplexity.requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false;
      result.feedback.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      result.score += 25;
    }

    if (SECURITY_CONFIG.passwordComplexity.requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false;
      result.feedback.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      result.score += 25;
    }

    if (SECURITY_CONFIG.passwordComplexity.requireNumbers && !/\d/.test(password)) {
      result.isValid = false;
      result.feedback.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      result.score += 25;
    }

    if (SECURITY_CONFIG.passwordComplexity.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.isValid = false;
      result.feedback.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.score += 10;
    }

    // Check for common patterns
    const commonPatterns = [
      /(.)\1{2,}/g, // Repeated characters
      /123456|abcdef|qwerty/gi, // Common sequences
      /password|admin|user/gi // Common words
    ];

    commonPatterns.forEach(pattern => {
      if (pattern.test(password)) {
        result.score -= 15;
        result.feedback.push('Avoid common patterns and sequences');
      }
    });

    result.score = Math.max(0, Math.min(100, result.score));
    return result;
  }

  // Account Security
  static async checkAccountLockout(userId) {
    try {
      const lockoutDoc = await getDoc(doc(db, 'accountLockouts', userId));

      if (lockoutDoc.exists()) {
        const lockoutData = lockoutDoc.data();
        const now = Date.now();

        if (now < lockoutData.lockedUntil.toMillis()) {
          const remainingTime = Math.ceil((lockoutData.lockedUntil.toMillis() - now) / 1000 / 60);
          return {
            isLocked: true,
            remainingMinutes: remainingTime,
            attempts: lockoutData.attempts
          };
        } else {
          // Lockout expired, remove the document
          await this.clearAccountLockout(userId);
        }
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return { isLocked: false };
    }
  }

  static async recordFailedLogin(userId, ip = 'unknown') {
    try {
      const lockoutRef = doc(db, 'accountLockouts', userId);
      const lockoutDoc = await getDoc(lockoutRef);

      let attempts = 1;

      if (lockoutDoc.exists()) {
        const data = lockoutDoc.data();
        attempts = (data.attempts || 0) + 1;
      }

      if (attempts >= SECURITY_CONFIG.maxLoginAttempts) {
        // Lock the account
        const lockoutTime = new Date(Date.now() + SECURITY_CONFIG.lockoutDuration);

        await setDoc(lockoutRef, {
          attempts,
          lockedUntil: lockoutTime,
          lastAttemptAt: new Date(),
          lastAttemptIP: ip
        });

        await this.logSecurityEvent(userId, SECURITY_EVENTS.ACCOUNT_LOCKED, {
          attempts,
          lockoutDuration: SECURITY_CONFIG.lockoutDuration,
          ip
        });

        return { locked: true, attempts };
      } else {
        await setDoc(lockoutRef, {
          attempts,
          lastAttemptAt: new Date(),
          lastAttemptIP: ip
        });

        return { locked: false, attempts };
      }
    } catch (error) {
      console.error('Error recording failed login:', error);
      return { locked: false, attempts: 0 };
    }
  }

  static async clearAccountLockout(userId) {
    try {
      await doc(db, 'accountLockouts', userId).delete();
    } catch (error) {
      console.error('Error clearing account lockout:', error);
    }
  }

  // Security Event Logging
  static async logSecurityEvent(userId, eventType, details = {}) {
    try {
      const eventData = {
        userId,
        eventType,
        details,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        sessionId: sessionStorage.getItem('session_id') || 'unknown'
      };

      await setDoc(doc(collection(db, 'securityEvents')), eventData);

      // If it's a high-severity event, also log to security alerts
      const highSeverityEvents = [
        SECURITY_EVENTS.XSS_ATTEMPT,
        SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
        SECURITY_EVENTS.ACCOUNT_LOCKED,
        SECURITY_EVENTS.UNAUTHORIZED_ACCESS
      ];

      if (highSeverityEvents.includes(eventType)) {
        await setDoc(doc(collection(db, 'securityAlerts')), {
          ...eventData,
          severity: 'high',
          acknowledged: false
        });
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Session Management
  static initializeSession(userId) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + SECURITY_CONFIG.sessionTimeout
    };

    sessionStorage.setItem('session_id', sessionId);
    sessionStorage.setItem('session_data', JSON.stringify(sessionData));

    return sessionId;
  }

  static validateSession() {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('session_data') || '{}');
      const now = Date.now();

      if (!sessionData.id || now > sessionData.expiresAt) {
        this.clearSession();
        return false;
      }

      // Update last activity
      sessionData.lastActivity = now;
      sessionStorage.setItem('session_data', JSON.stringify(sessionData));

      return true;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  static clearSession() {
    sessionStorage.removeItem('session_id');
    sessionStorage.removeItem('session_data');
    sessionStorage.removeItem('csrf_token');
  }

  static generateSessionId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // URL and Domain Validation
  static validateOrigin(origin) {
    try {
      const url = new URL(origin);
      return SECURITY_CONFIG.trustedDomains.some(domain =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
    } catch (error) {
      return false;
    }
  }

  // File Upload Security
  static validateFile(file) {
    const errors = [];

    // Check file type
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
      errors.push('File type not allowed');
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file name for suspicious patterns
    const threats = this.detectThreats(file.name);
    if (threats.length > 0) {
      errors.push('Suspicious file name detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Performance and Monitoring
  static async getSecurityMetrics(userId, timeRange = '24h') {
    try {
      const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      const since = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));

      const eventsQuery = query(
        collection(db, 'securityEvents'),
        where('userId', '==', userId),
        where('timestamp', '>=', since),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const metrics = {
        totalEvents: events.length,
        eventsByType: {},
        failedLogins: 0,
        suspiciousActivity: 0,
        lastActivity: null
      };

      events.forEach(event => {
        metrics.eventsByType[event.eventType] = (metrics.eventsByType[event.eventType] || 0) + 1;

        if (event.eventType === SECURITY_EVENTS.LOGIN_FAILURE) {
          metrics.failedLogins++;
        }

        if ([
          SECURITY_EVENTS.XSS_ATTEMPT,
          SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
          SECURITY_EVENTS.SUSPICIOUS_ACTIVITY
        ].includes(event.eventType)) {
          metrics.suspiciousActivity++;
        }

        if (!metrics.lastActivity || event.timestamp > metrics.lastActivity) {
          metrics.lastActivity = event.timestamp;
        }
      });

      return metrics;
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return null;
    }
  }
}

// Export security event constants for use in other modules
export { SECURITY_EVENTS, SECURITY_CONFIG };

export default SecurityService;