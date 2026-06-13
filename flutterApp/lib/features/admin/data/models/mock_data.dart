import 'admin_models.dart';

final mockUsers = [
  AdminUser(id: '1', name: 'سارة الأحمد', email: 'sara@example.com', role: 'graduate', status: 'active', joinedDate: DateTime(2026, 1, 15), reportsCount: 0, isVerified: true),
  AdminUser(id: '2', name: 'محمد القحطاني', email: 'mohammed@example.com', role: 'employer', status: 'active', joinedDate: DateTime(2026, 2, 20), reportsCount: 1, isVerified: true),
  AdminUser(id: '3', name: 'نورة الدوسري', email: 'noura@example.com', role: 'graduate', status: 'active', joinedDate: DateTime(2026, 3, 5), reportsCount: 0, isVerified: false),
  AdminUser(id: '4', name: 'أحمد الزهراني', email: 'ahmed@example.com', role: 'institution', status: 'pending', joinedDate: DateTime(2026, 4, 10), reportsCount: 0, isVerified: false),
  AdminUser(id: '5', name: 'فاطمة الشمري', email: 'fatima@example.com', role: 'graduate', status: 'blocked', joinedDate: DateTime(2026, 1, 28), reportsCount: 3, isVerified: true),
  AdminUser(id: '6', name: 'خالد المطيري', email: 'khalid@example.com', role: 'employer', status: 'active', joinedDate: DateTime(2026, 2, 14), reportsCount: 0, isVerified: true),
  AdminUser(id: '7', name: 'هند العتيبي', email: 'hind@example.com', role: 'graduate', status: 'active', joinedDate: DateTime(2026, 3, 22), reportsCount: 0, isVerified: true),
  AdminUser(id: '8', name: 'سعود الحربي', email: 'saud@example.com', role: 'employer', status: 'pending', joinedDate: DateTime(2026, 4, 1), reportsCount: 0, isVerified: false),
];

final mockVerifications = [
  VerificationRequest(id: '1', userName: 'نورة الدوسري', userEmail: 'noura@example.com', documentType: 'الهوية الوطنية', documentUrl: '', status: 'pending', submittedDate: DateTime(2026, 5, 1)),
  VerificationRequest(id: '2', userName: 'أحمد الزهراني', userEmail: 'ahmed@example.com', documentType: 'شهادة التخرج', documentUrl: '', status: 'pending', submittedDate: DateTime(2026, 5, 3)),
  VerificationRequest(id: '3', userName: 'سعود الحربي', userEmail: 'saud@example.com', documentType: 'السجل التجاري', documentUrl: '', status: 'pending', submittedDate: DateTime(2026, 5, 5)),
  VerificationRequest(id: '4', userName: 'فهد العنزي', userEmail: 'fahad@example.com', documentType: 'الهوية الوطنية', documentUrl: '', status: 'approved', submittedDate: DateTime(2026, 4, 20), reviewedDate: DateTime(2026, 4, 22), reviewerNotes: 'تم التحقق بنجاح'),
  VerificationRequest(id: '5', userName: 'منى السهلي', userEmail: 'mona@example.com', documentType: 'شهادة الماجستير', documentUrl: '', status: 'rejected', submittedDate: DateTime(2026, 4, 15), reviewedDate: DateTime(2026, 4, 18), reviewerNotes: 'المستند غير واضح، يرجى إعادة التحميل'),
];

final mockFraudAlerts = [
  FraudAlert(id: '1', type: 'انتحال هوية', description: 'اكتشاف حساب مكرر لنفس المستخدم مع معلومات مختلفة', severity: 'critical', detectedDate: DateTime(2026, 5, 10), userName: 'فاطمة الشمري', isResolved: false),
  FraudAlert(id: '2', type: 'مؤهل مزيف', description: 'شهادة جامعية من جامعة غير معتمدة', severity: 'high', detectedDate: DateTime(2026, 5, 8), userName: 'محمد القحطاني', isResolved: false),
  FraudAlert(id: '3', type: 'إعلان وظيفي وهمي', description: 'شركة غير مسجلة تنشر إعلانات وظيفية', severity: 'medium', detectedDate: DateTime(2026, 5, 5), userName: 'خالد المطيري', isResolved: true),
  FraudAlert(id: '4', type: 'محاولة اختراق', description: 'محاولات تسجيل دخول متكررة من عنوان IP غير معتاد', severity: 'high', detectedDate: DateTime(2026, 5, 12), userName: '', isResolved: false),
];

final mockSkills = [
  CrudItem(id: '1', name: 'flutter', nameAr: 'فلاتر', usageCount: 45, isActive: true),
  CrudItem(id: '2', name: 'python', nameAr: 'بايثون', usageCount: 67, isActive: true),
  CrudItem(id: '3', name: 'data-analysis', nameAr: 'تحليل البيانات', usageCount: 52, isActive: true),
  CrudItem(id: '4', name: 'machine learning', nameAr: 'تعلم الآلة', usageCount: 38, isActive: true),
  CrudItem(id: '5', name: 'ui-ux', nameAr: 'تصميم واجهات', usageCount: 29, isActive: true),
  CrudItem(id: '6', name: 'project-management', nameAr: 'إدارة المشاريع', usageCount: 41, isActive: false),
];

final mockColleges = [
  CrudItem(id: '1', name: 'computer-science', nameAr: 'علوم الحاسب', usageCount: 89, isActive: true),
  CrudItem(id: '2', name: 'engineering', nameAr: 'الهندسة', usageCount: 76, isActive: true),
  CrudItem(id: '3', name: 'business', nameAr: 'إدارة الأعمال', usageCount: 54, isActive: true),
  CrudItem(id: '4', name: 'medicine', nameAr: 'الطب', usageCount: 32, isActive: true),
  CrudItem(id: '5', name: 'arts', nameAr: 'الآداب', usageCount: 28, isActive: false),
];

final mockCategories = [
  CrudItem(id: '1', name: 'technology', nameAr: 'تقنية المعلومات', usageCount: 95, isActive: true),
  CrudItem(id: '2', name: 'healthcare', nameAr: 'الرعاية الصحية', usageCount: 42, isActive: true),
  CrudItem(id: '3', name: 'education', nameAr: 'التعليم', usageCount: 38, isActive: true),
  CrudItem(id: '4', name: 'finance', nameAr: 'المالية', usageCount: 31, isActive: true),
  CrudItem(id: '5', name: 'construction', nameAr: 'المقاولات', usageCount: 27, isActive: true),
];

final mockAnnouncements = [
  Announcement(id: '1', title: 'تحديث نظام التوثيق', body: 'تم تحديث نظام توثيق الشهادات الجامعية لإصدارات جديدة من الشهادات الرقمية.', targetRole: 'all', createdAt: DateTime(2026, 5, 1), isPublished: true),
  Announcement(id: '2', title: 'صيانة مجدولة', body: 'سيتم إجراء صيانة للخدمة يوم الجمعة القادم من الساعة ٢ صباحاً حتى ٦ صباحاً.', targetRole: 'all', createdAt: DateTime(2026, 5, 8), isPublished: true),
  Announcement(id: '3', title: 'شراكة جديدة', body: 'يسرنا الإعلان عن شراكتنا مع جامعة الملك سعود لتوثيق الشهادات.', targetRole: 'institution', createdAt: DateTime(2026, 5, 10), isPublished: false),
];

final mockAuditLog = [
  AuditEntry(id: '1', action: 'حظر مستخدم', adminName: 'المشرف', targetType: 'مستخدم', targetName: 'فاطمة الشمري', timestamp: DateTime(2026, 5, 12, 14, 30), details: 'تم حظر المستخدم بسبب انتهاك شروط الاستخدام'),
  AuditEntry(id: '2', action: 'تعديل', adminName: 'المشرف', targetType: 'مهارة', targetName: 'تعلم الآلة', timestamp: DateTime(2026, 5, 11, 10, 15), details: 'تم تحديث الاسم العربي للمهارة'),
  AuditEntry(id: '3', action: 'إضافة', adminName: 'المشرف', targetType: 'تصنيف', targetName: 'الطاقة المتجددة', timestamp: DateTime(2026, 5, 10, 9, 0), details: 'تم إضافة تصنيف جديد'),
  AuditEntry(id: '4', action: 'قبول توثيق', adminName: 'المشرف', targetType: 'توثيق', targetName: 'فهد العنزي', timestamp: DateTime(2026, 5, 9, 16, 45), details: 'تم قبول طلب توثيق الهوية الوطنية'),
  AuditEntry(id: '5', action: 'رفض توثيق', adminName: 'المشرف', targetType: 'توثيق', targetName: 'منى السهلي', timestamp: DateTime(2026, 5, 8, 11, 20), details: 'المستند غير واضح'),
  AuditEntry(id: '6', action: 'إعلان', adminName: 'المشرف', targetType: 'إعلان', targetName: 'تحديث نظام التوثيق', timestamp: DateTime(2026, 5, 1, 8, 0), details: 'تم نشر إعلان جديد'),
];
