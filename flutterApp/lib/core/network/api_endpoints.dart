class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login/';
  static const String register = '/auth/register/';
  static const String refreshToken = '/auth/refresh/';
  static const String logout = '/auth/logout/';
  static const String profile = '/auth/profile/';
  static const String changePassword = '/auth/change-password/';
  static const String verifyRequest = '/auth/verify/request/';
  static const String verifyConfirm = '/auth/verify/confirm/';
  static const String passwordReset = '/auth/password-reset/';
  static const String passwordResetConfirm = '/auth/password-reset/confirm/';
  static const String deleteAccount = '/auth/delete-account/';

  // Graduates
  static const String graduateProfiles = '/graduates/profiles/';
  static const String graduateMe = '/graduates/profiles/me/';
  static const String graduateByUsername = '/graduates/profiles/by_username/';
  static const String skills = '/graduates/skills/';
  static const String skillCategories = '/graduates/skill-categories/';
  static const String colleges = '/graduates/colleges/';
  static const String savedGraduates = '/graduates/saved/';

  // Employers
  static const String companies = '/employers/companies/';
  static const String companyMe = '/employers/companies/me/';
  static const String industries = '/employers/industries/';

  // Jobs
  static const String jobPosts = '/jobs/posts/';
  static const String applications = '/jobs/applications/';
  static const String categories = '/jobs/categories/';
  static const String savedJobs = '/jobs/saved-jobs/';
  static const String interviews = '/jobs/interviews/';
  static const String pipelines = '/jobs/pipeline-stages/';
  static const String scorecards = '/jobs/scorecards/';

  // Analytics
  static const String adminAnalytics = '/analytics/admin/';
  static const String employerAnalytics = '/analytics/employer/';
  static const String graduateAnalytics = '/analytics/graduate/';

  // Notifications
  static const String notifications = '/notifications/';
  static const String unreadCount = '/notifications/unread-count/';

  // Chat
  static const String conversations = '/chat/conversations/';
  static const String messages = '/chat/messages/';

  // AI
  static const String parseCv = '/ai/parse-cv/';
  static const String rankCandidates = '/ai/rank-candidates/';
  static const String jobRecommendations = '/ai/job-recommendations/';
  static const String graduateRecommendations = '/ai/graduate-recommendations/';
  static const String fraudCheck = '/ai/fraud-check/';
  static const String skillAnalysis = '/ai/skill-analysis/';

  // Social
  static const String posts = '/social/posts/';
  static const String feed = '/social/feed/';
  static const String reactions = '/social/reactions/';
  static const String comments = '/social/comments/';
  static const String follows = '/social/follows/';

  // Admin
  static const String adminUsers = '/admin/users/';
  static const String adminGraduates = '/admin/graduates/';
  static const String adminCompanies = '/admin/companies/';
  static const String adminJobs = '/admin/jobs/';
  static const String platformEvents = '/admin/platform-events/';
  static const String auditLogs = '/admin/audit-logs/';
  static const String dailyStats = '/admin/daily-stats/';

  // Institution
  static const String institutionProfile = '/institution/profile/';
  static const String graduateTracking = '/institution/graduate-tracking/';
  static const String partnerships = '/institution/partnerships/';
  static const String curriculumFeedback = '/institution/curriculum-feedback/';

  // Search
  static const String globalSearch = '/search/global/';

  // Ads
  static const String ads = '/ads/';
}
