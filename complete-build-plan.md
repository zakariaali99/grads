# Graduators — Complete Build Plan

> **Status as of June 3, 2026**
> Core recruitment platform is functional: profiles, jobs, applications, search, AI, messaging, social feed, reviews, pipeline kanban. ~5300 lines of backend code, 286 tests passing with 83% coverage.

---

## Mobile Framework Decision

**Final decision: React Native (with Expo)**

### Why React Native over Flutter

| Factor | Flutter | React Native (2026) | Winner |
|--------|---------|---------------------|--------|
| Code sharing with web | None — separate Dart codebase | **Direct reuse** — types, API services, i18n, stores, validation schemas | **RN** |
| Team leverage | Need dedicated Flutter developer | **Web team builds mobile** — same language, same patterns, same toolchain | **RN** |
| Time to stores | ~2-3 months (build from scratch) | **~1.5-2.5 months** (reuse existing code) | **RN** |
| UI/UX quality | Excellent (Skia) | **Excellent** (New Architecture + react-native-skia + reanimated v3) | Tie |
| Arabic / RTL | Excellent | **Excellent** — delegates to native HarfBuzz/Core Text; `I18nManager.forceRTL` mirrors entire tree | Tie |
| Animation perf | Native-speed | **Native-speed** — JSI eliminates bridge overhead; Skia available via react-native-skia | Tie |
| OTA updates | Shorebird (emerging) | **expo-updates** (battle-tested, years in production) | **RN** |
| Ecosystem maturity | Large, fast-growing | **Larger** — Stripe, Maps, Camera, biometrics all have battle-tested RN packages | **RN** |
| App store approval risk | Low | **Lower** — Expo handles most policy pitfalls automatically | **RN** |
| MENA developer availability | Growing | **Significantly larger** — more React devs can transition to RN than learn Dart+Flutter | **RN** |

### The decisive factor: code reuse

The existing frontend at `frontend/src/` is **~15,000+ lines of TypeScript** that flows directly into the mobile app:

```
src/lib/types.ts          → Shared verbatim — every interface, every type
src/lib/api-services.ts   → Shared verbatim — every API call, every service
src/lib/api.ts            → Shared verbatim — axios instance, interceptors, refresh logic
src/lib/utils.ts          → Shared verbatim — cn(), formatDate(), every utility
src/i18n/                 → Shared verbatim — all AR + EN translations
src/store/                → Shared verbatim — Zustand stores for auth, theme, locale
src/hooks/                → Shared verbatim — useDebounce, useApiQuery, useChatWebSocket
```

The mobile project only re-implements the **UI layer** — screens, navigation, native gestures, and animations — while every line of business logic, data fetching, state management, and localization is shared.

**Net result: ~60% of the mobile app exists before we write a single line of mobile code.**

---

## Phase M0: Mobile App Foundation — React Native + Expo

### M0.1 Project Initialization

```bash
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
npx expo install expo-router expo-secure-store expo-notifications \
  expo-linking expo-haptics expo-image expo-image-picker \
  react-native-reanimated react-native-gesture-handler \
  @shopify/react-native-skia @react-native-maps/maps \
  zustand axios date-fns
```

### M0.2 Architecture

```
mobile/
├── src/
│   ├── lib/              ← Symlinked from frontend/src/lib/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── api-services.ts
│   │   ├── utils.ts
│   │   └── websocket.ts
│   ├── store/            ← Symlinked from frontend/src/store/
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── localeStore.ts
│   ├── i18n/             ← Symlinked from frontend/src/i18n/
│   ├── hooks/            ← Symlinked from frontend/src/hooks/
│   │   ├── useDebounce.ts
│   │   ├── useApiQuery.ts
│   │   └── useChatWebSocket.ts
│   ├── app/              ← Expo Router (file-based routing)
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (graduate)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx        ← Dashboard
│   │   │   ├── profile.tsx
│   │   │   ├── jobs.tsx
│   │   │   ├── applications.tsx
│   │   │   ├── messages.tsx
│   │   │   ├── social.tsx
│   │   │   └── settings.tsx
│   │   ├── (employer)/
│   │   │   └── ...
│   │   ├── (admin)/
│   │   │   └── ...
│   │   └── _layout.tsx          ← Root layout, providers
│   ├── components/       ← Mobile-specific UI components
│   │   ├── GlassCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorWidget.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── SearchField.tsx
│   │   ├── PaginatedList.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── BottomSheet.tsx
│   ├── animations/       ← Reanimated-based animation primitives
│   │   ├── fadeIn.ts
│   │   ├── slideUp.ts
│   │   ├── scaleIn.ts
│   │   ├── stagger.ts
│   │   ├── sharedElement.ts
│   │   └── springPress.ts
│   ├── theme/            ← Design system tokens (mirrors web glass-card)
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── typography.ts
│   └── utils/
│       ├── haptics.ts
│       ├── notifications.ts
│       └── deepLinks.ts
├── app.json
└── eas.json
```

### M0.3 Design System — Glass-Card for Mobile

The web glass-card design system translates to native:

```tsx
// GlassCard.tsx — frosted glass with blur, border, shadow
<BlurView intensity={20} tint="light">
  <LinearGradient colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']}>
    <View style={shadowElevated}>
      {children}
    </View>
  </LinearGradient>
</BlurView>
```

| Web Token | Mobile Implementation |
|-----------|----------------------|
| `glass-card` | `expo-blur` + `LinearGradient` |
| `stat-value` | `Animated.Text` with spring scale |
| `badge-primary` | `LinearGradient` pill with icon |
| `card-hover` | `Reanimated` scale + shadow on press |
| `gradient-primary` | `expo-linear-gradient` |
| `section-title` | Bold text with bottom accent line |

### M0.4 Animation Primitives

Every interaction gets a deliberate motion language — not decorative, but functional:

```
Press → spring scale 0.97 → spring scale 1.0 (200ms)
Navigate → shared element transition + fade (350ms)
Like → icon bounce + spring scale 1.3 → 1.0 (400ms)
Swipe → drag with spring snap, haptic on threshold (150ms)
List appear → staggered fade-in-up (50ms stagger per item)
Error shake → spring oscillation on X axis (300ms)
Pull refresh → rubber-band resistance + loading spinner flip (custom)
```

All built with `react-native-reanimated` v3 — no third-party animation libraries needed.

### M0.5 Navigation Shell

```
                    ┌─────────────────────────┐
                    │      Status Bar          │
                    │  (transparent, edge-to-  │
                    │   edge tinted to card)   │
                    ├─────────────────────────┤
                    │                         │
                    │   ANIMATED HEADER       │
                    │   · Collapses on scroll  │
                    │   · Shows search + bell  │
                    │   · Sticky gradient bg  │
                    │                         │
                    ├─────────────────────────┤
                    │                         │
                    │                         │
                    │    CONTENT AREA          │
                    │    · Shared element      │
                    │      transitions        │
                    │    · Staggered list      │
                    │      animations        │
                    │    · Spring press on     │
                    │      every card         │
                    │                         │
                    │                         │
                    ├─────────────────────────┤
                    │   BOTTOM TAB BAR        │
                    │   · Role-aware (grad/   │
                    │     emp/admin/inst)     │
                    │   · Badge counts (ws)   │
                    │   · Spring scale on     │
                    │     active tab          │
                    │   · Haptic on switch    │
                    │   · Frosted glass bg    │
                    └─────────────────────────┘
```

### M0.6 Shared Module Symlinks

To avoid duplicating code, the mobile project references the web project's shared modules:

```json
// mobile/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../frontend/src/*"]
    }
  }
}
```

This means `import { User } from '@shared/lib/types'` in mobile resolves to `frontend/src/lib/types.ts`. Any change to types, API services, stores, or i18n in the web project is instantly available to mobile.

### M0.7 Key Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Framework | **Expo SDK 52+** | Managed workflow, OTA updates, EAS build/submit |
| Navigation | **Expo Router** | File-based, mirrors Next.js App Router pattern |
| State | **Zustand** | Shared with web, minimal boilerplate |
| HTTP | **axios** | Shared with web, same interceptors |
| Animations | **react-native-reanimated v3** | 120fps UI thread animations |
| Gestures | **react-native-gesture-handler** | Native gesture recognition |
| Canvas | **@shopify/react-native-skia** | Charts, badges, particle effects |
| Blur | **expo-blur** | Glassmorphism effect |
| Gradients | **expo-linear-gradient** | Gradient backgrounds |
| Maps | **react-native-maps** | Apple Maps + Google Maps |
| Camera | **expo-camera** | Photo/video capture |
| Secure storage | **expo-secure-store** | Token persistence |
| Push | **expo-notifications + FCM** | Silent + display notifications |
| Haptics | **expo-haptics** | Tactile feedback on interactions |
| Image | **expo-image** | Fast cached images with blurhash |
| CI/CD | **EAS Build + EAS Submit** | Build → TestFlight → Play Store |
| OTA | **expo-updates** | Push JS updates without store review |

---

## Phase M1: Auth & Onboarding (Week 1)

The moment a user opens the app:

```
┌─────────────────────────────┐
│                             │
│        LOGO ANIMATION       │
│     · Icon fades in with    │
│       spring scale          │
│     · "خريجون" types in     │
│       letter by letter      │
│     · Tagline fades below   │
│                             │
│    ┌───────────────────┐   │
│    │  تسجيل الدخول      │   │
│    │  Login             │   │
│    │  (glass button,    │   │
│    │   spring on press) │   │
│    └───────────────────┘   │
│                             │
│    ┌───────────────────┐   │
│    │  إنشاء حساب        │   │
│    │  Create Account    │   │
│    └───────────────────┘   │
│                             │
│     · RTL detected from     │
│       device locale         │
│     · Auto-switches to      │
│       Arabic UI             │
│     · Full glass-card bg    │
│       with animated blob    │
│       gradient              │
│                             │
└─────────────────────────────┘
```

| Screen | Features | Motion |
|--------|----------|--------|
| Splash | Logo animation, locale detection, token check, auto-redirect | Typewriter + spring logo |
| Login | Email/phone + password, role selector, biometric shortcut | Fade-in staggered form fields |
| Register | Multi-step: role → personal → verification → complete | Slide between steps with shared header |
| Forgot password | Email → OTP → new password | Progress indicator with spring fill |
| Role selection | Graduate/Employer/Institution with glass cards | Spring scale on selection, haptic |

---

## Phase M2: Graduate Experience (Weeks 2-4)

### Dashboard

```
┌─────────────────────────────────────┐
│  مرحباً أحمد ☀️           ★ 78%    │
│  (spring greeting with time-aware)  │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │  142 │ │  12  │ │   3  │ │  8 │ │
│  │ زائر │ │ طلب  │ │مقابلة│ │محفوظ│ │
│  └──────┘ └──────┘ └──────┘ └────┘ │
│  (stat cards with icon + spring     │
│   scale on each number change)      │
├─────────────────────────────────────┤
│  المهارات                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌───┐ ┌─+─┐│
│  │JS  │ │TS  │ │Py  │ │Go │ │   ││
│  └────┘ └────┘ └────┘ └───┘ └───┘│
│  (animated skill tags, spring      │
│   on add/remove)                   │
├─────────────────────────────────────┤
│  الوظائف المقترحة                    │
│  ┌─────────────────────────────────┐│
│  │ Senior Frontend Developer       ││
│  │ شركة تقنية • طرابلس    تطابق 92%││
│  │ (staggered list, swipe to save) ││
│  ├─────────────────────────────────┤│
│  │ Full Stack Engineer             ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

| Screen | Features | Motion |
|--------|----------|--------|
| Dashboard | Stats cards, skills, recommended jobs, ad banner | Staggered entry, auto-refresh on pull |
| Profile | Inline edit education/experience/certs/projects/skills/CV | Expandable sections, spring to edit |
| Profile edit | Full CRUD modals, skill selector with search | Bottom sheet slide-up, spring confirm |
| Job feed | Filterable list, search, categories | Paginated with staggered entry, swipe to save |
| Job detail | Full description, company info, apply button | Shared element from list card, apply spring |
| Applications | Status tabs, expandable cards with details | Accordion with spring expand, status color pulse |
| Interviews | Calendar + list, upcoming/past sections | Calendar with animated dots, list staggered |
| Messages | Chat list → conversation → typing → send | Bubbles with spring send, typing dots animate |
| Social feed | Create post, reactions (5 types), comments, follow | Reaction bounce, comment slide-up, follow spring |
| Settings | Password, delete account, theme, language | Sections with spring toggle, danger zone shake |

### Mobile-Native Touches

| Feature | Implementation |
|---------|---------------|
| Swipe to save job | Pan gesture with spring snap, save icon fill animation |
| Pull to refresh | Custom spring-based refresh indicator with gradient spinner |
| Share profile | Native share sheet with QR code image |
| Biometric login | Face ID / fingerprint on app open |
| Deep link to job | Open `graduators.ly/jobs/abc` → open app directly |
| In-app camera | Scan CV, take profile photo, scan certificates |
| Offline job cache | View last-searched jobs without connection |
| Background fetch | Sync notifications every 15 min |

---

## Phase M3: Employer Experience (Weeks 3-5)

| Screen | Mobile-Native Features |
|--------|----------------------|
| Dashboard | Stats (active jobs, applicants, views), recent applicants list, chart sparklines |
| Pipeline Kanban | Horizontally paged stage columns, drag cards with spring snap, haptic on stage change |
| Job management | Create/edit with rich text, publish/close with spring confirm |
| Applicants list | Filter by status, swipe to move stage, tap for full profile |
| Interview scheduling | Date picker with time slots, calendar sync, push reminder |
| Company profile | Edit with image upload, verification request button |
| Messages | Same chat component as graduate, role-aware |
| Reviews | See company reviews, approve pending, rating chart |
| Social feed | Post as company, engage with candidates |

---

## Phase M4: Admin Experience (Week 5-6)

| Screen | Mobile-Native Features |
|--------|----------------------|
| Dashboard | Live metrics with WebSocket push, sparkline charts, alerts carousel |
| Users | Searchable list, ban/verify/delete with spring confirm |
| Companies | List with verification status, feature toggle |
| Jobs | List with status filter, close/feature actions |
| Activity logs | Filterable timeline, search, share log entry |
| Events | System health cards with pulse indicator, queue depth gauges |
| Moderation | Swipe to approve/reject reviews/posts, spring undo |

---

## Phase M5: Cross-Cutting Mobile Features (Weeks 6-8)

### M5.1 Push Notifications
| Feature | Details |
|---------|---------|
| FCM integration | expo-notifications + Firebase Cloud Messaging |
| Notification categories | New message, application update, interview reminder, job match, review requested |
| Deep links from notification | Tap → open specific screen (message, job, application) |
| Notification settings | Per-type toggle in settings, quiet hours |
| In-app notification center | Full history, mark read, swipe to dismiss |

### M5.2 Offline Mode
| Feature | Details |
|---------|---------|
| Offline-first data | AsyncStorage cache for profile, jobs, feed, messages |
| Queue mutations | axios retry interceptor queues failed requests, replays on reconnect |
| Conflict resolution | Last-write-wins with server timestamp comparison |
| Offline indicator | Animated banner when offline, disappears on reconnect |

### M5.3 Deep Linking
```
graduators.ly/profile/ahmed  →  App opens → Profile screen
graduators.ly/jobs/abc-123   →  App opens → Job detail
graduators.ly/messages       →  App opens → Messages list
graduators://job/abc-123     →  Custom scheme, same behavior
expo-notification data       →  Opens specific screen
```

### M5.4 Accessibility
| Feature | Details |
|---------|---------|
| Screen reader support | ARIA labels on all interactive elements |
| Dynamic type | Respects system font size settings |
| High contrast | Automatic detection + adjusted colors |
| Reduce motion | Respects iOS/Android reduced motion setting → disable animations |
| Keyboard navigation | Tab order, focus rings, enter to activate |

---

## Phase M6: Polish & App Store (Week 8-9)

### M6.1 Micro-Interactions Audit
Every screen is reviewed for:

| Interaction | Implementation |
|-------------|---------------|
| Card press | Spring scale 0.97 → 1.0, subtle shadow lift |
| Button press | Spring scale 0.95, haptic impact (light) |
| Tab switch | Spring scale on active icon, haptic (selection) |
| List appearance | Staggered fade-in-up, 50ms offset per item |
| Pull refresh | Custom spring indicator with gradient arc fill |
| Swipe to dismiss | Pan gesture with spring snap, haptic on threshold |
| Like/react | Bounce animation, haptic (medium), counter increment spring |
| Comment submit | Slide-up with spring, list auto-scroll |
| Error shake | Spring oscillation on X axis, red border pulse |
| Success check | Green check mark spring scale, haptic (success) |
| Modal appear | Backdrop fade + card slide-up with spring |
| Image load | Blurhash placeholder → crossfade to image |

### M6.2 App Store Assets

| Asset | AR Version | EN Version |
|-------|-----------|-----------|
| App icon | Gradient "خ" with glass effect | Gradient "G" with glass effect |
| Screenshots (6.7") | 5 screenshots with Arabic UI | 5 screenshots with English UI |
| Screenshots (6.5") | Same, resized | Same, resized |
| Description | Full Arabic description with keywords | Full English description with keywords |
| Keywords | توظيف, خريجين, فرص عمل, وظائف, كليات تقنية | jobs, graduates, recruitment, hiring, careers |
| Promo video | 30s screen recording with Arabic text overlay | 30s screen recording with English text overlay |

### M6.3 Beta Testing

| Platform | Method | Duration |
|----------|--------|----------|
| iOS | TestFlight internal → external with 100 testers | 1 week |
| Android | Google Play closed track → open beta | 1 week |
| Feedback | In-app feedback form + Firebase Crashlytics + Analytics | Ongoing |

### M6.4 Launch Sequence

```
Day 1:  Submit to App Store + Google Play
Day 3:  iOS review (avg 24-48h)
Day 3:  Android review (avg 2-4h)
Day 4:  Soft launch — 10% of existing web users notified
Day 7:  Full launch — push notification to all users, in-app banner
Day 14: Review analytics, crash reports, user feedback → patch cycle
```

---

## Mobile-Specific Feature Comparison

| Web Feature | Mobile Equivalent | Shared Code % |
|-------------|------------------|---------------|
| Auth (login/register/reset) | Same screens, native biometrics | **100%** API + store |
| Graduate profile CRUD | Same forms, camera for photos | **100%** types + API |
| Job browsing + apply | Same cards, swipe to save | **100%** types + API |
| Search + filters | Same service, mobile-optimized UI | **100%** API + utils |
| Chat (WebSocket) | Same hook, push notifications | **100%** WebSocket + store |
| Notifications | Same service + push via FCM | **100%** API + store |
| Social feed | Same API, mobile reactions | **100%** types + API |
| Pipeline kanban | Drag cards instead of click | **100%** types + API |
| Company reviews | Same star selectors | **100%** types + API |
| Admin dashboard | Same analytics endpoint | **100%** API |
| Institution portal | Same tracking endpoints | **100%** API |
| Events + groups | Same CRUD + calendar | **100%** types + API |
| Freelance marketplace | Same proposals + escrow | **100%** types + API |
| Learning platform | Same courses + video player | **100%** types + API |
| Monetization | Same Stripe + purchases | **100%** API + store |

**Every line of shared code is written once and used by both platforms.**

---

## The Outcome

Two surfaces. One codebase. Zero duplication.

The web app handles desktop recruiting workflows. The mobile app gives graduates and employers the same experience in their pocket — with native gestures, push notifications, offline access, and buttery smooth animations that make every interaction feel deliberate.

A graduate wakes up to a push notification: "تطابق جديد — Senior Frontend Developer, تطابق 94%". They tap it, the app opens with a shared-element transition into the job detail, swipe to save, and the day hasn't even started.

An employer opens the pipeline board, drags a candidate from "مقابلة" to "عرض", the card snaps into place with a haptic thud and the stage count animates. Two taps. That's hiring.

React Native + Expo is the clearest path there.

---

## Phase B: Institution Portal (Weeks 2-4)

### B.1 Backend — Institution App
| Task | Details | Priority |
|------|---------|----------|
| Create `apps/institution/` app | AppConfig, models, serializers, views, URLs | ★★★ |
| `InstitutionProfile` model | O2O to User, institution_type (university/college/institute/training_center), city, website, logo, cover | ★★★ |
| `GraduateTracking` model | FK Institution, FK User (graduate), graduation_year, is_employed, employer_name, salary_range, last_updated | ★★★ |
| `InstitutionPartnership` model | FK Institution, FK CompanyProfile (or User), moa_document, start_date, end_date, is_active | ★★ |
| `InstitutionDashboardView` | GET aggregated stats: total tracked, employment rate, avg salary, partnership count, top employers | ★★★ |
| `InstitutionGraduateViewSet` | CRUD for tracking graduates, import CSV, export reports | ★★★ |
| `CurriculumFeedbackView` | Generate skill demand reports from market data | ★★ |
| Register URLs | `/api/v1/institution/` prefix in config/urls.py | ★★★ |
| Permissions | Only `institution` user_type can access; admin can access all | ★★★ |
| Tests | Model tests + API CRUD tests for all endpoints | ★★★ |

### B.2 Frontend — Institution Pages
| Page | Features | Effort |
|------|----------|--------|
| Dashboard | Stats cards (tracked graduates, employment rate, partnerships), trend line chart, recent graduates list | 8h |
| Graduates list | Searchable table: name, college, graduation_year, is_employed, employer, actions (edit, delete) | 6h |
| Graduate detail | Full profile view + employment tracking form | 4h |
| Import CSV | Upload CSV of graduates, map columns, preview, confirm | 4h |
| Analytics | Program analytics: employment rate by major, salary ranges, top employers chart | 8h |
| Partnerships | List companies with MOUs, add new partnership, upload document | 4h |
| Reports | Export PDF/Excel reports for accreditation | 3h |
| Settings | Update institution profile, logo, cover image | 2h |

### B.3 i18n Keys
Arabic + English for all institution features (~40 keys).

---

## Phase C: Admin Super-Dashboard (Weeks 3-5)

### C.1 Backend — Admin Enhancements
| Task | Details | Priority |
|------|---------|----------|
| Real-time metrics endpoint | GET `/api/v1/admin/live-metrics/` — active users now, applications today, new registrations today, interviews happening now | ★★★ |
| Fraud detection endpoint | GET `/api/v1/admin/fraud/flags/` — list flagged accounts with reason, confidence score, evidence | ★★★ |
| Review moderation queue | GET `/api/v1/admin/moderation/reviews/` — pending reviews with approve/reject actions | ★★ |
| Content moderation | GET `/api/v1/admin/moderation/posts/` + `/comments/` — reported posts/comments | ★★ |
| System health endpoint | GET `/api/v1/admin/system/health/` — Redis ping, PostgreSQL conn count/lag, Celery queue depth, ES status | ★★★ |
| Feature flags CRUD | Model + ViewSet — toggle features per environment/segment | ★★ |
| Rate limit config | Admin endpoint to view/update throttling rates per user type | ★★★ |
| Audit log viewer | Enhanced filtering: date range, action type, user, model name | ★★ |
| Email template editor | WYSIWYG editor for transactional emails (verify, password reset, alerts) | ★★ |

### C.2 Frontend — Admin Pages (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Live Dashboard | Real-time metrics (WebSocket push), active users counter, hourly registration chart, latest signups feed | 12h |
| Fraud Detection Center | Flagged accounts list with confidence score, reason, evidence, review workflow (dismiss/warn/ban) | 10h |
| Moderation Queue | Tabs: Reviews, Posts, Comments, Companies — approve/reject with reason | 8h |
| System Health | Cards for each service (Redis, PostgreSQL, Celery, ES) with status indicator, response time, queue depth | 6h |
| Feature Flags | Toggle list with environment selector (dev/staging/prod), user segment targeting | 4h |
| Audit Log Viewer | Filterable table with date range, action type, user autocomplete, pagination | 6h |
| Email Templates | List templates, edit in rich text editor, preview, send test | 6h |

---

## Phase D: Professional Networking — Full Suite (Weeks 4-7)

### D.1 Backend — Social App Expansion
| Feature | Details | Priority |
|---------|---------|----------|
| **Newsletters** | Newsletter model (author, title, content, subscribers), subscribe/unsubscribe, scheduled send | ★★ |
| **Trending hashtags** | HashtagUsage model tracking usage count + recency, compute trending algorithm | ★★ |
| **Feed algorithm** | Weighted scoring: connections > recent > reactions > comments > popular | ★★ |
| **Content moderation** | Report model (reported_by, target_type, target_id, reason, status), auto-flagging | ★★★ |
| **Connections** | Connection model (requester, addressee, status: pending/accepted/rejected), mutual count | ★★★ |
| **Connection suggestions** | Algorithm: mutual connections, same college, same industry, same city | ★★ |
| **Network stats** | Connection growth over time, industry breakdown | ★ |
| **Profile view tracking** | Who viewed your profile — POST endpoint, list viewers | ★★ |
| **Import contacts** | CSV parse + matching by email/phone, send connection request | ★ |
| **Mentorship matching** | MentorshipRequest model, matching by skills + industry + experience | ★★ |
| **Analytics for posts** | Impression tracking, reaction rate, share count, audience demographics | ★★★ |

### D.2 Frontend — Social Features (Web + Mobile)
| Page/Feature | Details | Effort |
|-------------|---------|--------|
| Feed algorithm redesign | Personalized ranking with "Trending" and "Latest" tabs | 6h |
| Hashtag pages | `/hashtag/[tag]` — posts with hashtag, trending sidebar | 4h |
| Newsletter creation | Rich text editor, subscriber management, send/schedule | 8h |
| Connection management | Requests inbox, suggestions, search by name/school/company | 8h |
| Profile viewers | "Who viewed your profile" list with premium upsell | 4h |
| People also viewed | Widget on profiles showing similar profiles | 2h |
| Import contacts | Upload CSV, match results, send invitations | 4h |
| Post analytics | Impression count, reaction breakdown, share count per post | 4h |
| Content reporting | Report button on posts/comments with reason selector | 3h |
| Mentorship | Request flow, match suggestions, session scheduling | 6h |

---

## Phase E: Events & Groups (Weeks 5-7)

### E.1 Backend — Events App
| Model/View | Details | Priority |
|------------|---------|----------|
| `Event` model | title, description, type (online/in-person), location (lat/lng + address), start/end, timezone, max_attendees, cover_image, is_featured | ★★★ |
| `EventRegistration` model | FK Event + FK User, status (going/interested/not_going), registered_at, checked_in | ★★★ |
| `EventSpeaker` model | FK Event, name, title, photo, bio, social links | ★★ |
| `EventViewSet` | CRUD, list by date/featured, RSVP action, check-in action | ★★★ |
| `EventReminderTask` | Celery: send push/email 1h, 1 day, 1 week before | ★★★ |
| Video integration | Embed Zoom/Google Meet URL, pre-meeting reminder, post-meeting recording upload | ★★ |

### E.2 Backend — Groups App
| Model/View | Details | Priority |
|------------|---------|----------|
| `Group` model | name, description, type (public/private/membership_approval), cover_image, rules (JSON), is_active | ★★★ |
| `GroupMembership` model | FK Group + FK User, role (admin/moderator/member), joined_at | ★★★ |
| `GroupPost` model | FK Group + FK User (author), content, image, is_pinned | ★★ |
| `GroupViewSet` | CRUD, join/leave/approve_member/kick_member actions | ★★★ |
| `GroupPostViewSet` | CRUD within group, list group feed | ★★ |
| Group analytics | Active members, top posts, growth chart | ★ |

### E.3 Frontend — Events + Groups (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Events discovery | Grid with filter by type/date/location, featured carousel | 8h |
| Event detail page | Header with cover + date, description, speakers, attendees, RSVP button | 6h |
| Create/edit event | Form with date picker, location picker (Google Maps), speaker management | 6h |
| Event calendar | Month/week view of registered events | 4h |
| Groups discovery | Search/filter groups, my groups tab, recommended groups | 6h |
| Group page | Header, feed, members list, join/leave button | 6h |
| Create group | Form with name, description, type, cover image, rules | 4h |
| Group admin panel | Member management (approve/kick/promote), settings, analytics | 4h |
| Event reminders | Push notification scheduling + preferences | 3h |

---

## Phase F: Public Profiles & SEO (Weeks 6-8)

### F.1 Backend — Public Profile Endpoints
| Task | Details | Priority |
|------|---------|----------|
| Public graduate profile | GET `/api/v1/graduates/public/<username>/` — no auth required, limited fields | ★★★ |
| Public company profile | GET `/api/v1/employers/public/<slug>/` — no auth required, reviews, jobs | ★★★ |
| SEO meta endpoint | GET `/api/v1/seo/meta/<type>/<id>/` — returns Open Graph + Twitter Card tags as JSON | ★★★ |
| Schema.org structured data | Embed JSON-LD in public pages: `JobPosting`, `Person`, `Organization`, `EducationalOrganization` | ★★★ |
| Sitemap generator | Dynamic XML sitemap: `/sitemap.xml` — lists all public profiles, jobs, companies | ★★★ |
| PDF CV export | POST `/api/v1/graduates/cvs/<id>/export-pdf/` — generate RTL/LTR PDF with proper Arabic typesetting | ★★★ |

### F.2 Frontend — Public Pages (Web)
| Page | Features | Effort |
|------|----------|--------|
| Public graduate page | `/graduate/<username>` — SEO-optimized, Open Graph tags, full profile view, contact button, follow | 8h |
| Public company page | `/company/<slug>` — cover, info, reviews, jobs, follow, life section | 8h |
| Public job page | `/jobs/<id>` — full job details, company info, apply button, schema.org JobPosting | 6h |
| QR profile card | Generate QR code for profile URL, shareable card image | 3h |
| PDF CV download | One-click export with proper Arabic font rendering | 4h |

### F.3 Next.js SEO Infrastructure
| Task | Details | Effort |
|------|---------|--------|
| Dynamic metadata | `generateMetadata()` for all public pages with Open Graph + Twitter Cards | 6h |
| Sitemap route | `/sitemap.xml` — dynamic server-side generation from DB | 4h |
| Robots.txt | `/robots.txt` — allow all, sitemap URL | 1h |
| Schema.org components | Reusable `JobPostingJsonLd`, `PersonJsonLd`, `OrganizationJsonLd` components | 4h |
| SSR for public pages | Force dynamic rendering for public profile pages | 2h |

---

## Phase G: Offer Management & Onboarding (Weeks 7-9)

### G.1 Backend — Offer Management
| Model/View | Details | Priority |
|------------|---------|----------|
| `Offer` model | FK JobApplication + FK CompanyProfile, title, salary, start_date, benefits (JSON), status (draft/sent/accepted/rejected), expires_at | ★★★ |
| `OfferTemplate` model | FK CompanyProfile, name, content template with variable substitution ({{candidate_name}}, {{salary}}, etc.) | ★★ |
| `OfferLetterViewSet` | CRUD, send (email + push), accept/reject actions | ★★★ |
| E-signature integration | DocuSign/HelloSign API — send for signature, webhook callback | ★★ |
| `OnboardingTask` model | FK Offer, title, description, assigned_to, due_date, is_completed, completed_at | ★★ |
| `OnboardingChecklistViewSet` | CRUD checklist per offer, complete task | ★★ |

### G.2 Frontend — Offer Management (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Offer creation form | Title, salary fields, benefits checklist, template selector, preview | 8h |
| Offer letter editor | Rich text editor with variable placeholders, live preview | 4h |
| Offer inbox (employer) | List sent offers with status (draft/sent/accepted/rejected), resend | 4h |
| Offer inbox (graduate) | Received offers with accept/reject buttons, countdown timer | 4h |
| Onboarding checklist | Task list with assignee, due date, completion toggle | 4h |
| Offer templates | Manage reusable templates with variable substitution | 3h |

---

## Phase H: PWA & Offline Support (Week 8-9)

### H.1 PWA Setup (Web)
| Task | Details | Effort |
|------|---------|--------|
| Service worker | Workbox-based: cache API responses, static assets, Google Fonts | 6h |
| Offline page | Stylized offline indicator with retry button | 2h |
| Install prompt | `beforeinstallprompt` handler with custom install banner | 3h |
| Push notifications | Web Push API — subscribe/unsubscribe from service worker | 6h |
| Manifest.json | Complete manifest with icons (192/512), theme color, display modes | 2h |
| Background sync | Queue failed mutations for retry when online | 4h |

### H.2 Mobile PWA Equivalent (Flutter)
| Task | Details | Effort |
|------|---------|--------|
| Offline-first data | SQLite (drift) + API sync queue — read from local first, sync on connection | 12h |
| Push notifications | Firebase Cloud Messaging (FCM) + local notifications | 6h |
| Background fetch | Periodic sync of notifications, messages, feed | 4h |
| Deep linking | Handle `graduators.ly/profile/username`, `graduators.ly/jobs/id` etc. | 4h |

---

## Phase I: Freelance Marketplace (Weeks 9-14)

### I.1 Backend — Freelance App
| Model/View | Details | Priority |
|------------|---------|----------|
| Create `apps/freelance/` app | AppConfig, models, serializers, views, URLs | ★★★ |
| `FreelanceProject` model | client (FK User), title, description, budget_type (fixed/hourly), budget_min, budget_max, duration, skills (M2M), status (open/in_progress/completed/cancelled) | ★★★ |
| `FreelanceProposal` model | freelancer (FK User), project (FK), cover_letter, bid_amount, bid_type (fixed/hourly), estimated_days, status (pending/accepted/rejected/withdrawn) | ★★★ |
| `FreelanceContract` model | project (FK), freelancer (FK), client (FK), contract_type, amount, start_date, end_date, status | ★★★ |
| `Milestone` model | contract (FK), title, amount, description, due_date, status (pending/in_review/completed/disputed) | ★★ |
| `FreelanceReview` model | contract (FK), reviewer (FK User), rating, review, role (client/freelancer) | ★★ |
| `EscrowTransaction` model | contract (FK), amount, type (deposit/release/refund/dispute), status, gateway_txn_id | ★★ |
| `TimeEntry` model | contract (FK), freelancer (FK), hours, description, date, is_approved | ★★ |
| `WorkDiary` model | contract (FK), date, screenshots (JSON array of URLs), activity_level, memo | ★★ |
| ProposalViewSet | CRUD, accept/reject action | ★★★ |
| ProjectViewSet | CRUD, list with filters (category, budget, skills, location) | ★★★ |
| ContractViewSet | CRUD, start/complete/cancel actions | ★★★ |
| MilestoneViewSet | CRUD, submit for review, approve, request changes, dispute | ★★ |
| DisputeViewSet | Create dispute, admin resolution | ★ |
| `Connects` system | User.connects_balance field, deduct on proposal submission, purchase via payment | ★★★ |
| Stripe Connect integration | Create account, transfer to escrow, release to freelancer, platform fee | ★★★ |
| Service fee calculation | Tiered: 20% on first $500, 10% on $500-$5000, 5% on $5000+ | ★★ |

### I.2 Frontend — Freelance (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Browse projects | Searchable/filterable grid with budget, skills, duration, location | 8h |
| Project detail | Full description, client info, proposals count, apply button | 6h |
| Post a project | Form with budget type, skills selector, duration, description editor | 6h |
| Submit proposal | Cover letter editor, bid amount, estimated days, attach portfolio | 4h |
| Active contracts (freelancer) | List with status, milestones, hours worked, earnings | 6h |
| Active contracts (client) | List with freelancer info, milestones to approve, payment status | 6h |
| Milestone management | Create, fund, approve, dispute milestones | 6h |
| Time tracker | Start/stop button, manual entry, work diary view with screenshots | 8h |
| Wallet & earnings | Balance, transaction history, withdrawal methods, pending clearances | 6h |
| Connects management | Balance, purchase packs, usage history | 3h |
| Freelancer profile | Bio, skills, hourly rate, portfolio, work history, job success score | 6h |
| Service packages | Basic/Standard/Premium tiers with pricing, delivery time, features | 4h |
| Reviews & ratings | Leave review after contract completion, rating distribution | 4h |
| Dispute center | File dispute, chat with mediator, status tracking | 4h |

### I.3 Payment Gateway Integration
| Task | Details | Effort |
|------|---------|--------|
| Stripe Connect onboarding | Express accounts for freelancers, standard for companies | 8h |
| Escrow payment flow | Client funds → Stripe Connect hold → release on milestone | 8h |
| Platform fee deduction | Auto-deduct commission before releasing to freelancer | 4h |
| Payout scheduling | Weekly/bi-weekly/manual withdrawal with minimum balance | 6h |
| Multi-currency | LYD, USD, EUR, TND, EGP, SAR, AED with auto-conversion rates | 8h |
| PayPal integration | PayPal Payouts as secondary withdrawal method | 4h |
| Local gateways | PayTabs / Tap / Moyasar for MENA credit cards | 4h |
| Mobile money | M-Pesa, MTN, Orange Money via aggregator API | 4h |
| Invoice generation | Auto-generated VAT invoices per payment | 3h |

---

## Phase J: Company Intelligence — Glassdoor Suite (Weeks 12-15)

### J.1 Backend — Reviews Expansion
| Model/View | Details | Priority |
|------------|---------|----------|
| `SalaryReview` model | FK CompanyProfile, FK User, role_title, years_experience, salary_amount, currency, is_anonymous, is_approved | ★★★ |
| `InterviewReview` model | FK CompanyProfile, FK User, role_title, experience (positive/neutral/negative), difficulty, offer_status, questions (JSON), duration_days, is_approved | ★★★ |
| `SalaryBenchmark` view | GET aggregated: median, p25, p75 by role + city + experience | ★★★ |
| `CompanyReview` enhancements | Add sub-scores: culture, work_life, pay, benefits, management, career | ★★ |
| CEO approval field | Boolean on CompanyReview: approve/disapprove of CEO | ★★ |
| Review moderation AI | NLP scoring for fake/spam reviews before approval | ★★ |
| Competitor comparison | GET `/api/v1/companies/<id>/compare/?competitors=id1,id2,id3` | ★★★ |

### J.2 Frontend — Glassdoor Pages (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Company review form | Star ratings (5 sub-scores), pros/cons text, CEO approval, recommend to friend | 6h |
| Salary submission | Role title, years exp, salary amount, currency, location, anonymous toggle | 4h |
| Interview review | Difficulty slider, experience selector, offer status, questions list, duration | 4h |
| Company intelligence dashboard | Average rating trend, salary benchmarks, interview difficulty, competitor comparison | 10h |
| Salary explorer | Search by role + city + experience, shows median + range chart, negotiation tips | 8h |
| Interview explorer | Per-company questions database, difficulty rating, recent experiences | 6h |
| Know your worth | Personalized salary estimate based on profile + market data | 4h |
| Competitor comparison | Side-by-side bar chart comparing 3-5 companies | 4h |
| Review sentiment | Word cloud, topic clusters, positive/negative trend over time | 4h |

---

## Phase K: Skill Development (Weeks 14-18)

### K.1 Backend — Learning App
| Model/View | Details | Priority |
|------------|---------|----------|
| Create `apps/learning/` app | Course, Lesson, Enrollment, Assessment, Badge, LearningPath models | ★★★ |
| `Course` model | title, description, provider (internal/external), category, skills (M2M), difficulty, duration_hours, is_free, price, video_url, thumbnail | ★★★ |
| `Enrollment` model | FK User + FK Course, progress_pct, started_at, completed_at, certificate_url | ★★★ |
| `Assessment` model | FK Course, questions (JSON), passing_score, time_limit, attempts_allowed | ★★ |
| `AssessmentAttempt` model | FK Assessment + FK User, score, passed, answers (JSON), started_at, completed_at | ★★ |
| `Badge` model | name, description, icon, criteria (JSON), skill (FK) | ★★ |
| `UserBadge` model | FK User + FK Badge, earned_at, is_displayed | ★★ |
| `LearningPath` model | name, description, courses (ordered list), career_target, duration_estimate | ★★ |
| Course recommendation | Algorithm: from skill gap analysis → recommend courses | ★★★ |
| LinkedIn Learning import | OAuth import of completed courses as verified achievements | ★★ |
| Certificate generation | PDF certificate with QR verification code | ★★ |

### K.2 Frontend — Learning (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Course catalog | Grid with category filter, difficulty filter, search, featured courses | 6h |
| Course detail | Video player (embedded), curriculum, instructor, enrollment button | 6h |
| Video player | Progress tracking, speed control, transcripts (AR + EN), fullscreen | 8h |
| Assessment UI | Timed quiz with progress bar, question navigator, result screen | 6h |
| Learning paths | Curated roadmaps: "Become a Full-Stack Developer" etc. | 4h |
| Badge showcase | Profile badge section, share badge to feed, social media | 3h |
| Skill assessments | Timed tests with difficulty levels, instant scoring, badge award | 6h |
| Career path visualizer | Interactive SVG career map: Junior → Senior → Lead → Manager | 4h |
| Recommendation widget | "Based on your skill gaps" — course suggestions on dashboard | 3h |

---

## Phase L: Monetization & Economy (Weeks 16-19)

### L.1 Backend — Payments & Economy
| Model/View | Details | Priority |
|------------|---------|----------|
| `JobCredit` model | FK CompanyProfile, credits_remaining, purchases (JSON history), expiry_date | ★★★ |
| `Connects` model | FK User, balance, monthly_free_allotment, purchases | ★★★ |
| `Transaction` model | FK User, amount, type (purchase/refund/commission/payout), gateway, status, reference_id | ★★★ |
| `Subscription` model | FK User, plan_type (recruiter_monthly/recruiter_yearly/premium_monthly/etc.), start, end, status, stripe_subscription_id | ★★★ |
| `FeaturedListing` model | FK JobPost or CompanyProfile, start, end, amount_paid, is_active | ★★★ |
| `InMailCredit` model | FK User, balance, purchases | ★★ |
| `BoostToken` model | FK User, balance, used_for boosting posts/jobs | ★★ |
| Pricing tier CRUD | Admin endpoint to configure prices per market (LYD/USD/EUR) | ★★ |
| Stripe Billing integration | Subscription creation, management portal, invoice generation | ★★★ |
| Receipt/invoice engine | Auto-generate PDF receipts for all purchases | ★★ |

### L.2 Frontend — Monetization (Web + Mobile)
| Page | Features | Effort |
|------|----------|--------|
| Pricing page | Tiered plans: Free, Basic, Pro, Enterprise — feature comparison table | 6h |
| Checkout flow | Select plan/credits, enter payment details, Stripe Elements, confirm | 8h |
| Subscription management | Current plan, usage stats, upgrade/downgrade/cancel, payment history | 6h |
| Credit purchasing | Job credit packs, connects packs, inmail packs — buy with one click | 4h |
| Featured job promotion | Select job, duration, pay, see promotion on search results | 4h |
| Wallet page | Balance, transaction log, withdrawal methods, pending clearance | 6h |
| Invoice history | Downloadable PDF invoices for all transactions | 3h |
| Admin pricing config | Set prices per region, currency conversion, discount codes | 4h |
| Usage analytics (employer) | Credits used, connects used, featured days remaining, ROI metrics | 4h |

---

## Phase M: MENA Localization & Compliance (Weeks 18-20)

### M.1 Backend — Localization
| Task | Details | Priority |
|------|---------|----------|
| Hijri calendar support | HijriDateField, convert Gregorian ↔ Hijri in UI, Ramadan detection | ★★★ |
| Multi-currency engine | Exchange rate model + periodic fetch from API, auto-conversion | ★★★ |
| Country-specific validation | Phone number validation per country, ID format validation (National ID, Iqama, Civil ID) | ★★★ |
| Address format per country | Libya, Egypt, KSA, UAE, Tunisia, Algeria, Morocco, Jordan models | ★★ |
| Labour law content | Per-country articles: end of service, probation, notice period, annual leave | ★★ |
| Gratuity calculator | KSA/UAE end-of-service benefit calculation based on years + salary | ★★ |
| Tax calculator | Income tax, social insurance per country | ★★ |
| Visa information | Work visa types per country, sponsorship requirements | ★★ |
| Saudization/Nitaqat | Compliance indicators, color bands for KSA companies | ★★ |
| Emiratization | Compliance indicators for UAE companies | ★★ |
| PDPL (KSA) compliance | Data retention policies, consent records, right to erasure workflow | ★★★ |
| GDPR (EU/Tunisia) compliance | Data portability, consent audit log, DSR request management | ★★★ |
| Libyan data protection | Law No. 5 of 2021 compliance: consent, purpose limitation, retention | ★★★ |

### M.2 Frontend — Localization (Web + Mobile)
| Task | Details | Effort |
|------|---------|--------|
| Hijri date picker | Custom calendar component supporting both Hijri/Gregorian | 6h |
| Country selector | Phone country code picker with validation per country | 4h |
| Currency switcher | Display amounts in user's preferred currency, auto-convert | 4h |
| Address forms | Dynamic per-country address field layouts | 4h |
| Labour law guides | Per-country page with searchable FAQ sections | 6h |
| End of service calculator | Input: country, salary, years, reason → output: gratuity amount breakdown | 4h |
| Tax calculator | Input: country, income, deductions → output: tax + insurance | 4h |
| Regional compliance banners | Cookie consent (GDPR), data processing consent (PDPL) | 3h |
| Dialect support | UI toggle for Egyptian/Levantine/Gulf/Maghrebi Arabic terms | 3h |
| Ramadan mode | Adjusted work hours display, prayer time breaks in scheduling | 2h |
| Local holidays | Calendar integration with per-country public holidays | 3h |

---

## Phase N: DevOps & Infrastructure (Ongoing, Weeks 1-20)

### N.1 Backend Infrastructure
| Task | Details | Priority |
|------|---------|--------|
| Staging environment | Full staging infrastructure with sanitized production-like data | ★★★ |
| Docker Compose prod | Production docker-compose with nginx, PostgreSQL, Redis, ES | ★★★ |
| CI/CD pipeline | GitHub Actions: lint → test (pytest) → build → migrate → deploy | ★★★ |
| Database backup | Automated daily pg_dump + point-in-time recovery | ★★★ |
| Sentry error tracking | Django + Frontend error reporting | ★★★ |
| Load testing | k6/locust scripts: 10K concurrent users, <2s response time p95 | ★★★ |
| Performance budget | API <200ms p95, page load <2s, Lighthouse score >85 | ★★★ |
| CDN setup | Cloudflare or AWS CloudFront for static/media | ★★ |
| Email delivery | SendGrid + Mailgun dual provider with failover | ★★★ |
| SMS delivery | Twilio + local provider per country | ★★★ |
| Redis caching | Multi-tier: session, API response cache, view cache | ★★★ |
| Elasticsearch scaling | Cluster with sharding for search performance | ★★★ |
| Database connection pooling | PgBouncer for PostgreSQL connection management | ★★★ |
| OpenTelemetry + Grafana | Distributed tracing, metrics, logs in one dashboard | ★★ |
| Uptime monitoring | Pingdom / Better Uptime for critical endpoints | ★★★ |

### N.2 Mobile Infrastructure (React Native + Expo)
| Task | Details | Effort |
|------|---------|--------|
| EAS Build setup | Configure eas.json for dev/preview/production profiles | 4h |
| EAS Submit | Auto-submit to App Store Connect + Google Play Console | 2h |
| Expo project init | `create-expo-app`, configure app.json for both stores | 2h |
| Firebase project | FCM push notifications, Crashlytics, Analytics, Remote Config | 4h |
| Code signing | Apple Developer certificate + Android keystore via EAS | 2h |
| App store metadata | Screenshots, descriptions (AR + EN), keywords, category | 4h |
| TestFlight beta | Internal + external testing group via EAS Submit | 2h |
| Google Play beta | Closed track testing + staged rollout via EAS Submit | 2h |
| expo-updates OTA | Push JS updates without app store review | 2h |
| Performance monitoring | Sentry + Firebase Performance for React Native | 2h |

### N.3 API & Developer Platform
| Task | Details | Priority |
|------|---------|--------|
| Public REST API docs | drf-spectacular + Swagger/Redoc for all public endpoints | ★★★ |
| API key management | Generate/revoke/scope keys per organization | ★★★ |
| Rate limiting per tier | Configure limits per endpoint per user type | ★★★ |
| Webhooks | Event-based callbacks: new application, status change, payment | ★★★ |
| OAuth2 provider | Allow companies to SSO into the platform | ★★ |
| Zapier integration | Connect to 3000+ apps via public API | ★★ |
| ATS integrations | Sync with Greenhouse, Lever, Workable, Breezy | ★★ |
| HRIS integrations | Sync hires with BambooHR, Personio, Odoo | ★★ |
| Slack integration | Notifications for new applicants, interview reminders | ★★ |

---

## Phase M: Mobile App — Full Parallel Build (Weeks 1-20)

The mobile app is built in parallel with web features. Each web phase has a corresponding mobile phase that maps the same feature set to native mobile patterns.

### M.1 Feature Mapping

| Feature | Web Status | Mobile Status | Shared Code |
|---------|-----------|---------------|-------------|
| Auth (login/register/reset) | ✅ Done | → M1 | 100% types + API + store |
| Graduate profile CRUD | ✅ Done | → M2 | 100% types + API |
| Job browsing + apply | ✅ Done | → M2 | 100% types + API |
| Search + filters | ✅ Done | → M2 | 100% types + API |
| Messaging + chat | ✅ Done | → M2 | 100% WebSocket + store |
| Social feed | ✅ Done | → M2 | 100% types + API |
| Company reviews | ✅ Done | → M3 | 100% types + API |
| Pipeline kanban | ✅ Done | → M3 | 100% types + API |
| Admin dashboard | ✅ Done | → M4 | 100% API |
| Institution portal | Phase B | → Parallel | 100% API |
| Events + groups | Phase E | → Parallel | 100% API |
| Freelance marketplace | Phase I | → Parallel | 100% API |
| Learning platform | Phase K | → Parallel | 100% API |
| Monetization | Phase L | → Parallel | 100% API + store |

### M.2 Mobile-Native Optimizations

| Feature | Implementation | Library |
|---------|---------------|---------|
| Bottom navigation | Role-aware tabs with animated icons + badge counts | expo-router + reanimated |
| Pull-to-refresh | Custom spring indicator with gradient arc | reanimated + skia |
| Swipe actions | Swipe to save/delete/archive on list items | gesture-handler + reanimated |
| Haptic feedback | On reactions, follow, send, complete, error | expo-haptics |
| Camera integration | Profile photo, ID verification, portfolio images | expo-camera + expo-image-picker |
| QR code scanner | Scan profile QR codes at events | expo-camera |
| Document scanner | Scan certificates, CVs via phone camera | expo-camera + expo-image-manipulator |
| Dark mode | Respect system setting + manual toggle (shared Zustand store) | themeStore (shared) |
| Offline-first | AsyncStorage cache for feed, messages, profile, jobs | @react-native-async-storage |
| Push notifications | FCM for new messages, applications, interviews, offers | expo-notifications |
| Deep linking | Open app directly to profile/job/message from notification | expo-linking |
| Background fetch | Sync notifications, messages every 15 min | expo-background-fetch |
| Biometric auth | Fingerprint / Face ID for app lock | expo-local-authentication |
| Share sheet | Native share for profiles, jobs, posts | react-native-share |
| Image cache | Blurhash placeholder → crossfade to cached image | expo-image |
| Maps | Company locations, event venues | react-native-maps |

---

## Resource Estimates

| Phase | Weeks | Backend (days) | Web Frontend (days) | Mobile React Native (days) | Total (person-weeks) |
|-------|-------|---------------|-------------------|---------------------------|---------------------|
| A: Mobile Foundation | 1-3 | — | — | 10 | 2 |
| B: Institution Portal | 2-4 | 5 | 8 | 5 | 3.6 |
| C: Admin Super-Dashboard | 3-5 | 5 | 10 | 6 | 4.2 |
| D: Networking Suite | 4-7 | 8 | 10 | 6 | 4.8 |
| E: Events & Groups | 5-7 | 5 | 8 | 5 | 3.6 |
| F: Public Profiles & SEO | 6-8 | 3 | 6 | — | 1.8 |
| G: Offer Management | 7-9 | 4 | 6 | 4 | 2.8 |
| H: PWA & Offline | 8-9 | — | 4 | 4 | 1.6 |
| I: Freelance Marketplace | 9-14 | 15 | 15 | 10 | 8 |
| J: Company Intelligence | 12-15 | 5 | 8 | 4 | 3.4 |
| K: Skill Development | 14-18 | 8 | 10 | 6 | 4.8 |
| L: Monetization | 16-19 | 8 | 8 | 5 | 4.2 |
| M: MENA Localization | 18-20 | 5 | 5 | 3 | 2.6 |
| N: DevOps | 1-20 | 10 | 3 | 3 | 3.2 |
| **Totals** | **20 weeks** | **81 days** | **101 days** | **71 days** | **~50 person-weeks** |

**Timeline: 5 months to feature-complete MVP on web + mobile. Mobile finishes ~4 weeks after web per phase due to shared code reuse — no need to build the data layer twice.**

---

## Execution Order

```
Month 1:  M0(Mobile Foundation) + B(Institution) + C(Admin)
Month 2:  D(Networking) + E(Events) + F(Public Profiles) + M2(Graduate Mobile)
Month 3:  G(Offers) + H(PWA) + M3(Employer Mobile) + start I(Freelance)
Month 4:  I(Freelance cont.) + J(Company Intelligence) + L(Monetization start) + M4(Admin Mobile)
Month 5:  K(Learning) + L(Monetization) + M(Localization) + M5(Cross-cutting Mobile) + M6(Polish + Launch)
```

Mobile runs ~2 weeks behind web per phase. Shared TypeScript means each mobile feature takes ~40% less time than the web equivalent — the data layer already exists.

---

## Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Freelance marketplace scope creep | High | High | Build MVP first: project listing + proposals + escrow; defer disputes, time tracker |
| Stripe Connect integration complexity | Medium | High | Use Stripe Connect + payment intents; use well-maintained RN Stripe SDK |
| Expo managed workflow limitations | Low | Medium | EAS Build supports custom native modules; eject to bare workflow if needed |
| App store rejection (Apple) | Medium | High | Follow HIG guidelines, avoid web views, test on real device via TestFlight |
| Arabic NLP for feed algorithm | Medium | Medium | Start with simple recency + reactions; add NLP in v2 |
| Expo SDK version lag | Low | Medium | Stick to stable SDK releases; avoid bleeding-edge features |
| Libyan payment gateway integration | High | Medium | Use PayTabs as primary MENA gateway; Stripe as global fallback |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|------------|
| Backend test coverage | >85% | pytest-cov report |
| API response time (p95) | <200ms | Grafana + Sentry |
| Web page load time | <2s | Lighthouse |
| Mobile app cold start | <3s | Firebase Performance |
| App store rating | >4.0 | Google Play + App Store |
| Time to app store approval | <3 days | Proper metadata + no policy violations |
| Crash-free rate | >99.5% | Crashlytics + Sentry |
| User retention (30-day) | >40% | Analytics event tracking |
| F → A conversion rate | >5% | Funnel tracking |

---

*This plan covers ~200 features across 14 phases + 6 mobile sub-phases, estimated at ~50 person-weeks over 5 months. ~60% of mobile code is shared directly from the existing web frontend.*

*Last updated: June 3, 2026*
