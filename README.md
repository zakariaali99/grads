# 🎓 خريجون (Jreejoon)

## منصة التوظيف والتوثيق للخريجين التقنيين

**Jreejoon** is an enterprise-grade Arabic recruitment and graduate verification platform that connects technical graduates with employers, educational institutions, and platform administrators. Built with a modern tech stack and RTL-first Arabic design, it serves as a trusted national digital ecosystem for technical recruitment.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

1. [Project Vision](#-project-vision)
2. [System Architecture](#-system-architecture)
3. [Technology Stack](#-technology-stack)
4. [User Roles](#-user-roles)
5. [Features](#-features)
6. [Database Schema](#-database-schema)
7. [API Documentation](#-api-documentation)
8. [Frontend Components](#-frontend-components)
9. [Security](#-security)
10. [AI Modules](#-ai-modules)
11. [Installation Guide](#-installation-guide)
12. [Deployment Guide](#-deployment-guide)
13. [Project Structure](#-project-structure)
14. [Environment Variables](#-environment-variables)
15. [Contributing](#-contributing)

---

## 🎯 Project Vision

Build a modern digital ecosystem that bridges the gap between technical education outputs and labor market needs. The platform helps graduates professionally showcase their skills, helps companies discover qualified candidates quickly, digitizes graduate records, provides intelligent hiring tools, and offers analytics and labor market insights.

### Core Values
- **Professional** — Enterprise-grade quality and design
- **Trustworthy** — Verified graduate identities and company profiles
- **Efficient** — Smart matching, AI-powered recommendations
- **Scalable** — Built to serve tens of thousands of users
- **Arabic-First** — Full RTL support with Arabic language interface

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                        │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │   Next.js App    │  │   PWA Ready    │  │  Mobile RTL  │  │
│  │  (TypeScript)    │  │  (Offline)     │  │  (Responsive)│  │
│  └────────┬────────┘  └────────┬───────┘  └─────────────┘  │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            │    HTTPS/WS        │
└───────────┼────────────────────┼────────────────────────────┘
│  ┌────────┴────────────────────┴────────────────────────┐   │
│  │                    API GATEWAY                       │   │
│  │                  Nginx + Gunicorn                    │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │                   DJANGO BACKEND                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │ REST API  │ │ WebSocket│ │  Celery  │ │  ASGI   │ │   │
│  │  │  (DRF)   │ │ (Channels)│ │ Workers  │ │ (Daphne)│ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────┼────────────────────────────┐   │
│  │         ┌──────────────┴──────────────┐             │   │
│  │         │         SERVICES            │             │   │
│  │  ┌──────┴──────┐ ┌──────┴──────┐ ┌────┴──────┐      │   │
│  │  │  PostgreSQL  │ │    Redis    │ │Elasticsearch│     │   │
│  │  │   (Primary)  │ │(Cache/Queue)│ │  (Search)   │     │   │
│  │  └─────────────┘ └─────────────┘ └────────────┘      │   │
│  │         ┌──────────────┬──────────────┐              │   │
│  │  ┌──────┴──────┐ ┌──────┴──────┐ ┌────┴──────┐      │   │
│  │  │   MinIO/S3  │ │   Sentry    │ │Prometheus/│      │   │
│  │  │   (Files)   │ │  (Errors)   │ │  Grafana  │      │   │
│  │  └─────────────┘ └─────────────┘ └────────────┘      │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Client → API Gateway**: HTTPS requests from Next.js to Nginx
2. **Nginx → Django**: Reverse proxy to Gunicorn (HTTP) / Daphne (WS)
3. **Django → Services**: PostgreSQL for data, Redis for cache/queue, Elasticsearch for search
4. **Async Tasks**: Celery workers handle CV parsing, notifications, analytics
5. **Real-time**: WebSocket connections via Django Channels for chat and notifications

---

## 💻 Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 4.2 | Web framework |
| Django REST Framework | 3.15 | REST API |
| Django Channels | 4.2 | WebSockets (real-time) |
| PostgreSQL | 16 | Primary database |
| Redis | 7 | Cache, session, broker |
| Celery | 5.4 | Async task queue |
| Elasticsearch | 8.x | Full-text search |
| Gunicorn | 23.x | WSGI server |
| Daphne | 4.x | ASGI server (WebSockets) |
| JWT (SimpleJWT) | 5.x | Authentication |
| Sentry | Latest | Error monitoring |
| MinIO / S3 | - | File storage |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | React framework |
| TypeScript | 5.4 | Type safety |
| TailwindCSS | 3.4 | Utility-first CSS |
| Framer Motion | 11 | Animations |
| Zustand | 4 | State management |
| React Query | 5 | Server state |
| Recharts | 2 | Charts & analytics |
| React Hook Form | 7 | Form management |
| Zod | 3 | Schema validation |
| Sonner | 1 | Toast notifications |

---

## 👥 User Roles

### A) Graduate (خريج)
Technical college graduates seeking employment opportunities.

### B) Employer / Company (صاحب عمل)
Companies and organizations looking to hire technical talent.

### C) Administrator (مدير)
Platform administrators with full system control.

### D) Educational Institution (مؤسسة تعليمية) - *Advanced*
Colleges and universities tracking graduate outcomes.

---

## ✨ Features

### Graduate Portal
- **Profile Management**: Professional profile with headline, bio, skills, education, certifications, experience, projects
- **CV Management**: Upload multiple CVs (Arabic/English), PDF parsing, AI skill extraction
- **Skills Dashboard**: Skill analysis, demand metrics, suggested skills
- **Job Discovery**: Smart recommendations, advanced search, saved jobs
- **Application Tracking**: Real-time status updates, interview scheduling
- **Analytics**: Profile views, search appearances, employer interactions
- **Messaging**: Real-time chat with employers
- **Verification**: Identity verification with verification badge

### Employer Portal
- **Company Profile**: Detailed company page with industry, size, location
- **HR Team**: Multi-user account management with role-based access
- **Job Management**: Full CRUD, draft/publish/close, featured/urgent flags
- **Candidate Search**: Advanced filtering, PDF keyword search, Elasticsearch
- **AI Rankings**: Smart candidate ranking based on skill match scores
- **Recruitment Pipeline**: Application status management, shortlisting
- **Interview Scheduling**: Calendar management, notifications
- **Analytics**: Job performance, application funnel, skill demand reports

### Admin Panel
- **Dashboard**: System-wide analytics with real-time metrics
- **User Management**: Full CRUD, ban/unban, verification workflows
- **Verification System**: Graduate and company verification workflows
- **Content Moderation**: Review reports, manage categories
- **Fraud Detection**: Automated duplicate account and fake profile detection
- **Platform Management**: Colleges, skills, job categories, announcements
- **Security**: Audit logs, IP tracking, device monitoring
- **Reports**: Exportable PDF/Excel reports

### Analytics & Reporting
- **Admin Analytics**: Registration trends, growth metrics, city/college distributions
- **Employer Analytics**: Hiring funnel, job performance, candidate quality
- **Graduate Analytics**: Profile visibility, application stats, skill gap analysis
- **Export**: PDF and Excel export for all reports
- **Real-time**: Live dashboard updates via WebSockets

---

## 🗄 Database Schema

### Entity Relationship Summary

```
User (AbstractUser)
├── GraduateProfile (1:1)
│   ├── Education (1:N)
│   ├── Certification (1:N)
│   ├── Experience (1:N)
│   ├── Project (1:N)
│   ├── CV (1:N)
│   ├── Skill (M:N) → GraduateSkill (through)
│   └── ProfileView (1:N)
├── CompanyProfile (1:1)
│   ├── HRTeamMember (1:N)
│   ├── CompanyReview (1:N)
│   ├── JobPost (1:N)
│   │   ├── JobApplication (1:N)
│   │   │   └── Interview (1:N)
│   │   ├── Skill (M:N)
│   │   └── SavedJob (1:N)
│   └── JobCategory (N:1)
├── VerificationCode (1:N)
├── AuditLog (1:N)
├── LoginAttempt (1:N)
├── Notification (1:N)
├── Conversation (M:N)
│   └── Message (1:N)
└── SavedGraduate (1:N)
```

### Key Models

**User** — Core user with JWT auth, supports multiple types (graduate/employer/admin/institution), includes verification status, 2FA flag, device tracking, profile completion percentage.

**GraduateProfile** — Extended profile for graduates with college affiliation, graduation year, GPA, skills, work availability, social links, analytics counters (views, search appearances, employer interactions).

**CompanyProfile** — Company details with commercial registration, industry, size, location, verification status, job/hire counters.

**JobPost** — Full job listing with employment type, experience level, salary range, skills requirements, targeted colleges, status workflow (draft → active → paused/closed/filled).

**JobApplication** — Tracks applications with status pipeline (pending → reviewed → shortlisted → interview → accepted/rejected), AI match score.

**Skill & SkillCategory** — Hierarchical skills using MPTT (Modified Preorder Tree Traversal) with Arabic/English names, demand scoring.

---

## 📚 API Documentation

### Authentication
All API endpoints (except registration and login) require JWT authentication via `Authorization: Bearer <token>` header.

```
POST   /api/v1/auth/register/         - Register new user
POST   /api/v1/auth/login/            - Login (returns JWT tokens)
POST   /api/v1/auth/refresh/          - Refresh access token
POST   /api/v1/auth/logout/           - Blacklist refresh token
GET    /api/v1/auth/profile/          - Get user profile
PATCH  /api/v1/auth/profile/          - Update profile
POST   /api/v1/auth/change-password/  - Change password
POST   /api/v1/auth/verify/request/   - Request verification code
POST   /api/v1/auth/verify/confirm/   - Confirm verification code
POST   /api/v1/auth/password-reset/   - Request password reset
POST   /api/v1/auth/password-reset/confirm/ - Confirm password reset
```

### Graduates
```
GET    /api/v1/graduates/profiles/         - List graduates
GET    /api/v1/graduates/profiles/{id}/    - Graduate detail
PATCH  /api/v1/graduates/profiles/{id}/    - Update profile
POST   /api/v1/graduates/profiles/{id}/add_skill/    - Add skill
POST   /api/v1/graduates/education/        - CRUD education
POST   /api/v1/graduates/certifications/   - CRUD certifications
POST   /api/v1/graduates/experience/       - CRUD experience
POST   /api/v1/graduates/projects/         - CRUD projects
POST   /api/v1/graduates/cvs/             - CRUD CVs
GET    /api/v1/graduates/skills/           - List skills
GET    /api/v1/graduates/colleges/         - List colleges
GET    /api/v1/graduates/saved/            - Saved graduates (employer)
```

### Employers
```
GET    /api/v1/employers/companies/         - List companies
GET    /api/v1/employers/companies/{id}/    - Company detail
PATCH  /api/v1/employers/companies/{id}/    - Update company
POST   /api/v1/employers/companies/{id}/add_hr_member/ - Add HR member
GET    /api/v1/employers/industries/        - List industries
POST   /api/v1/employers/reviews/          - Company reviews
```

### Jobs
```
GET    /api/v1/jobs/posts/                 - List jobs
GET    /api/v1/jobs/posts/{id}/            - Job detail
POST   /api/v1/jobs/posts/                 - Create job (employer)
POST   /api/v1/jobs/posts/{id}/publish/    - Publish job
POST   /api/v1/jobs/posts/{id}/apply/      - Apply to job (graduate)
GET    /api/v1/jobs/posts/{id}/applications/ - List applications (employer)
POST   /api/v1/jobs/applications/{id}/update_status/ - Update status
POST   /api/v1/jobs/interviews/            - Schedule interview
GET    /api/v1/jobs/categories/            - List categories
GET    /api/v1/jobs/saved/                 - Saved jobs
```

### Analytics
```
GET    /api/v1/analytics/admin/            - Admin system analytics
GET    /api/v1/analytics/employer/         - Employer dashboard analytics
GET    /api/v1/analytics/graduate/         - Graduate personal analytics
```

### AI Features
```
POST   /api/v1/ai/parse-cv/               - Parse CV and extract data
GET    /api/v1/ai/rank-candidates/{job_id}/ - Rank candidates by match score
GET    /api/v1/ai/job-recommendations/     - Job recommendations (graduate)
GET    /api/v1/ai/graduate-recommendations/{job_id}/ - Graduate recommendations (employer)
GET    /api/v1/ai/fraud-check/             - Check for fake profile flags
GET    /api/v1/ai/skill-analysis/          - Skill gap analysis
```

### Search & Real-time
```
POST   /api/v1/search/global/     - Global search (graduates, jobs, companies)
WS     /ws/notifications/         - Real-time notifications
WS     /ws/chat/                  - Real-time messaging
```

### API Documentation Endpoints
```
GET    /api/schema/       - OpenAPI schema (JSON)
GET    /api/docs/         - Swagger UI
GET    /api/redoc/        - ReDoc UI
```

---

## 🎨 Frontend Components

### Design System
- **RTL-First**: Full right-to-left support with Arabic typography
- **Dark/Light Mode**: System-aware with manual toggle
- **Color Palette**:
  - Light: White, soft gray, navy blue, cyan accents
  - Dark: Dark navy, black gradients, cyan highlights, glassmorphism
- **Typography**: Tajawal font family
- **Components**: Cards, badges, buttons, inputs, stats, charts

### Pages

#### Public
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, stats |
| Login | `/login` | Authentication form |
| Register | `/register` | 2-step registration (type selection + details) |
| Forgot Password | `/forgot-password` | Password reset flow |

#### Graduate Dashboard
| Page | Route | Description |
|------|-------|-------------|
| Home | `/graduate` | Stats, skill analysis, job recommendations |
| Profile | `/graduate/profile` | Full profile management |
| Jobs | `/graduate/jobs` | Job search and discovery |
| Applications | `/graduate/applications` | Application tracking |
| Interviews | `/graduate/interviews` | Interview management |
| Messages | `/graduate/messages` | Chat with employers |
| Analytics | `/graduate/analytics` | Personal analytics |

#### Employer Dashboard
| Page | Route | Description |
|------|-------|-------------|
| Home | `/employer` | Overview stats, recent applicants, active jobs |
| Company | `/employer/company` | Company profile management |
| Jobs | `/employer/jobs` | Job post management |
| Candidates | `/employer/candidates` | Candidate search and ranking |
| Interviews | `/employer/interviews` | Interview scheduling |
| Messages | `/employer/messages` | Chat with candidates |
| Analytics | `/employer/analytics` | Hiring and recruitment analytics |

#### Admin Dashboard
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | System-wide analytics overview |
| Users | `/admin/users` | User management |
| Graduates | `/admin/graduates` | Graduate management |
| Companies | `/admin/companies` | Company management |
| Jobs | `/admin/jobs` | Job management |
| Verifications | `/admin/verifications` | Verification workflows |
| Reports | `/admin/reports` | System reports |
| Settings | `/admin/settings` | Platform settings |

---

## 🔒 Security

### Authentication & Authorization
- **JWT Authentication**: Access + refresh tokens with automatic rotation
- **RBAC**: Role-based access control (graduate/employer/admin)
- **Permission Classes**: IsAdminUser, IsEmployer, IsGraduate, IsOwnerOrAdmin, IsVerified
- **Rate Limiting**: 100 req/hour for anonymous, 1000 req/hour for authenticated
- **Password Validation**: 8+ characters, uppercase, lowercase, number

### Data Protection
- **CSRF**: Cross-Site Request Forgery protection enabled
- **XSS**: Content-Type nosniff, XSS filter enabled
- **SQL Injection**: Django ORM with parameterized queries
- **File Validation**: Secure file upload validation
- **Sensitive Data**: Encrypted in transit (HTTPS) and at rest

### Monitoring
- **Audit Logs**: All non-GET API requests logged with user, action, IP, user-agent
- **Device Tracking**: Last IP and device per user
- **Login Attempts**: Track failed/successful logins
- **IP Monitoring**: Suspicious activity detection

### Verification
- **Email Verification**: OTP-based email confirmation
- **Phone Verification**: OTP-based phone confirmation (extensible)
- **Account Verification**: Admin verification workflow for graduates and companies
- **2FA Support**: Two-factor authentication ready (extensible)

---

## 🤖 AI Modules

### CV Parser (`apps/ai/cv_parser.py`)
- **PDF Extraction**: Uses pdfplumber + PyPDF2 fallback
- **Skill Extraction**: Matches extracted text against known skills database
- **Entity Extraction**: Name, email, phone, education history, experience
- **Arabic Support**: Full Arabic text parsing and extraction

### Recommendation Engine (`apps/ai/recommendations.py`)
- **Job Matching**: Recommends jobs to graduates based on skills, location, major
- **Candidate Ranking**: Ranks candidates for jobs using weighted scoring (60% skills, 20% location, 20% experience)
- **Skill Gap Analysis**: Identifies missing skills between graduate profile and job requirements
- **Match Score**: 0-100% compatibility scoring

### Fraud Detection (`apps/ai/recommendations.py`)
- **Duplicate Account**: Detects accounts sharing email, phone, or IP
- **Fake Profile**: Flags profiles with incomplete data, missing verification, no skills/education
- **Confidence Scoring**: 0-100% confidence level with detailed flags

### Background Tasks (`apps/ai/tasks.py`)
- **Async CV Parsing**: Celery task for non-blocking PDF parsing
- **Batch Match Scoring**: Calculate match scores for all applications in bulk
- **Daily Statistics**: Automated daily analytics aggregation
- **Fraud Sweep**: Periodic automated fraud checking

---

## 📦 Installation Guide

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ (or SQLite for development)
- Redis 6+ (optional for development with in-memory fallback)
- Elasticsearch 8.x (optional for development)

### Quick Start (Development)

```bash
# 1. Clone the repository
git clone <repository-url>
cd graduators

# 2. Backend setup
cd backend
pip install -r requirements/dev-compat.txt

# 3. Configure environment
cp ../.env.example ../.env
# Edit .env with your settings

# 4. Run migrations
python manage.py migrate --settings=config.settings.development

# 5. Create admin user
python manage.py createsuperuser --settings=config.settings.development

# 6. Start backend
python manage.py runserver 0.0.0.0:8000 --settings=config.settings.development

# 7. Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# 8. Access the platform
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1/
# Admin Panel: http://localhost:8000/admin/
# API Docs: http://localhost:8000/api/docs/
```

### Docker Setup (Production-like)

```bash
# 1. Start all services
docker compose up -d

# 2. Run migrations
docker compose exec backend python manage.py migrate

# 3. Create admin user
docker compose exec backend python manage.py createsuperuser

# 4. Access the platform
# Frontend: http://localhost:3000
# Backend API: http://localhost:80/api/v1/
```

---

## 🚀 Deployment Guide

### Production Checklist

1. **Security**
   - Set strong `DJANGO_SECRET_KEY`
   - Enable HTTPS with SSL certificate
   - Set `DEBUG=False`
   - Configure `ALLOWED_HOSTS`
   - Enable CSRF trusted origins

2. **Database**
   - Use PostgreSQL (not SQLite)
   - Set up automated backups
   - Configure connection pooling

3. **Storage**
   - Configure S3/MinIO for file storage
   - Set up CDN for static/media files

4. **Monitoring**
   - Configure Sentry for error tracking
   - Set up Prometheus + Grafana for metrics
   - Configure logging and alerts

5. **Performance**
   - Enable Redis caching
   - Configure Celery workers
   - Set up Elasticsearch for search
   - Enable CDN caching

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name jreejoon.ly;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name jreejoon.ly;

    ssl_certificate /etc/ssl/certs/jreejoon.crt;
    ssl_certificate_key /etc/ssl/private/jreejoon.key;

    location /static/ { alias /static/; }
    location /media/ { alias /media/; }
    location /api/ { proxy_pass http://backend:8000; }
    location /ws/ { proxy_pass http://backend:8000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location / { proxy_pass http://frontend:3000; }
}
```

### CI/CD Pipeline (GitHub Actions)
The repository includes a CI/CD pipeline that:
1. Lints backend (flake8, black)
2. Lints frontend (next lint)
3. Runs Django tests
4. Builds Docker images
5. Deploys to production (configurable)

---

## 📁 Project Structure

```
graduators/
├── backend/                          # Django backend
│   ├── config/                       # Django project configuration
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Shared settings
│   │   │   ├── development.py       # Dev settings (SQLite, debug)
│   │   │   └── production.py        # Production settings (PostgreSQL, S3)
│   │   ├── __init__.py
│   │   ├── asgi.py                  # ASGI config (WebSockets)
│   │   ├── celery.py                # Celery config
│   │   ├── urls.py                  # Main URL routing
│   │   └── wsgi.py                  # WSGI config
│   ├── apps/                        # Django applications
│   │   ├── accounts/                # Auth, users, roles, permissions
│   │   │   ├── models.py            # User, VerificationCode, AuditLog
│   │   │   ├── serializers.py       # Auth serializers
│   │   │   ├── views.py             # Register, Login, Profile, Verify
│   │   │   ├── urls.py              # Auth endpoints
│   │   │   ├── permissions.py       # RBAC permission classes
│   │   │   ├── middleware.py        # Audit, device tracking
│   │   │   ├── validators.py        # Password validators
│   │   │   ├── utils.py             # Verification, profile completion
│   │   │   ├── signals.py           # Auto-create profiles
│   │   │   └── admin.py             # Admin configuration
│   │   ├── graduates/               # Graduate profiles, CVs, skills
│   │   │   ├── models.py            # GraduateProfile, Skill, CV, etc.
│   │   │   ├── serializers.py       # Graduate serializers
│   │   │   ├── views.py             # CRUD + search + saved
│   │   │   ├── urls.py              # Graduate endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── employers/               # Company profiles, HR teams
│   │   │   ├── models.py            # CompanyProfile, Industry, HRTeam
│   │   │   ├── serializers.py       # Company serializers
│   │   │   ├── views.py             # CRUD + HR management
│   │   │   ├── urls.py              # Employer endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── jobs/                    # Job posts, applications, interviews
│   │   │   ├── models.py            # JobPost, Application, Interview
│   │   │   ├── serializers.py       # Job serializers
│   │   │   ├── views.py             # CRUD + apply + pipeline
│   │   │   ├── urls.py              # Job endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── analytics/               # Reporting and dashboards
│   │   │   ├── models.py            # DailyStat, StatSummary
│   │   │   ├── views.py             # Admin/Employer/Graduate analytics
│   │   │   ├── urls.py              # Analytics endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── notifications/           # Real-time notifications
│   │   │   ├── models.py            # Notification, Announcement
│   │   │   ├── consumers.py         # WebSocket consumer
│   │   │   ├── routing.py           # WS routing
│   │   │   ├── views.py             # REST endpoints
│   │   │   ├── urls.py              # Notification endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── chat/                    # Real-time messaging
│   │   │   ├── models.py            # Conversation, Message
│   │   │   ├── consumers.py         # WebSocket consumer
│   │   │   ├── routing.py           # WS routing
│   │   │   ├── serializers.py       # Chat serializers
│   │   │   ├── views.py             # REST endpoints
│   │   │   ├── urls.py              # Chat endpoints
│   │   │   └── admin.py             # Admin configuration
│   │   ├── search/                  # Elasticsearch integration
│   │   │   ├── documents.py         # ES document definitions
│   │   │   ├── views.py             # Global search endpoint
│   │   │   └── urls.py              # Search endpoints
│   │   └── ai/                      # AI modules
│   │       ├── cv_parser.py         # PDF parsing and extraction
│   │       ├── recommendations.py   # Matching and fraud detection
│   │       ├── tasks.py             # Celery background tasks
│   │       ├── views.py             # AI API endpoints
│   │       └── urls.py              # AI endpoints
│   ├── requirements/
│   │   ├── base.txt                 # Production dependencies
│   │   └── dev-compat.txt           # Dev-compatible dependencies
│   ├── templates/                   # Django templates
│   ├── static/                      # Static files
│   ├── media/                       # Uploaded files
│   ├── locale/                      # Translation files
│   ├── manage.py                    # Django CLI
│   └── Dockerfile                   # Docker build
├── frontend/                        # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── layout.tsx           # Root layout (RTL)
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── login/page.tsx       # Login page
│   │   │   ├── register/page.tsx    # Registration page
│   │   │   ├── graduate/page.tsx    # Graduate dashboard
│   │   │   ├── employer/page.tsx    # Employer dashboard
│   │   │   └── admin/page.tsx       # Admin dashboard
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios client with JWT refresh
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── utils.ts             # Utility functions
│   │   ├── store/
│   │   │   ├── authStore.ts         # Zustand auth store
│   │   │   └── themeStore.ts        # Zustand theme store
│   │   └── styles/
│   │       └── globals.css          # TailwindCSS with design system
│   ├── public/                      # Static assets
│   ├── tailwind.config.ts           # TailwindCSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Dependencies
│   ├── Dockerfile                   # Multi-stage Docker build
│   └── postcss.config.js            # PostCSS configuration
├── nginx/
│   └── default.conf                 # Nginx configuration
├── docker-compose.yml               # Multi-service Docker setup
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── .github/workflows/ci.yml         # CI/CD pipeline
└── README.md                        # This file
```

---

## 🌍 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DJANGO_SECRET_KEY` | Django secret key | `change-me` | Yes |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts | `*` | Yes |
| `DEBUG` | Debug mode | `False` | Yes |
| `POSTGRES_DB` | Database name | `jreejoon` | Yes |
| `POSTGRES_USER` | Database user | `jreejoon` | Yes |
| `POSTGRES_PASSWORD` | Database password | `jreejoon` | Yes |
| `POSTGRES_HOST` | Database host | `localhost` | Yes |
| `POSTGRES_PORT` | Database port | `5432` | No |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` | Yes |
| `CELERY_BROKER_URL` | Celery broker | `redis://localhost:6379/1` | Yes |
| `ELASTICSEARCH_HOST` | ES host | `localhost:9200` | No |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` | Yes |
| `EMAIL_HOST` | SMTP host | - | For email |
| `EMAIL_HOST_USER` | SMTP user | - | For email |
| `EMAIL_HOST_PASSWORD` | SMTP password | - | For email |
| `AWS_ACCESS_KEY_ID` | S3 access key | - | For S3 |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | - | For S3 |
| `AWS_STORAGE_BUCKET_NAME` | S3 bucket | - | For S3 |
| `SENTRY_DSN` | Sentry DSN | - | For monitoring |
| `NEXT_PUBLIC_API_URL` | API URL (frontend) | `http://localhost:8000/api/v1` | Yes |
| `NEXT_PUBLIC_WS_URL` | WS URL (frontend) | `ws://localhost:8000/ws` | Yes |

---

## 🛠 Development Commands

```bash
# Backend
python manage.py runserver                          # Start dev server
python manage.py makemigrations                     # Create migrations
python manage.py migrate                            # Apply migrations
python manage.py createsuperuser                    # Create admin user
python manage.py shell                              # Django shell
python manage.py test                               # Run tests
python manage.py collectstatic                      # Collect static files
celery -A config worker -l info                     # Start Celery worker
celery -A config beat -l info                       # Start Celery beat

# Frontend
npm run dev                                         # Start dev server
npm run build                                       # Build for production
npm run lint                                        # Lint code
npm run start                                       # Start production server

# Docker
docker compose up -d                                # Start all services
docker compose down                                 # Stop all services
docker compose logs -f                              # View logs
docker compose exec backend python manage.py migrate # Run migrations in container
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Backend: Follow PEP 8, use black for formatting
- Frontend: Use ESLint and Prettier
- Arabic: All user-facing strings should be in Arabic
- RTL: Ensure all UI components support right-to-left layout

### Testing
- Backend: `python manage.py test`
- Frontend: `npm run test` (when configured)

---

## 📄 License

This project is proprietary software. All rights reserved.

© 2024 Jreejoon (خريجون). All rights reserved.

---

## 🙏 Acknowledgments

- **Django** & **Django REST Framework** for the powerful backend framework
- **Next.js** & **Vercel** for the modern React framework
- **TailwindCSS** for the utility-first CSS framework
- All open-source contributors whose libraries made this project possible

---

*Built with ❤️ for the Libyan technical community and the MENA region's digital future.*
