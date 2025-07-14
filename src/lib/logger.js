// src/lib/logger.js
/**
 * Comprehensive logging system for debugging the "includes" error
 * and general application monitoring
 */

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.startTime = Date.now();
        
        // Initialize performance monitoring
        this.performanceMarks = new Map();
        
        if (this.isDevelopment) {
            console.log('📊 Logger initialized');
        }
    }

    // Create a timestamp
    getTimestamp() {
        return new Date().toISOString();
    }

    // Create a session timestamp
    getSessionTime() {
        return Date.now() - this.startTime;
    }

    // Core logging method
    log(level, category, message, data = null, component = null) {
        const logEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: this.getTimestamp(),
            sessionTime: this.getSessionTime(),
            level,
            category,
            message,
            data,
            component,
            stack: new Error().stack
        };

        this.logs.push(logEntry);
        
        // Keep only the last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output in development
        if (this.isDevelopment) {
            const emoji = this.getLevelEmoji(level);
            const categoryBadge = `[${category}${component ? `:${component}` : ''}]`;
            
            switch (level) {
                case 'error':
                    console.error(`${emoji} ${categoryBadge}`, message, data);
                    break;
                case 'warn':
                    console.warn(`${emoji} ${categoryBadge}`, message, data);
                    break;
                case 'info':
                    console.info(`${emoji} ${categoryBadge}`, message, data);
                    break;
                case 'debug':
                    console.log(`${emoji} ${categoryBadge}`, message, data);
                    break;
                default:
                    console.log(`${emoji} ${categoryBadge}`, message, data);
            }
        }

        return logEntry;
    }

    getLevelEmoji(level) {
        const emojis = {
            error: '🚨',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🔍',
            context: '🧩',
            component: '📦',
            performance: '⚡'
        };
        return emojis[level] || '📝';
    }

    // Specific logging methods
    error(category, message, data, component) {
        return this.log('error', category, message, data, component);
    }

    warn(category, message, data, component) {
        return this.log('warn', category, message, data, component);
    }

    info(category, message, data, component) {
        return this.log('info', category, message, data, component);
    }

    debug(category, message, data, component) {
        return this.log('debug', category, message, data, component);
    }

    // Context-specific logging
    logContextState(component, contextName, state) {
        this.log('context', 'ContextState', `${component} context state`, {
            contextName,
            state,
            validation: this.validateContextData(state)
        }, component);
    }

    logArrayOperation(component, operation, array, result) {
        const validation = Array.isArray(array);
        this.log(validation ? 'debug' : 'error', 'ArrayOperation', 
            `${operation} on ${validation ? 'valid' : 'INVALID'} array`, {
            arrayType: typeof array,
            isArray: validation,
            arrayValue: array,
            result
        }, component);
        
        return validation;
    }

    // Component lifecycle logging
    logComponentMount(component, props = null) {
        this.log('component', 'Lifecycle', `${component} mounted`, props, component);
    }

    logComponentUnmount(component) {
        this.log('component', 'Lifecycle', `${component} unmounted`, null, component);
    }

    logComponentError(component, error, errorInfo) {
        this.log('error', 'ComponentError', `${component} error`, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            errorInfo
        }, component);
    }

    // Performance logging
    startPerformanceMark(label) {
        const timestamp = performance.now();
        this.performanceMarks.set(label, timestamp);
        if (this.isDevelopment) {
            console.time(label);
        }
        return timestamp;
    }

    endPerformanceMark(label, logResult = true) {
        const startTime = this.performanceMarks.get(label);
        if (!startTime) {
            this.warn('Performance', `No start mark found for ${label}`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        this.performanceMarks.delete(label);

        if (this.isDevelopment) {
            console.timeEnd(label);
        }

        if (logResult) {
            this.log('performance', 'Timing', `${label} completed`, {
                duration: `${duration.toFixed(2)}ms`,
                startTime,
                endTime
            });
        }

        return duration;
    }

    // Data validation helpers
    validateContextData(data) {
        if (!data) return { valid: false, reason: 'Data is null/undefined' };

        const issues = [];
        
        Object.entries(data).forEach(([key, value]) => {
            if (key.includes('Items') || key.includes('Array')) {
                if (!Array.isArray(value)) {
                    issues.push(`${key} should be array but is ${typeof value}`);
                }
            }
        });

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // Get filtered logs
    getLogsByCategory(category) {
        return this.logs.filter(log => log.category === category);
    }

    getLogsByComponent(component) {
        return this.logs.filter(log => log.component === component);
    }

    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    getErrorLogs() {
        return this.getLogsByLevel('error');
    }

    // Export logs for debugging
    exportLogs() {
        const exportData = {
            sessionStart: this.startTime,
            sessionDuration: this.getSessionTime(),
            logCount: this.logs.length,
            logs: this.logs,
            errorSummary: this.getErrorSummary()
        };

        if (this.isDevelopment) {
            console.log('📊 Exported logs:', exportData);
        }

        return exportData;
    }

    getErrorSummary() {
        const errors = this.getErrorLogs();
        const summary = {
            totalErrors: errors.length,
            includesErrors: errors.filter(e => 
                e.message.includes('includes') || 
                (e.data && JSON.stringify(e.data).includes('includes'))
            ),
            contextErrors: errors.filter(e => e.category === 'ContextState'),
            componentErrors: errors.filter(e => e.category === 'ComponentError')
        };

        return summary;
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        if (this.isDevelopment) {
            console.log('🧹 Logs cleared');
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export convenience methods
export const logError = (category, message, data, component) => 
    logger.error(category, message, data, component);

export const logWarn = (category, message, data, component) => 
    logger.warn(category, message, data, component);

export const logInfo = (category, message, data, component) => 
    logger.info(category, message, data, component);

export const logDebug = (category, message, data, component) => 
    logger.debug(category, message, data, component);

export const logContextState = (component, contextName, state) =>
    logger.logContextState(component, contextName, state);

export const logArrayOperation = (component, operation, array, result) =>
    logger.logArrayOperation(component, operation, array, result);

export const logComponentMount = (component, props) =>
    logger.logComponentMount(component, props);

export const logComponentUnmount = (component) =>
    logger.logComponentUnmount(component);

export const logComponentError = (component, error, errorInfo) =>
    logger.logComponentError(component, error, errorInfo);

export const startPerformanceMark = (label) =>
    logger.startPerformanceMark(label);

export const endPerformanceMark = (label, logResult) =>
    logger.endPerformanceMark(label, logResult);

// Global access in development
if (process.env.NODE_ENV === 'development') {
    window.appLogger = logger;
    window.exportLogs = () => logger.exportLogs();
    window.clearLogs = () => logger.clearLogs();
    window.getErrorSummary = () => logger.getErrorSummary();
}

export default logger;