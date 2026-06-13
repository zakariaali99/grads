import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'auth_guard.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/otp_verification_screen.dart';
import '../../features/graduate/presentation/screens/graduate_shell.dart';
import '../../features/graduate/presentation/screens/job_detail_screen.dart';
import '../../features/graduate/presentation/screens/saved_jobs_screen.dart';
import '../../features/graduate/presentation/screens/skills_dashboard_screen.dart';
import '../../features/graduate/presentation/screens/cv_management_screen.dart';
import '../../features/employer/presentation/screens/employer_shell.dart';
import '../../features/admin/presentation/screens/admin_shell.dart';
import '../../features/admin/presentation/screens/admin_home_screen.dart';
import '../../features/admin/presentation/screens/admin_users_screen.dart';
import '../../features/admin/presentation/screens/admin_verifications_screen.dart';
import '../../features/admin/presentation/screens/admin_settings_screen.dart';
import '../../features/admin/presentation/screens/admin_crud_screen.dart';
import '../../features/admin/presentation/screens/admin_announcements_screen.dart';
import '../../features/admin/presentation/screens/admin_audit_log_screen.dart';
import '../../features/admin/data/models/mock_data.dart';
import '../../features/institution/presentation/screens/institution_shell.dart';
import '../../features/institution/presentation/screens/institution_home_screen.dart';
import '../../features/chat/presentation/screens/conversations_screen.dart';
import '../../features/chat/presentation/screens/chat_screen.dart';
import '../../features/chat/presentation/screens/chat_shell.dart';
import '../../features/social/presentation/screens/social_feed_screen.dart';
import '../../features/social/presentation/screens/create_post_screen.dart';
import '../../features/social/presentation/screens/post_detail_screen.dart';
import '../../features/social/presentation/screens/social_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authGuard = AuthGuard(ref);

  return GoRouter(
    initialLocation: '/',
    redirect: authGuard.redirect,
    refreshListenable: null,
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/onboarding',
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const OnboardingScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      ),
      GoRoute(
        path: '/auth/login',
        name: 'login',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/otp',
        name: 'otpVerification',
        builder: (context, state) => const OtpVerificationScreen(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => const GraduateShell(child: SizedBox.shrink()),
        routes: [
          GoRoute(
            path: '/graduate/home',
            name: 'graduateHome',
            builder: (context, state) => const SizedBox.shrink(),
          ),
          GoRoute(
            path: '/graduate/jobs/detail',
            name: 'jobDetail',
            builder: (context, state) => const JobDetailScreen(),
          ),
          GoRoute(
            path: '/graduate/jobs/saved',
            name: 'savedJobs',
            builder: (context, state) => const SavedJobsScreen(),
          ),
          GoRoute(
            path: '/graduate/skills',
            name: 'skillsDashboard',
            builder: (context, state) => const SkillsDashboardScreen(),
          ),
          GoRoute(
            path: '/graduate/cv',
            name: 'cvManagement',
            builder: (context, state) => const CvManagementScreen(),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => EmployerShell(child: child),
        routes: [
          GoRoute(
            path: '/employer/home',
            name: 'employerHome',
            builder: (context, state) => const SizedBox.shrink(),
          ),
          GoRoute(
            path: '/employer/company',
            name: 'companyProfile',
            builder: (context, state) => const Scaffold(body: Center(child: Text('ملف الشركة'))),
          ),
          GoRoute(
            path: '/employer/jobs/create',
            name: 'createJob',
            builder: (context, state) => const Scaffold(body: Center(child: Text('إنشاء وظيفة'))),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: '/admin/home',
            name: 'adminHome',
            builder: (context, state) => const AdminHomeScreen(),
          ),
          GoRoute(
            path: '/admin/users',
            name: 'adminUsers',
            builder: (context, state) => const AdminUsersScreen(),
          ),
          GoRoute(
            path: '/admin/verifications',
            name: 'adminVerifications',
            builder: (context, state) => const AdminVerificationsScreen(),
          ),
          GoRoute(
            path: '/admin/settings',
            name: 'adminSettings',
            builder: (context, state) => const AdminSettingsScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/admin/settings/skills',
        name: 'adminSkills',
        builder: (context, state) => AdminCrudScreen(title: 'المهارات', items: mockSkills),
      ),
      GoRoute(
        path: '/admin/settings/colleges',
        name: 'adminColleges',
        builder: (context, state) => AdminCrudScreen(title: 'الكليات', items: mockColleges),
      ),
      GoRoute(
        path: '/admin/settings/categories',
        name: 'adminCategories',
        builder: (context, state) => AdminCrudScreen(title: 'التصنيفات', items: mockCategories),
      ),
      GoRoute(
        path: '/admin/settings/announcements',
        name: 'adminAnnouncements',
        builder: (context, state) => const AdminAnnouncementsScreen(),
      ),
      GoRoute(
        path: '/admin/settings/audit-log',
        name: 'adminAuditLog',
        builder: (context, state) => const AdminAuditLogScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => InstitutionShell(child: child),
        routes: [
          GoRoute(
            path: '/institution/home',
            name: 'institutionHome',
            builder: (context, state) => const InstitutionHomeScreen(),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => ChatShell(child: child),
        routes: [
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (context, state) => const ConversationsScreen(),
          ),
          GoRoute(
            path: '/chat/conversation',
            name: 'chatConversation',
            builder: (context, state) => const ChatScreen(),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => SocialShell(child: child),
        routes: [
          GoRoute(
            path: '/social',
            name: 'social',
            builder: (context, state) => const SocialFeedScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/social/create',
        name: 'createPost',
        builder: (context, state) => const CreatePostScreen(),
      ),
      GoRoute(
        path: '/social/post',
        name: 'postDetail',
        builder: (context, state) => const PostDetailScreen(),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Search')),
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
});
