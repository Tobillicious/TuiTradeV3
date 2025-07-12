# TuiTrade Jobs System - Priority Tasks

## 🔥 HIGH PRIORITY (Performance & Core Functionality)

### 1. Performance Optimization 
- **Code Splitting**: Separate jobs system into `/jobs` route with lazy loading
- **Chunk Optimization**: Configure webpack chunks (currently causing slow loading)
- **Component Lazy Loading**: Split large components like JobsLanding
- **Bundle Analysis**: Reduce main bundle size

### 2. Real Job Data Integration
- **API Integration**: Connect to real job boards (Seek API if available, or job scraping)
- **Database Structure**: Set up Firestore collections for job listings
- **Data Sync**: Implement job data fetching and caching
- **Search Optimization**: Real-time job search with proper indexing

### 3. Route Separation
- **Jobs Route**: Move jobs to `/jobs` URL path
- **Route Guards**: Implement proper routing structure
- **SEO Optimization**: Add meta tags for job pages
- **URL Structure**: `/jobs`, `/jobs/category/[category]`, `/jobs/[id]`

## 🟡 MEDIUM PRIORITY (User Experience)

### 4. Job Application System
- **Real Applications**: Connect to employer systems
- **File Upload**: Resume/CV upload to Firebase Storage
- **Application Tracking**: User dashboard for applications
- **Email Notifications**: Application confirmations

### 5. Search & Filtering Enhancement
- **Advanced Filters**: Location radius, salary negotiable, etc.
- **Saved Searches**: User preferences and job alerts
- **Sort Options**: Date, salary, relevance, distance
- **Map Integration**: Location-based job search

### 6. Mobile Optimization
- **Mobile-First Design**: Optimize for mobile job searching
- **PWA Features**: Offline job browsing, push notifications
- **Touch Optimization**: Better mobile interaction

## 🟢 LOW PRIORITY (Polish & Features)

### 7. Te Reo Māori Completion
- **Translation Completion**: Finish all untranslated elements
- **Cultural Accuracy**: Review Te Reo usage with native speakers
- **Bilingual Toggle**: Allow users to switch languages

### 8. Additional Features
- **Company Profiles**: Employer branding pages
- **Job Recommendations**: AI-powered job matching
- **Social Features**: Share jobs, company reviews
- **Analytics**: Job view tracking, application rates

### 9. Admin Features
- **Job Management**: Admin interface for job moderation
- **Analytics Dashboard**: Job posting metrics
- **User Management**: Handle job seekers and employers

## 📋 Technical Debt

### 10. Code Quality
- **ESLint Fixes**: Clean up all warnings
- **TypeScript Migration**: Add type safety
- **Testing**: Unit tests for job components
- **Documentation**: Component documentation

## 🚀 IMMEDIATE NEXT STEPS (for handoff agent)

1. **Code Split Jobs**: `React.lazy()` for JobsLanding component
2. **Setup /jobs Route**: Add to router configuration  
3. **Bundle Analysis**: Run `npm run build -- --analyze`
4. **Mock Data Cleanup**: Organize job data structure
5. **Performance Audit**: Check Core Web Vitals

---

**Current Status**: ✅ 30 Seek categories implemented, ✅ Te Reo integration, ✅ NZ localization
**Priority Focus**: Performance optimization and real data integration
**Handoff Ready**: All core structure complete, needs optimization