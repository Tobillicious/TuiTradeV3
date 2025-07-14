# 🤖 AI Agent Guide for TuiTrade

This guide is for AI agents (Claude, Gemini, etc.) and developers working in the terminal to help you quickly identify mock/placeholder logic, integration points, and next steps for production readiness. If you disagree with any suggestion, feel free to override it with a better approach!

---

## 🔍 Mock/Placeholder Locations & Next Steps

### 1. `src/lib/firebase.js`
- **Mock Firebase implementation** is used if environment variables are missing.
- **Next Steps:**
  - Ensure all required env vars are set in `.env`.
  - Remove or disable mock objects before deploying to production.

### 2. `src/lib/paymentService.js`
- **`mockApiCall`** and related logic simulate payment processing in development.
- **Next Steps:**
  - Implement real backend endpoints for payment, bank transfer, Afterpay, and escrow.
  - Remove or disable `mockApiCall` in production.

### 3. `src/lib/analytics.js`
- **Analytics events** are stored in localStorage and logged to console in development.
- **Next Steps:**
  - Integrate a real analytics backend (Google Analytics, Segment, custom API).
  - Ensure privacy and compliance for user data.

### 4. `public/sw.js`
- **Offline action processing** is mocked (console logs, commented-out fetch calls).
- **Next Steps:**
  - Implement real API calls for offline actions (watchlist, messaging, etc.).
  - Ensure robust error handling and offline sync.

### 5. `src/components/social/UserProfile.js`
- **`mockUser`** and related logic simulate user profile data.
- **Next Steps:**
  - Fetch user data from Firestore or API instead of using hardcoded mock data.
  - Remove or disable `mockUser` in production.

### 6. `src/components/pages/CategoryLandingPage.js`
- **`featuredListings`** array is mock data for featured listings.
- **Next Steps:**
  - Fetch listings from Firestore or API instead of using hardcoded mock data.
  - Remove or disable mock data in production.

---

## 🛠️ General Agentic Development Advice
- Always check for and replace mock/placeholder logic before production.
- Add or update tests when replacing mocks with real implementations.
- Update documentation and this guide as you make changes.
- Review integration points (auth, payments, analytics, offline, etc.) for completeness.
- If you find a better approach, **Claude or future agents may override these suggestions!**

---

Happy building! Kia kaha, AI whānau 🚀 