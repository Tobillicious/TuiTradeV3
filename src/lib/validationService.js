// Advanced Data Validation Service - Comprehensive input validation and business logic
// Handles complex validation rules, business constraints, and data integrity

import SecurityService from './securityService';

// New Zealand specific validation patterns
const NZ_PATTERNS = {
  postcode: /^\d{4}$/,
  phone: /^(\+64|0)[2-9]\d{7,9}$/,
  irdNumber: /^\d{8,9}$/,
  companyNumber: /^\d{8}$/,
  bankAccount: /^\d{2}-\d{4}-\d{7}-\d{2,3}$/,
  abn: /^\d{11}$/, // For Australian companies
  address: /^[a-zA-Z0-9\s,.-]+$/,
  suburb: /^[a-zA-Z\s'-]+$/
};

// Business validation rules
const BUSINESS_RULES = {
  user: {
    age: { min: 16, max: 120 },
    nameLength: { min: 2, max: 50 },
    bioLength: { max: 500 },
    skillsMax: 20,
    experienceYears: { min: 0, max: 60 }
  },
  job: {
    titleLength: { min: 5, max: 100 },
    descriptionLength: { min: 50, max: 5000 },
    salaryMin: 30000,
    salaryMax: 500000,
    maxApplications: 1000,
    daysToExpire: { min: 1, max: 90 }
  },
  application: {
    coverLetterLength: { min: 100, max: 2000 },
    experienceLength: { max: 1000 },
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt']
  },
  company: {
    nameLength: { min: 2, max: 100 },
    descriptionLength: { min: 20, max: 2000 },
    maxEmployees: 100000,
    foundedYear: { min: 1800, max: new Date().getFullYear() }
  }
};

// Validation error types
const VALIDATION_ERRORS = {
  REQUIRED: 'required',
  FORMAT: 'format',
  LENGTH: 'length',
  RANGE: 'range',
  BUSINESS_RULE: 'business_rule',
  SECURITY: 'security',
  DUPLICATE: 'duplicate',
  RELATIONSHIP: 'relationship'
};

class ValidationService {
  // Core validation methods
  static validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.REQUIRED,
          field: fieldName,
          message: `${fieldName} is required`
        }
      };
    }
    return { isValid: true };
  }

  static validateLength(value, min, max, fieldName) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    if (min && value.length < min) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.LENGTH,
          field: fieldName,
          message: `${fieldName} must be at least ${min} characters long`,
          actual: value.length,
          expected: { min, max }
        }
      };
    }

    if (max && value.length > max) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.LENGTH,
          field: fieldName,
          message: `${fieldName} must be no more than ${max} characters long`,
          actual: value.length,
          expected: { min, max }
        }
      };
    }

    return { isValid: true };
  }

  static validateRange(value, min, max, fieldName) {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.FORMAT,
          field: fieldName,
          message: `${fieldName} must be a valid number`
        }
      };
    }

    if (min !== undefined && numValue < min) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.RANGE,
          field: fieldName,
          message: `${fieldName} must be at least ${min}`,
          actual: numValue,
          expected: { min, max }
        }
      };
    }

    if (max !== undefined && numValue > max) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.RANGE,
          field: fieldName,
          message: `${fieldName} must be no more than ${max}`,
          actual: numValue,
          expected: { min, max }
        }
      };
    }

    return { isValid: true };
  }

  static validatePattern(value, pattern, fieldName, customMessage) {
    if (!pattern.test(value)) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.FORMAT,
          field: fieldName,
          message: customMessage || `${fieldName} format is invalid`
        }
      };
    }
    return { isValid: true };
  }

  // New Zealand specific validators
  static validateNZPostcode(postcode) {
    return this.validatePattern(
      postcode,
      NZ_PATTERNS.postcode,
      'postcode',
      'Postcode must be a 4-digit number'
    );
  }

  static validateNZPhone(phone) {
    const cleaned = phone.replace(/\s/g, '');
    return this.validatePattern(
      cleaned,
      NZ_PATTERNS.phone,
      'phone',
      'Phone number must be a valid New Zealand number (e.g., +64 21 123 4567 or 021 123 4567)'
    );
  }

  static validateNZAddress(address) {
    const result = this.validateLength(address, 5, 200, 'address');
    if (!result.isValid) return result;

    return this.validatePattern(
      address,
      NZ_PATTERNS.address,
      'address',
      'Address contains invalid characters'
    );
  }

  static validateIRDNumber(irdNumber) {
    const cleaned = irdNumber.replace(/\s/g, '');
    return this.validatePattern(
      cleaned,
      NZ_PATTERNS.irdNumber,
      'IRD number',
      'IRD number must be 8 or 9 digits'
    );
  }

  static validateCompanyNumber(companyNumber) {
    const cleaned = companyNumber.replace(/\s/g, '');
    return this.validatePattern(
      cleaned,
      NZ_PATTERNS.companyNumber,
      'company number',
      'Company number must be 8 digits'
    );
  }

  // Email validation with comprehensive checks
  static validateEmail(email) {
    const requiredCheck = this.validateRequired(email, 'email');
    if (!requiredCheck.isValid) return requiredCheck;

    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailPattern.test(email)) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.FORMAT,
          field: 'email',
          message: 'Please enter a valid email address'
        }
      };
    }

    // Check for common disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'throwaway.email'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.BUSINESS_RULE,
          field: 'email',
          message: 'Disposable email addresses are not allowed'
        }
      };
    }

    return { isValid: true };
  }

  // Password validation with security checks
  static validatePassword(password, userData = {}) {
    const requiredCheck = this.validateRequired(password, 'password');
    if (!requiredCheck.isValid) return requiredCheck;

    // Use SecurityService for comprehensive password validation
    const strengthCheck = SecurityService.validatePasswordStrength(password);
    
    if (!strengthCheck.isValid) {
      return {
        isValid: false,
        error: {
          type: VALIDATION_ERRORS.SECURITY,
          field: 'password',
          message: strengthCheck.feedback.join('. '),
          score: strengthCheck.score
        }
      };
    }

    // Check if password contains user data
    const userData_lower = {
      firstName: userData.firstName?.toLowerCase(),
      lastName: userData.lastName?.toLowerCase(),
      email: userData.email?.toLowerCase()
    };

    const password_lower = password.toLowerCase();
    
    for (const [key, value] of Object.entries(userData_lower)) {
      if (value && value.length > 2 && password_lower.includes(value)) {
        return {
          isValid: false,
          error: {
            type: VALIDATION_ERRORS.SECURITY,
            field: 'password',
            message: 'Password should not contain your personal information'
          }
        };
      }
    }

    return { isValid: true, score: strengthCheck.score };
  }

  // User validation
  static validateUser(userData) {
    const errors = [];

    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'userType'];
    requiredFields.forEach(field => {
      const result = this.validateRequired(userData[field], field);
      if (!result.isValid) errors.push(result.error);
    });

    // Email validation
    if (userData.email) {
      const emailResult = this.validateEmail(userData.email);
      if (!emailResult.isValid) errors.push(emailResult.error);
    }

    // Name validation
    if (userData.firstName) {
      const nameResult = this.validateLength(
        userData.firstName,
        BUSINESS_RULES.user.nameLength.min,
        BUSINESS_RULES.user.nameLength.max,
        'firstName'
      );
      if (!nameResult.isValid) errors.push(nameResult.error);

      const namePattern = /^[a-zA-Z\s'-]+$/;
      const patternResult = this.validatePattern(
        userData.firstName,
        namePattern,
        'firstName',
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      );
      if (!patternResult.isValid) errors.push(patternResult.error);
    }

    if (userData.lastName) {
      const nameResult = this.validateLength(
        userData.lastName,
        BUSINESS_RULES.user.nameLength.min,
        BUSINESS_RULES.user.nameLength.max,
        'lastName'
      );
      if (!nameResult.isValid) errors.push(nameResult.error);
    }

    // Phone validation (if provided)
    if (userData.phone) {
      const phoneResult = this.validateNZPhone(userData.phone);
      if (!phoneResult.isValid) errors.push(phoneResult.error);
    }

    // Bio validation (if provided)
    if (userData.bio) {
      const bioResult = this.validateLength(
        userData.bio,
        0,
        BUSINESS_RULES.user.bioLength.max,
        'bio'
      );
      if (!bioResult.isValid) errors.push(bioResult.error);
    }

    // Age validation (if provided)
    if (userData.age) {
      const ageResult = this.validateRange(
        userData.age,
        BUSINESS_RULES.user.age.min,
        BUSINESS_RULES.user.age.max,
        'age'
      );
      if (!ageResult.isValid) errors.push(ageResult.error);
    }

    // User type validation
    const validUserTypes = ['job_seeker', 'employer', 'both', 'admin'];
    if (userData.userType && !validUserTypes.includes(userData.userType)) {
      errors.push({
        type: VALIDATION_ERRORS.FORMAT,
        field: 'userType',
        message: 'Invalid user type'
      });
    }

    // Security check for input
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const threats = SecurityService.detectThreats(value);
        if (threats.length > 0) {
          errors.push({
            type: VALIDATION_ERRORS.SECURITY,
            field: key,
            message: 'Input contains potentially malicious content',
            threats
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      data: this.sanitizeUserData(userData)
    };
  }

  // Job validation
  static validateJob(jobData) {
    const errors = [];

    // Required fields
    const requiredFields = ['title', 'company', 'description', 'location', 'type'];
    requiredFields.forEach(field => {
      const result = this.validateRequired(jobData[field], field);
      if (!result.isValid) errors.push(result.error);
    });

    // Title validation
    if (jobData.title) {
      const titleResult = this.validateLength(
        jobData.title,
        BUSINESS_RULES.job.titleLength.min,
        BUSINESS_RULES.job.titleLength.max,
        'title'
      );
      if (!titleResult.isValid) errors.push(titleResult.error);
    }

    // Description validation
    if (jobData.description) {
      const descResult = this.validateLength(
        jobData.description,
        BUSINESS_RULES.job.descriptionLength.min,
        BUSINESS_RULES.job.descriptionLength.max,
        'description'
      );
      if (!descResult.isValid) errors.push(descResult.error);
    }

    // Salary validation
    if (jobData.salaryMin) {
      const salaryResult = this.validateRange(
        jobData.salaryMin,
        BUSINESS_RULES.job.salaryMin,
        BUSINESS_RULES.job.salaryMax,
        'salaryMin'
      );
      if (!salaryResult.isValid) errors.push(salaryResult.error);
    }

    if (jobData.salaryMax) {
      const salaryResult = this.validateRange(
        jobData.salaryMax,
        BUSINESS_RULES.job.salaryMin,
        BUSINESS_RULES.job.salaryMax,
        'salaryMax'
      );
      if (!salaryResult.isValid) errors.push(salaryResult.error);
    }

    // Check that salaryMax >= salaryMin
    if (jobData.salaryMin && jobData.salaryMax) {
      if (Number(jobData.salaryMax) < Number(jobData.salaryMin)) {
        errors.push({
          type: VALIDATION_ERRORS.BUSINESS_RULE,
          field: 'salary',
          message: 'Maximum salary must be greater than or equal to minimum salary'
        });
      }
    }

    // Job type validation
    const validJobTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'casual'];
    if (jobData.type && !validJobTypes.includes(jobData.type)) {
      errors.push({
        type: VALIDATION_ERRORS.FORMAT,
        field: 'type',
        message: 'Invalid job type'
      });
    }

    // Application deadline validation
    if (jobData.applicationDeadline) {
      const deadline = new Date(jobData.applicationDeadline);
      const now = new Date();
      const maxDays = BUSINESS_RULES.job.daysToExpire.max;
      const maxDate = new Date(now.getTime() + (maxDays * 24 * 60 * 60 * 1000));

      if (deadline <= now) {
        errors.push({
          type: VALIDATION_ERRORS.BUSINESS_RULE,
          field: 'applicationDeadline',
          message: 'Application deadline must be in the future'
        });
      }

      if (deadline > maxDate) {
        errors.push({
          type: VALIDATION_ERRORS.BUSINESS_RULE,
          field: 'applicationDeadline',
          message: `Application deadline cannot be more than ${maxDays} days in the future`
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: this.sanitizeJobData(jobData)
    };
  }

  // Application validation
  static validateApplication(applicationData) {
    const errors = [];

    // Required fields
    const requiredFields = ['candidateName', 'candidateEmail', 'jobId'];
    requiredFields.forEach(field => {
      const result = this.validateRequired(applicationData[field], field);
      if (!result.isValid) errors.push(result.error);
    });

    // Email validation
    if (applicationData.candidateEmail) {
      const emailResult = this.validateEmail(applicationData.candidateEmail);
      if (!emailResult.isValid) errors.push(emailResult.error);
    }

    // Cover letter validation (if provided)
    if (applicationData.coverLetter) {
      const coverResult = this.validateLength(
        applicationData.coverLetter,
        BUSINESS_RULES.application.coverLetterLength.min,
        BUSINESS_RULES.application.coverLetterLength.max,
        'coverLetter'
      );
      if (!coverResult.isValid) errors.push(coverResult.error);
    }

    // Experience validation (if provided)
    if (applicationData.experience) {
      const expResult = this.validateLength(
        applicationData.experience,
        0,
        BUSINESS_RULES.application.experienceLength.max,
        'experience'
      );
      if (!expResult.isValid) errors.push(expResult.error);
    }

    // Phone validation (if provided)
    if (applicationData.phone) {
      const phoneResult = this.validateNZPhone(applicationData.phone);
      if (!phoneResult.isValid) errors.push(phoneResult.error);
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: this.sanitizeApplicationData(applicationData)
    };
  }

  // Company validation
  static validateCompany(companyData) {
    const errors = [];

    // Required fields
    const requiredFields = ['name', 'industry'];
    requiredFields.forEach(field => {
      const result = this.validateRequired(companyData[field], field);
      if (!result.isValid) errors.push(result.error);
    });

    // Company name validation
    if (companyData.name) {
      const nameResult = this.validateLength(
        companyData.name,
        BUSINESS_RULES.company.nameLength.min,
        BUSINESS_RULES.company.nameLength.max,
        'name'
      );
      if (!nameResult.isValid) errors.push(nameResult.error);
    }

    // Description validation
    if (companyData.description) {
      const descResult = this.validateLength(
        companyData.description,
        BUSINESS_RULES.company.descriptionLength.min,
        BUSINESS_RULES.company.descriptionLength.max,
        'description'
      );
      if (!descResult.isValid) errors.push(descResult.error);
    }

    // Website validation (if provided)
    if (companyData.website) {
      try {
        new URL(companyData.website);
      } catch {
        errors.push({
          type: VALIDATION_ERRORS.FORMAT,
          field: 'website',
          message: 'Invalid website URL'
        });
      }
    }

    // Employee count validation
    if (companyData.employeeCount) {
      const countResult = this.validateRange(
        companyData.employeeCount,
        1,
        BUSINESS_RULES.company.maxEmployees,
        'employeeCount'
      );
      if (!countResult.isValid) errors.push(countResult.error);
    }

    // Founded year validation
    if (companyData.foundedYear) {
      const yearResult = this.validateRange(
        companyData.foundedYear,
        BUSINESS_RULES.company.foundedYear.min,
        BUSINESS_RULES.company.foundedYear.max,
        'foundedYear'
      );
      if (!yearResult.isValid) errors.push(yearResult.error);
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: this.sanitizeCompanyData(companyData)
    };
  }

  // Data sanitization methods
  static sanitizeUserData(userData) {
    const sanitized = {};
    
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = SecurityService.sanitizeInput(value, {
          maxLength: key === 'bio' ? BUSINESS_RULES.user.bioLength.max : 
                    key.includes('name') ? BUSINESS_RULES.user.nameLength.max : 
                    500
        });
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  static sanitizeJobData(jobData) {
    const sanitized = {};
    
    Object.entries(jobData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = SecurityService.sanitizeInput(value, {
          maxLength: key === 'description' ? BUSINESS_RULES.job.descriptionLength.max :
                    key === 'title' ? BUSINESS_RULES.job.titleLength.max :
                    1000,
          allowHTML: key === 'description' // Allow basic HTML in job descriptions
        });
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  static sanitizeApplicationData(applicationData) {
    const sanitized = {};
    
    Object.entries(applicationData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = SecurityService.sanitizeInput(value, {
          maxLength: key === 'coverLetter' ? BUSINESS_RULES.application.coverLetterLength.max :
                    key === 'experience' ? BUSINESS_RULES.application.experienceLength.max :
                    500
        });
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  static sanitizeCompanyData(companyData) {
    const sanitized = {};
    
    Object.entries(companyData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = SecurityService.sanitizeInput(value, {
          maxLength: key === 'description' ? BUSINESS_RULES.company.descriptionLength.max :
                    key === 'name' ? BUSINESS_RULES.company.nameLength.max :
                    500
        });
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  // Batch validation for forms
  static validateForm(formData, validationType) {
    switch (validationType) {
      case 'user':
        return this.validateUser(formData);
      case 'job':
        return this.validateJob(formData);
      case 'application':
        return this.validateApplication(formData);
      case 'company':
        return this.validateCompany(formData);
      default:
        return {
          isValid: false,
          errors: [{
            type: VALIDATION_ERRORS.FORMAT,
            field: 'validationType',
            message: 'Unknown validation type'
          }]
        };
    }
  }
}

// Export validation error types and business rules for use in other modules
export { VALIDATION_ERRORS, BUSINESS_RULES, NZ_PATTERNS };

export default ValidationService;