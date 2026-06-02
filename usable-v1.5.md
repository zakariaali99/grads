# v1.5 — إطلاق النسخة القابلة للاستخدام (Usable Release)

**التاريخ:** 21 مايو 2026

---

## ملخص التحديث

هذا الإصدار يحول المنصة من واجهة عرض (Prototype) إلى نظام متكامل قابل للاستخدام الفعلي. جميع الصفحات متصلة بواجهات API حقيقية مع تحسين شامل لواجهة المستخدم وإضافة نظام المواظبة (Streaks).

---

## التغييرات الأساسية

### 1. ربط جميع الصفحات بواجهات API الحقيقية

كل صفحة من صفحات المنصة الـ 26 أصبحت تتصل بـ backend حقيقي مع:

- **حالة التحميل** — عرض `Loader2` أثناء جلب البيانات
- **حالة الخطأ** — عرض `AlertCircle` مع زر إعادة المحاولة
- **حالة فارغة** — رسائل مناسبة عند عدم وجود بيانات
- **تحديث فوري** — بعد العمليات (إضافة/تعديل/حذف) يتم تحديث البيانات تلقائياً

#### Graduate Pages (7)
| الصفحة | API المستخدم |
|--------|-------------|
| `/graduate` | `getMyProfile()`, `applicationService.list()`, `interviewService.list()`, `aiService.jobRecommendations()` |
| `/graduate/profile` | `getMyProfile()`, Education/Experience/Certification/Projects CRUD |
| `/graduate/jobs` | `jobService.listJobs()`, `applyToJob()`, `toggleSaveJob()` |
| `/graduate/applications` | `applicationService.list()` مع فلترة حسب الحالة |
| `/graduate/interviews` | `interviewService.list()` مع فصل القادمة/السابقة |
| `/graduate/messages` | `chatService.getConversations()`, `getMessages()`, `sendMessage()` |
| `/graduate/analytics` | `analyticsService.graduate()`, `aiService.skillAnalysis()` |

#### Employer Pages (7)
| الصفحة | API المستخدم |
|--------|-------------|
| `/employer` | `jobService.listJobs()`, `applicationService.list()` |
| `/employer/company` | `employerService.getMyCompany()`, `createCompany()`, `updateCompany()` |
| `/employer/jobs` | `jobService.listJobs()`, `createJob()`, `updateJob()`, `publishJob()`, `closeJob()` |
| `/employer/candidates` | `graduateService.listProfiles()` مع بحث وفلترة |
| `/employer/interviews` | `interviewService.list()`, `create()`, `delete()` |
| `/employer/messages` | `chatService.getConversations()`, `getMessages()`, `sendMessage()` |
| `/employer/analytics` | `analyticsService.employer()` مع رسوم بيانية Recharts |

#### Admin Pages (8)
| الصفحة | API المستخدم |
|--------|-------------|
| `/admin` | `analyticsService.admin()` مع إحصائيات حقيقية |
| `/admin/users` | `adminService.listUsers()`, `banUser()`, `unbanUser()`, `verifyUser()`, `deleteUser()` |
| `/admin/graduates` | `adminService.listGraduates()` مع فلترة وتوثيق |
| `/admin/companies` | `adminService.listCompanies()` مع فلترة وتوثيق |
| `/admin/jobs` | `jobService.listJobs()`, `closeJob()`, `deleteJob()` |
| `/admin/verifications` | إدارة طلبات التوثيق عبر admin APIs |
| `/admin/reports` | `analyticsService.admin()` مع رسوم بيانية متعددة |
| `/admin/settings` | `graduateService.getSkills()`, `jobService.getCategories()` مع CRUD محلي |

### 2. نظام المواظبة (Streaks)

تم إضافة نظام متكامل لتتبع نشاط المستخدمين وتحفيزهم على الاستخدام اليومي.

**الخلفية (Backend):**
- نموذج `ActivityStreak` — يتتبع المواظبة اليومية لكل مستخدم
- نموذج `ActivityLog` — يسجل جميع أنواع الأنشطة (تسجيل دخول، تقديم على وظيفة، تحديث ملف، إلخ)
- API: `GET /api/v1/auth/streaks/me/` — يحصل على معلومات المواظبة
- API: `POST /api/v1/auth/streaks/log/` — يسجل نشاطاً جديداً
- آلية حساب ذكية: تحسب المواظبة المتصلة، وتعيد التعيين إذا فات يوم

**الواجهة (Frontend):**
- `StreakBadge` — مكون يعرض في الشريط الجانبي لجميع الأدوار
- `useStreakStore` — مخزن Zustand لحالة المواظبة
- يعرض: عدد أيام المواظبة الحالية، أطول مواظبة، إجمالي الأنشطة، حالة اليوم
- شريط تقدم يوضح المسافة حتى 30 يوم (الأسطورة)
- 4 مستويات: مبتدئ (أبيض)، مواظب (برتقالي)، مشتعل (أحمر)، أسطوري (بنفسجي)

### 3. تحسين جميع واجهات المستخدم

- إضافة StreakBadge إلى DashboardLayout لكل الأدوار
- تحسين أزرار التنقل الجانبية مع أيقونات وتأثيرات hover
- إضافة تأثيرات حركية (Framer Motion animations)
- تحسين تصميم البطاقات والجداول
- إضافة أوضاع عرض متعددة (grid/list) لصفحات الإدارة
- تحسين الخطوط والألوان للقراءة بالعربية
- دعم كامل للوضع المظلم (dark mode)

### 4. تصحيح الأرقام العربية → الإنجليزية

تم تحويل جميع الأرقام العربية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية (0123456789) في 9 ملفات:
- `graduate/applications`, `graduate/interviews`, `graduate/messages`, `graduate/analytics`
- `employer/jobs`, `employer/interviews`, `employer/messages`, `employer/company`, `employer/analytics`

### 5. طبقة خدمات API مركزية

تم إنشاء `src/lib/api-services.ts` التي تحتوي على جميع دوال API المنظمة حسب الخدمة:
- `authService` — المصادقة والملف الشخصي
- `graduateService` — الملف الشخصي للخريج، التعليم، الشهادات، الخبرات، المشاريع، المهارات
- `employerService` — الشركات، التوظيف
- `jobService` — الوظائف، التقديم، الحفظ
- `applicationService` — طلبات التقديم، تحديث الحالة
- `interviewService` — المقابلات
- `chatService` — المحادثات والرسائل
- `notificationService` — الإشعارات
- `analyticsService` — التحليلات (مدير، صاحب عمل، خريج)
- `aiService` — الذكاء الاصطناعي (توصيات، تحليل مهارات)
- `streakService` — المواظبة
- `adminService` — إدارة المنصة

---

## حالة النظام

✅ **Backend:** يعمل على المنفذ `8000` (Django 4.2 + DRF + JWT)  
✅ **Frontend:** يعمل على المنفذ `3000` (Next.js 14 + TypeScript + TailwindCSS)  
✅ **عدد الصفحات:** 26/26 — جميعها تعود بـ HTTP 200  
✅ **API Endpoints:** جميع الواجهات متصلة بالـ Backend الحقيقي  
✅ **المصادقة:** JWT مع Refresh تلقائي وتوجيه حسب الدور  
✅ **المواظبة:** نظام Streaks كامل (Backend + Frontend)  
✅ **التصميم:** RTL عربي، دعم كامل للوضع المظلم، جميع أحجام الشاشات  
✅ **اختبار سرعة:** أقل من 30 ثانية للإقلاع الكامل

## المستخدمون الاختباريون

| اسم المستخدم | كلمة المرور | الدور |
|---|---|---|
| `admin` | `admin` | مدير النظام |
| `company` | `Company123` | صاحب عمل |
| `user` | `User1234` | خريج |

## ملفات MD للتوثيق

- `README.md` — توثيق شامل للمشروع
- `version(1.1).md` — خارطة الطريق (Roadmap)
- `v1.0.1.md` — تحديث النصوص والتنسيق
- `v1.1.0.md` — بناء جميع الصفحات وتحسين واجهة المستخدم
- `usable-v1.5.md` —— إطلاق النسخة القابلة للاستخدام (هذا الملف)

## ملاحظات فنية

- **PostgreSQL** غير مستخدم محلياً (مشكلة icu4c)؛ التطوير يتم على SQLite
- **Elasticsearch** غير شغال محلياً؛ تم إزالة تطبيقات ES من INSTALLED_APPS
- **Python 3.9** يحد من إصدارات الحزم؛ تم استخدام `requirements/dev-compat.txt`
- **إعادة تحميل الخادم:** يتم استخدام `--noreload` مع Django بسبب مشكلة daphne
