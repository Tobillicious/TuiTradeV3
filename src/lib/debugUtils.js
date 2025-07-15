// Advanced debugging utilities for runtime error detection
console.log('🔧 Initializing advanced debugging tools...');

// Store original array methods
const originalIncludes = Array.prototype.includes;
const originalSome = Array.prototype.some;
const originalFilter = Array.prototype.filter;

// Storage for debugging data
window.debugErrors = [];
window.debugLogs = [];

// Enhanced error tracking
function logDebugError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorData = {
        id: Date.now() + Math.random(),
        timestamp,
        error: error.message,
        stack: error.stack,
        context,
        location: window.location.href
    };
    
    window.debugErrors.push(errorData);
    console.error('🚨 CAUGHT: ' + error.message, errorData);
    
    // Store in localStorage for persistence
    try {
        localStorage.setItem('debug-errors', JSON.stringify(window.debugErrors));
    } catch (e) {
        console.warn('Could not store debug errors:', e);
    }
    
    return errorData;
}

// Intercept Array.prototype.includes to catch undefined calls
Array.prototype.includes = function(...args) {
    if (this == null || this === undefined) {
        const error = new Error(`includes() called on ${this}! This is likely the source of your TypeError.`);
        const errorData = logDebugError(error, {
            method: 'includes',
            args,
            thisValue: this,
            type: typeof this
        });
        
        console.log('🎯 TARGET ERROR DETECTED', errorData.id);
        console.log('📍 Relevant source lines:', error.stack?.split('\n').slice(1, 4));
        
        // Return safe fallback
        return false;
    }
    return originalIncludes.apply(this, args);
};

// Intercept Array.prototype.some to catch undefined calls
Array.prototype.some = function(...args) {
    if (this == null || this === undefined) {
        const error = new Error(`some() called on ${this}! This could be your TypeError source.`);
        logDebugError(error, {
            method: 'some',
            args,
            thisValue: this,
            type: typeof this
        });
        
        // Return safe fallback
        return false;
    }
    return originalSome.apply(this, args);
};

// Debug utilities for the console
window.getErrorReport = () => {
    console.group('🔍 Debug Error Report');
    console.log('Total errors:', window.debugErrors.length);
    window.debugErrors.forEach((error, index) => {
        console.group(`Error ${index + 1}:`);
        console.log('Time:', error.timestamp);
        console.log('Message:', error.error);
        console.log('Context:', error.context);
        console.groupEnd();
    });
    console.groupEnd();
    return window.debugErrors;
};

window.clearDebugErrors = () => {
    window.debugErrors = [];
    localStorage.removeItem('debug-errors');
    console.log('🧹 Debug errors cleared');
};

// Context validation function
export const validateContextState = (contextName, state) => {
    if (!state) {
        console.warn(`⚠️ ${contextName} context state is null/undefined`);
        return false;
    }
    
    console.log(`✅ ${contextName} context validation passed`, state);
    return true;
};

// Safe array operation function
export const safeArrayOperation = (array, operation, fallback = []) => {
    try {
        if (!Array.isArray(array)) {
            console.warn(`⚠️ safeArrayOperation: Expected array but received ${typeof array}`, array);
            return fallback;
        }
        return array;
    } catch (error) {
        console.error('🚨 safeArrayOperation error:', error);
        return fallback;
    }
};

console.log('🔍 Debug detector active - monitoring for runtime errors');
console.log('💡 Use window.getErrorReport() to see all caught errors');