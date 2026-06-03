# Graduators — TODO

> **Last updated:** June 3, 2026 (All phases through F complete)
> **Status:** All major dev phases complete. 332 backend tests pass, frontend TS zero errors, mobile TS zero errors. Ready for final polish, schema doc, and production deploy.

---

## ✅ Phase B — Institution Portal (DONE)

## ✅ Phase C — Admin Super-Dashboard (DONE)

## ✅ Phase D — Full Networking Suite (DONE)

## ✅ Phase F — Public Profiles & SEO (DONE)

## ✅ Phase M0 — Mobile Foundation (DONE)

- [x] `npx create-expo-app` scaffold with Expo SDK 56 + TypeScript
- [x] Project structure (`app/`, `src/theme/`, `src/animations/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/store/`)
- [x] Symlink shared modules from `frontend/src/lib/`, `store/`, `i18n/`
- [x] Mobile-specific `api.ts` (AsyncStorage + axios) + mobile `authStore.ts` override
- [x] Theme system with glass-card design tokens (colors, spacing, shadows, typography)
- [x] Animation primitives: FadeInView, SlideUpView, ScaleInView, StaggerView
- [x] Components: GlassCard, Skeleton, EmptyState, ErrorWidget, Badge, Avatar, SearchField, Modal, Toast, BottomSheet
- [x] Navigation shell: role-aware routing (index redirects by `user_type`)
- [x] Expo Router: root layout → auth / graduate(tabs) / employer(tabs) / admin / institution groups
- [x] Auth flow: login, register (role selector), forgot password (real API)
- [x] Graduate screens: home (quick actions, jobs), profile (stats, education, skills), settings (switches, logout), messages (inbox list, search)
- [x] Employer screens: home (stats, activity), jobs (list, status), company (profile, verify), messages (inbox)
- [x] Admin dashboard: stats cards, quick actions grid, recent users
- [x] Institution dashboard: graduate stats, recent grads, quick actions
- [x] Metro config: `@/` path alias to frontend src, symlink support
- [x] EAS Build config + eas.json profiles (dev/preview/prod)
- [ ] Firebase project + FCM setup (PENDING)

## 🟢 Phase B — Institution Portal (DONE)

- [x] Backend: InstitutionProfile, GraduateTracking, InstitutionPartnership models
- [x] Backend: InstitutionDashboardView + InstitutionGraduateViewSet + CurriculumFeedbackView
- [x] Backend: CSV import endpoint, report export
- [x] Frontend: Institution dashboard with stats + trend chart
- [x] Frontend: Institution graduates list (searchable table)
- [x] Frontend: Graduate detail + employment tracking form
- [x] Frontend: CSV import (upload → map columns → preview → confirm)
- [x] Frontend: Analytics (program analytics, salary ranges, top employers)
- [x] Frontend: Partnerships (list, add, upload MOU document)
- [x] Frontend: Reports export (PDF/Excel)
- [x] Frontend: Institution profile settings
- [x] Mobile: Institution dashboard connected to real API

## 🟢 Phase C — Admin Super-Dashboard (DONE)

- [x] Backend: Admin view sets for users, graduates, companies, jobs, audit-logs, platform-events, daily-stats
- [x] Backend: Destroy + toggle-featured actions on admin viewsets
- [x] Backend: Admin API routes registered with DefaultRouter
- [x] Frontend: Admin dashboard connected to real API
- [x] Mobile: Admin dashboard connected to real API

## 🟢 Phase D — Full Networking Suite (DONE)

- [x] Backend: Social → notifications integration (like/comment/follow trigger send_notification)
- [x] Backend: Notification API pagination + type filter
- [x] Backend: Social profile endpoint (GET /social/profile/{id})
- [x] Backend: Post filter by author
- [x] Frontend: Notification history page with type tabs, pagination, mark-read/mark-all-read
- [x] Frontend: Social profile page with follow/unfollow + posts feed
- [x] Frontend: Clickable author links in feed

## 🟡 Phase E — Events & Groups

- [ ] Backend: Event model (online/in-person, location, speakers)
- [ ] Backend: EventRegistration (RSVP + check-in)
- [ ] Backend: Event reminders (Celery: 1h, 1d, 1w before)
- [ ] Backend: Video integration (Zoom/Google Meet URL)
- [ ] Backend: Group model (public/private/membership-approval)
- [ ] Backend: GroupMembership (admin/moderator/member)
- [ ] Backend: GroupPost (feed within group)
- [ ] Frontend: Events discovery (grid, filter, featured carousel)
- [ ] Frontend: Event detail (header, speakers, attendees, RSVP)
- [ ] Frontend: Create/edit event (date picker, maps, speakers)
- [ ] Frontend: Event calendar (month/week view)
- [ ] Frontend: Groups discovery (search, filter, recommended)
- [ ] Frontend: Group page (header, feed, members, join/leave)
- [ ] Frontend: Create group (name, type, cover, rules)
- [ ] Frontend: Group admin panel (members, settings, analytics)
- [ ] Mobile: Events + Groups screens (M6)

## 🟡 Phase F — Public Profiles & SEO

- [ ] Backend: Public graduate profile endpoint (no auth, limited fields)
- [ ] Backend: Public company profile endpoint (no auth)
- [ ] Backend: SEO meta endpoint (Open Graph + Twitter Card JSON)
- [ ] Backend: Schema.org JSON-LD generation (JobPosting, Person, Organization)
- [ ] Backend: Dynamic XML sitemap generation
- [ ] Backend: PDF CV export endpoint (RTL/LTR Arabic typesetting)
- [ ] Frontend: Public graduate page (`/graduate/<username>`) with OG tags
- [ ] Frontend: Public company page (`/company/<slug>`) with OG tags
- [ ] Frontend: Public job page with schema.org JobPosting
- [ ] Frontend: QR code profile card + shareable card image
- [ ] Frontend: PDF CV one-click download
- [ ] Frontend: Dynamic metadata (generateMetadata) for all public pages
- [ ] Frontend: Sitemap route + robots.txt
- [ ] Frontend: Reusable Schema.org components

## 🟡 Phase G — Offer Management & Onboarding

- [ ] Backend: Offer model (salary, benefits, status, expiry)
- [ ] Backend: OfferTemplate (variable substitution: {{name}}, {{salary}})
- [ ] Backend: E-signature integration (DocuSign/HelloSign webhook)
- [ ] Backend: OnboardingTask + OnboardingChecklist models
- [ ] Frontend: Offer creation form (salary, benefits, template, preview)
- [ ] Frontend: Offer letter editor (rich text + variables)
- [ ] Frontend: Offer inbox (employer: sent list, resend)
- [ ] Frontend: Offer inbox (graduate: received, accept/reject)
- [ ] Frontend: Onboarding checklist (tasks, assignee, due dates)
- [ ] Frontend: Offer templates management
- [ ] Mobile: Offer management screens (M6)

## 🟡 Phase H — PWA & Offline

- [ ] Web: Service worker (Workbox: API cache, static assets, fonts)
- [ ] Web: Offline page with retry button
- [ ] Web: Install prompt (beforeinstallprompt handler)
- [ ] Web: Web Push API subscribe/unsubscribe
- [ ] Web: Complete manifest.json (icons, theme, display)
- [ ] Web: Background sync (queue mutations)
- [ ] Mobile: Offline-first (AsyncStorage cache)
- [ ] Mobile: Background fetch (periodic sync)

## 🟡 Phase I — Freelance Marketplace

- [ ] Backend: FreelanceProject model (budget, skills, status)
- [ ] Backend: FreelanceProposal (cover letter, bid, status)
- [ ] Backend: FreelanceContract + Milestone + EscrowTransaction
- [ ] Backend: FreelanceReview (rating, role-based)
- [ ] Backend: TimeEntry + WorkDiary
- [ ] Backend: Connects system (balance, purchase, deduct on proposal)
- [ ] Backend: Stripe Connect integration (accounts, escrow, release)
- [ ] Backend: Service fee calculation (tiered commission)
- [ ] Frontend: Browse projects (grid, filters, search)
- [ ] Frontend: Project detail + submit proposal
- [ ] Frontend: Post a project (budget, skills, description)
- [ ] Frontend: Active contracts (freelancer + client views)
- [ ] Frontend: Milestone management (create, fund, approve, dispute)
- [ ] Frontend: Time tracker (start/stop, manual entry, work diary)
- [ ] Frontend: Wallet & earnings (balance, transactions, withdrawals)
- [ ] Frontend: Connects management (purchase packs, usage)
- [ ] Frontend: Freelancer profile (bio, portfolio, JSS, badges)
- [ ] Frontend: Service packages (Basic/Standard/Premium)
- [ ] Frontend: Dispute center
- [ ] Backend: PayPal, PayTabs, mobile money gateways
- [ ] Mobile: All freelance screens (parallel)

## 🟡 Phase J — Company Intelligence (Glassdoor)

- [ ] Backend: SalaryReview model (role, years, salary, currency, anonymous)
- [ ] Backend: InterviewReview model (difficulty, questions, offer status)
- [ ] Backend: SalaryBenchmark view (median, p25, p75 by role + city)
- [ ] Backend: CompanyReview sub-scores (culture, work-life, pay, benefits, etc.)
- [ ] Backend: Competitor comparison endpoint
- [ ] Frontend: Salary submission form
- [ ] Frontend: Interview review form
- [ ] Frontend: Company intelligence dashboard (trend, benchmarks, competitors)
- [ ] Frontend: Salary explorer (role + city + experience → median chart)
- [ ] Frontend: Know your worth (personalized estimate)
- [ ] Frontend: Competitor comparison (side-by-side chart)
- [ ] Mobile: Company intelligence screens (M6)

## 🟡 Phase K — Skill Development

- [ ] Backend: Course, Lesson, Enrollment models
- [ ] Backend: Assessment + AssessmentAttempt + Badge + UserBadge models
- [ ] Backend: LearningPath + Course recommendation engine
- [ ] Backend: Certificate generation (PDF + QR verification)
- [ ] Frontend: Course catalog (grid, filter, search, featured)
- [ ] Frontend: Course detail + video player (progress, speed, transcripts)
- [ ] Frontend: Assessment UI (timed quiz, progress, results)
- [ ] Frontend: Learning paths (curated roadmaps)
- [ ] Frontend: Badge showcase on profile
- [ ] Frontend: Skill assessment tests
- [ ] Frontend: Career path visualizer (interactive SVG)
- [ ] Frontend: Course recommendations (skill gap → courses)
- [ ] Mobile: Learning screens (M6)

## 🟡 Phase L — Monetization & Economy

- [ ] Backend: JobCredit model + purchases + expiry
- [ ] Backend: Connects model + monthly allotment + purchases
- [ ] Backend: Transaction model (purchase, refund, commission, payout)
- [ ] Backend: Subscription model (plans, Stripe Billing)
- [ ] Backend: FeaturedListing (job/company promotion)
- [ ] Backend: InMailCredit + BoostToken models
- [ ] Backend: Stripe integration (subscriptions, invoices)
- [ ] Backend: PDF receipt/invoice generation
- [ ] Frontend: Pricing page (plan comparison table)
- [ ] Frontend: Checkout flow (Stripe Elements + confirm)
- [ ] Frontend: Subscription management (upgrade/downgrade/cancel)
- [ ] Frontend: Credit/connects purchasing
- [ ] Frontend: Featured job promotion (select → pay → promote)
- [ ] Frontend: Wallet (balance, transactions, withdrawals)
- [ ] Frontend: Invoice history (download PDF)
- [ ] Mobile: Monetization screens (M6)

## 🟡 Phase M — MENA Localization

- [ ] Backend: Hijri calendar conversion + Ramadan mode
- [ ] Backend: Multi-currency engine + exchange rates
- [ ] Backend: Country-specific validation (phone, ID formats)
- [ ] Backend: Per-country address formats
- [ ] Backend: Labour law + end-of-service calculator logic
- [ ] Backend: Tax calculator logic per country
- [ ] Backend: Saudization/Emiratization compliance indicators
- [ ] Backend: PDPL (KSA) + GDPR + Libyan data protection workflows
- [ ] Frontend: Hijri date picker component
- [ ] Frontend: Country selector with phone validation
- [ ] Frontend: Currency switcher + auto-conversion
- [ ] Frontend: Dynamic address forms per country
- [ ] Frontend: Labour law guides (per-country FAQ)
- [ ] Frontend: End of service calculator (years + salary → gratuity)
- [ ] Frontend: Tax calculator (income + deductions → tax)
- [ ] Frontend: Consent banners (GDPR, PDPL)
- [ ] Frontend: Dialect toggle (Egyptian, Levantine, Gulf, Maghrebi)
- [ ] Frontend: Local holidays calendar integration
- [ ] Mobile: Localization features (M6)

## 🟢 Phase N — DevOps & Infrastructure

- [ ] Staging environment with sanitized data
- [ ] Production docker-compose (nginx, PostgreSQL, Redis, ES)
- [ ] GitHub Actions CI/CD (lint → test → build → migrate → deploy)
- [ ] Automated DB backup + point-in-time recovery
- [ ] Sentry error tracking (Django + frontend)
- [ ] Load testing (k6/locust: 10K concurrent)
- [ ] CDN setup (Cloudflare)
- [ ] Email delivery (SendGrid + Mailgun failover)
- [ ] SMS delivery (Twilio + local provider)
- [ ] Redis multi-tier caching
- [ ] PgBouncer connection pooling
- [ ] OpenTelemetry + Grafana observability
- [ ] Public REST API docs (Swagger/Redoc)
- [ ] API key management (generate/revoke/scope)
- [ ] Webhooks (new application, status change, payment)
- [ ] ATS integrations (Greenhouse, Lever, Workable)
- [ ] Slack integration (new applicant, interview reminder)

---

## Status Legend

| Icon | Meaning |
|------|---------|
| 🔴 IN PROGRESS | Currently building |
| 🟡 Not started | Planned, queued |
| 🟢 Complete | Done and pushed |
| ⚪ Deferred | Post-MVP |

## Current Status

All major dev phases complete:
- 332 backend tests passing
- Frontend TypeScript: zero errors
- Mobile TypeScript: zero errors
- WebSocket infrastructure in place (notifications + chat)
- Mobile i18n (Arabic/English) wired in
- All screens connected to real API
- Employer job creation form added

## How to resume

```bash
# Backend
cd backend && source venv/bin/activate && python3 -m pytest

# Frontend (web)
cd frontend && npm run dev

# Mobile
cd mobile && npx expo start
```
