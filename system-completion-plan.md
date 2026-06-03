# System Completion Plan

## Overview
Comprehensive plan to complete every backend feature in the frontend, fix gaps, and ensure full functionality. Based on thorough inventory of all 11 backend apps (~140 routes, 31 models) and all 47 frontend source files.

---

## Phase 1: Critical Fixes (Must Have)

### 1.1 Graduate Profile — Full CRUD Editing
**Backend:** ✅ Fully functional (GraduateProfileViewSet, EducationViewSet, CertificationViewSet, ExperienceViewSet, ProjectViewSet, CVViewSet, skill add/remove endpoints)
**Frontend:** ❌ Profile page is view-only (`graduate/profile/page.tsx`)
**Fix:** Add inline editing for all sections: personal info, headline, bio, skills (add/remove/proficiency), education, certifications, experience, projects, CV upload, social links, availability toggle.

### 1.2 Password Change UI
**Backend:** ✅ `PUT /auth/change-password/` endpoint
**Frontend:** ❌ No UI anywhere
**Fix:** Add password change form (modal or page) accessible from profile or user menu.

### 1.3 Forgot Password — Real API Call
**Backend:** ✅ `POST /auth/password-reset/` + `POST /auth/password-reset/confirm/`
**Frontend:** ⚠️ Uses mock timeout instead of real API
**Fix:** Connect to real backend endpoints for both request and confirmation.

### 1.4 Delete Account UI
**Backend:** ✅ `DELETE /auth/delete-account/`
**Frontend:** ❌ No UI
**Fix:** Add delete account button with confirmation modal.

### 1.5 Graduate Dashboard — Fetch Real Skills & Education Data
**Frontend:** ⚠️ Dashboard shows skills widgets but may not load all profile data
**Fix:** Ensure `fetchProfile` populates all sections.

---

## Phase 2: Feature Completion (Should Have)

### 2.1 WebSocket Connections for Real-time Features
**Backend:** ✅ WebSocket consumers for notifications (`ws/notifications/`) and chat (`ws/chat/`)
**Frontend:** ❌ Currently uses REST polling only
**Fix:** Connect NotificationBell and Chat pages to WebSocket for real-time updates.

### 2.2 Global Search UI
**Backend:** ✅ `POST /search/global/` (Elasticsearch)
**Frontend:** ❌ No search page or search bar
**Fix:** Add global search bar in Topbar and search results page.

### 2.3 AI Features Frontend
**Backend:** ✅ 6 AI endpoints (CV parsing, candidate ranking, job recommendations, graduate recommendations, fraud check, skill analysis)
**Frontend:** ⚠️ Only `jobRecommendations` and `skillAnalysis` are fetched but not fully displayed
**Fix:**
- CV parsing trigger button on CV management
- Candidate ranking display on employer job applicants page
- Job recommendations widget on graduate dashboard
- Skill analysis visualization on graduate analytics

### 2.4 Employer Company Verification Badge & Actions
**Backend:** ✅ Admin can verify companies
**Frontend:** ⚠️ Verification badge shown but no verify button on company page
**Fix:** Add "Request Verification" button for employers on company page.

### 2.5 Admin Dashboard — Missing Sections
**Backend:** ✅ Full analytics endpoints
**Frontend:** ⚠️ Dashboard only shows basic stats cards
**Fix:** Add charts (user growth trends, city/college distributions), recent activity feed, and system health indicators.

---

## Phase 3: Polish & Edge Cases (Nice to Have)

### 3.1 Loading / Error / Empty States Audit
**Frontend:** ⚠️ Some pages handle states, some don't
**Fix:** Audit all pages for consistent loading spinners, error retry buttons, and meaningful empty states.

### 3.2 Missing Pages / Routes
**Fix:** Add missing pages:
- `/terms` — Terms and conditions
- `/privacy` — Privacy policy
- `/graduate/profile/edit` — Dedicated edit profile page (or modal)

### 3.3 Admin — Missing Management Features
**Backend:** ✅ Full CRUD for all models in admin API
**Frontend:** ⚠️ Missing:
- Admin edit user details
- Admin view user activity logs
- Platform event logs viewer
- Daily stats viewer

### 3.4 Institution User Type
**Backend:** ✅ `institution` user type exists in model
**Frontend:** ❌ Not supported in registration or dashboard
**Fix:** Add institution registration flow and basic dashboard.

### 3.5 Search & Filter Enhancements
**Fix:** 
- Add debounced search inputs
- Add URL-param-based filter persistence
- Add sort options to graduate/employer/job lists

---

## Phase 4: Quality Assurance

### 4.1 Backend Tests
**Current:** 0 tests
**Fix:** Write Django test suite covering:
- All model CRUD operations
- All API endpoints (at least smoke tests)
- Authentication & permissions
- AI module unit tests
- Edge cases (validation, errors)

### 4.2 Frontend Tests
**Current:** 0 tests
**Fix:** Write tests for:
- Stores (Zustand)
- API services
- Critical components (auth, forms)

### 4.3 Error Handling Audit
**Fix:** Ensure all API calls have proper error handling with user-friendly messages.

### 4.4 Performance
**Fix:**
- Add React Query for caching/refetching API data
- Add pagination loading states
- Optimize re-renders

---

## Execution Order

| # | Task | Files Affected | Est. Effort |
|---|------|---------------|-------------|
| P1.1 | Graduate Profile CRUD editing | `graduate/profile/page.tsx`, `api-services.ts` | Large |
| P1.2 | Password change UI | New component + integration | Small |
| P1.3 | Forgot password real API | `forgot-password/page.tsx` | Small |
| P1.4 | Delete account UI | New modal | Small |
| P1.5 | Graduate dashboard data fetch | `graduate/page.tsx` | Small |
| P2.1 | WebSocket connections | `NotificationBell.tsx`, `chat/*.tsx` | Medium |
| P2.2 | Global search UI | New search components | Medium |
| P2.3 | AI features frontend | Multiple pages | Large |
| P2.4 | Company verification request | `employer/company/page.tsx` | Small |
| P2.5 | Admin dashboard charts | `admin/page.tsx` | Medium |
| P3.1 | Loading/error/empty audit | All pages | Medium |
| P3.2 | Missing pages | New page files | Small |
| P3.3 | Admin features | `admin/*` pages | Medium |
| P3.4 | Institution support | `register/page.tsx`, new pages | Medium |
| P4.1 | Backend tests | New test files | Large |
| P4.2 | Frontend tests | New test files | Large |
| P4.3 | Error handling audit | All pages | Medium |
| P4.4 | Performance (React Query) | `api-services.ts`, pages | Large |
