# 🛠️ TuiTrade Developer Toolkit

## 📊 Analytics & Monitoring Dashboard

### 🔗 Access Admin Dashboard
```
URL: https://tuitrade.web.app/admin
Local: http://localhost:3000/admin
```

### 📈 Key Metrics Tracked
- **User Analytics**: Total users, active users, registration rates
- **Traffic Metrics**: Page views, unique visitors, bounce rates
- **Sales Analytics**: Orders, revenue, conversion rates
- **Performance**: Load times, error rates, uptime

## 🔧 Development Tools

### 🌐 Environment URLs
```bash
# Production
LIVE_URL="https://tuitrade.web.app"

# Development
DEV_URL="http://localhost:3000"

# Firebase Console
FIREBASE_CONSOLE="https://console.firebase.google.com/project/tuitrade"
```

### 📱 Testing Tools
```bash
# Local Development
npm start                 # Start development server
npm test                  # Run test suite
npm run build            # Create production build
npm run security-check   # Security audit

# Firebase Tools
firebase serve           # Test locally with Firebase
firebase deploy          # Deploy to production
firebase use --add       # Add Firebase project
```

## 📊 Analytics Integration

### 🔍 Google Analytics 4
```javascript
// Add to your .env file
REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

// Track custom events
gtag('event', 'purchase', {
    transaction_id: 'TXN123',
    value: 150.00,
    currency: 'NZD'
});
```

### 📈 Firebase Analytics
```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();
logEvent(analytics, 'listing_created', {
    category: 'marketplace',
    value: 100
});
```

## 🎯 User Tracking Setup

### 👥 User Engagement Tracking
```javascript
// Track user actions
const trackUserAction = (action, properties = {}) => {
    // Firebase Analytics
    logEvent(analytics, action, properties);
    
    // Custom database logging
    addDoc(collection(db, 'user_actions'), {
        userId: user.uid,
        action,
        properties,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
    });
};

// Usage examples
trackUserAction('listing_viewed', { listingId: 'ABC123' });
trackUserAction('search_performed', { query: 'iPhone 14' });
trackUserAction('payment_completed', { amount: 299.99 });
```

### 📊 Session Tracking
```javascript
// Track user sessions
const trackSession = () => {
    const sessionId = generateSessionId();
    const sessionData = {
        sessionId,
        userId: user?.uid || 'anonymous',
        startTime: new Date(),
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        location: getUserLocation()
    };
    
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    logEvent(analytics, 'session_start', sessionData);
};
```

## 🔍 Traffic Monitoring

### 🌐 Real-time Traffic
```javascript
// Monitor page views
const trackPageView = (pageName) => {
    logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
};

// Track time on page
const trackTimeOnPage = (pageName, startTime) => {
    const timeSpent = Date.now() - startTime;
    logEvent(analytics, 'time_on_page', {
        page_title: pageName,
        time_spent: timeSpent
    });
};
```

### 📱 Device & Browser Analytics
```javascript
// Collect device information
const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
};
```

## 🔐 Security Monitoring

### 🛡️ Security Event Tracking
```javascript
// Track security events
const trackSecurityEvent = (eventType, details = {}) => {
    addDoc(collection(db, 'security_events'), {
        eventType,
        details,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        ipAddress: 'server-side-only',
        userId: user?.uid || 'anonymous'
    });
};

// Examples
trackSecurityEvent('login_attempt', { success: true });
trackSecurityEvent('password_reset', { email: user.email });
trackSecurityEvent('suspicious_activity', { reason: 'multiple_failed_logins' });
```

### 🔍 Error Tracking
```javascript
// Track JavaScript errors
window.addEventListener('error', (event) => {
    logEvent(analytics, 'javascript_error', {
        error_message: event.message,
        error_filename: event.filename,
        error_lineno: event.lineno,
        error_colno: event.colno
    });
});

// Track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    logEvent(analytics, 'unhandled_promise_rejection', {
        reason: event.reason.toString()
    });
});
```

## 📊 Custom Analytics Dashboard

### 🎨 Dashboard Components
```javascript
// Create custom analytics components
const AnalyticsCard = ({ title, value, change, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
                <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change}%
                </p>
            </div>
            <div className="text-3xl">{icon}</div>
        </div>
    </div>
);
```

### 📈 Data Visualization
```javascript
// Chart.js integration example
import { Line, Bar, Pie } from 'react-chartjs-2';

const UserGrowthChart = ({ data }) => (
    <Line
        data={{
            labels: data.labels,
            datasets: [{
                label: 'User Growth',
                data: data.values,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        }}
        options={{
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }}
    />
);
```

## 🚀 Performance Monitoring

### ⚡ Web Vitals Tracking
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const trackWebVitals = () => {
    getCLS(metric => logEvent(analytics, 'web_vital', { name: 'CLS', value: metric.value }));
    getFID(metric => logEvent(analytics, 'web_vital', { name: 'FID', value: metric.value }));
    getFCP(metric => logEvent(analytics, 'web_vital', { name: 'FCP', value: metric.value }));
    getLCP(metric => logEvent(analytics, 'web_vital', { name: 'LCP', value: metric.value }));
    getTTFB(metric => logEvent(analytics, 'web_vital', { name: 'TTFB', value: metric.value }));
};
```

### 🔧 Performance Metrics
```javascript
// Track API response times
const trackApiResponse = (endpoint, startTime) => {
    const responseTime = Date.now() - startTime;
    logEvent(analytics, 'api_response_time', {
        endpoint,
        response_time: responseTime
    });
};

// Track component load times
const trackComponentLoad = (componentName, loadTime) => {
    logEvent(analytics, 'component_load_time', {
        component: componentName,
        load_time: loadTime
    });
};
```

## 📱 Mobile Analytics

### 📲 PWA Tracking
```javascript
// Track PWA installation
window.addEventListener('beforeinstallprompt', (event) => {
    logEvent(analytics, 'pwa_install_prompt_shown');
});

// Track PWA usage
if (window.matchMedia('(display-mode: standalone)').matches) {
    logEvent(analytics, 'pwa_launched');
}
```

### 🔔 Push Notification Tracking
```javascript
// Track notification permissions
const trackNotificationPermission = (permission) => {
    logEvent(analytics, 'notification_permission', {
        permission_status: permission
    });
};

// Track notification interactions
const trackNotificationClick = (notificationId) => {
    logEvent(analytics, 'notification_clicked', {
        notification_id: notificationId
    });
};
```

## 💰 E-commerce Analytics

### 🛒 Purchase Tracking
```javascript
// Track purchase events
const trackPurchase = (transactionData) => {
    logEvent(analytics, 'purchase', {
        transaction_id: transactionData.id,
        value: transactionData.amount,
        currency: 'NZD',
        items: transactionData.items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            category: item.category,
            quantity: item.quantity,
            price: item.price
        }))
    });
};

// Track cart abandonment
const trackCartAbandonment = (cartData) => {
    logEvent(analytics, 'cart_abandoned', {
        cart_value: cartData.total,
        items_count: cartData.items.length,
        stage: cartData.abandonmentStage
    });
};
```

### 💳 Payment Analytics
```javascript
// Track payment methods
const trackPaymentMethod = (method, amount) => {
    logEvent(analytics, 'payment_method_selected', {
        payment_method: method,
        transaction_value: amount
    });
};

// Track payment failures
const trackPaymentFailure = (reason, amount) => {
    logEvent(analytics, 'payment_failed', {
        failure_reason: reason,
        attempted_amount: amount
    });
};
```

## 🎯 A/B Testing Setup

### 🧪 Feature Flag Testing
```javascript
// A/B test setup
const getFeatureFlag = (flagName, userId) => {
    // Use Firebase Remote Config or custom logic
    const userHash = hashUserId(userId);
    return userHash % 2 === 0 ? 'variant_a' : 'variant_b';
};

// Track A/B test results
const trackABTest = (testName, variant, action) => {
    logEvent(analytics, 'ab_test_interaction', {
        test_name: testName,
        variant,
        action
    });
};
```

## 📊 Reporting Tools

### 📈 Daily Reports
```javascript
// Generate daily analytics report
const generateDailyReport = async () => {
    const today = new Date();
    const yesterday = new Date(today - 24 * 60 * 60 * 1000);
    
    const reportData = {
        date: today.toISOString().split('T')[0],
        users: await getUserCount(yesterday, today),
        sessions: await getSessionCount(yesterday, today),
        revenue: await getRevenueSum(yesterday, today),
        topPages: await getTopPages(yesterday, today)
    };
    
    // Send to admin email or save to database
    await saveReport(reportData);
};
```

### 📊 Custom Dashboards
```javascript
// Create custom dashboard queries
const getDashboardData = async (timeRange) => {
    const queries = [
        getUserMetrics(timeRange),
        getTrafficMetrics(timeRange),
        getRevenueMetrics(timeRange),
        getPerformanceMetrics(timeRange)
    ];
    
    const results = await Promise.all(queries);
    return {
        users: results[0],
        traffic: results[1],
        revenue: results[2],
        performance: results[3]
    };
};
```

## 🔍 Debug Tools

### 🐛 Development Debug Panel
```javascript
// Debug panel for development
const DebugPanel = () => {
    const [debugData, setDebugData] = useState({});
    
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Expose debug functions globally
            window.TuiTradeDebug = {
                trackEvent: (name, data) => logEvent(analytics, name, data),
                viewMetrics: () => console.table(debugData),
                clearStorage: () => localStorage.clear()
            };
        }
    }, []);
    
    return process.env.NODE_ENV === 'development' ? (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded">
            <p>Debug Panel Active</p>
            <p>Check console for TuiTradeDebug</p>
        </div>
    ) : null;
};
```

## 📋 Implementation Checklist

### ✅ Setup Tasks
- [ ] Install analytics packages
- [ ] Configure Firebase Analytics
- [ ] Set up Google Analytics 4
- [ ] Create admin dashboard component
- [ ] Implement event tracking
- [ ] Set up error monitoring
- [ ] Configure performance monitoring
- [ ] Add debug tools for development

### 🔧 Configuration Files
```javascript
// analytics.js - Central analytics configuration
export const analytics = {
    firebase: getAnalytics(),
    gtag: window.gtag,
    debug: process.env.NODE_ENV === 'development'
};

// Track all events through central function
export const track = (event, data = {}) => {
    if (analytics.firebase) {
        logEvent(analytics.firebase, event, data);
    }
    if (analytics.gtag) {
        analytics.gtag('event', event, data);
    }
    if (analytics.debug) {
        console.log('Analytics Event:', event, data);
    }
};
```

## 🎉 Getting Started

1. **Install the Admin Dashboard**:
   ```bash
   # The AdminDashboard component is already created
   # Add route to your App.js
   ```

2. **Access the Dashboard**:
   ```
   https://tuitrade.web.app/admin
   ```

3. **View Real-time Metrics**:
   - User registrations
   - Active sessions
   - Revenue tracking
   - Traffic analytics

4. **Monitor Performance**:
   - Page load times
   - Error rates
   - Conversion funnels
   - User engagement

---

**🚀 Your TuiTrade analytics toolkit is ready to provide comprehensive insights into your marketplace performance!**