import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../constants/enums.dart';

class AuthGuard {
  final Ref ref;

  AuthGuard(this.ref);

  String? redirect(BuildContext context, GoRouterState state) {
    final authState = ref.read(authProvider);

    final isAuthenticated = authState is AuthAuthenticated;
    final isOnAuthScreen = state.matchedLocation.startsWith('/auth') ||
        state.matchedLocation == '/onboarding' ||
        state.matchedLocation == '/';

    if (!isAuthenticated && !isOnAuthScreen) {
      return '/auth/login';
    }

    if (authState case AuthAuthenticated(:final user)) {
      final isOnboardingOrAuth = isOnAuthScreen;

      if (isOnboardingOrAuth) {
        return _getDefaultRouteForRole(user.userType);
      }

      final currentPath = state.matchedLocation;
      final roleRoute = _getRolePrefix(user.userType);

      if (!currentPath.startsWith(roleRoute) &&
          !currentPath.startsWith('/chat') &&
          !currentPath.startsWith('/notifications') &&
          !currentPath.startsWith('/social') &&
          !currentPath.startsWith('/search')) {
        return roleRoute;
      }
    }

    return null;
  }

  String _getDefaultRouteForRole(UserType role) {
    switch (role) {
      case UserType.graduate:
        return '/graduate/home';
      case UserType.employer:
        return '/employer/home';
      case UserType.admin:
        return '/admin/home';
      case UserType.institution:
        return '/institution/home';
    }
  }

  String _getRolePrefix(UserType role) {
    switch (role) {
      case UserType.graduate:
        return '/graduate';
      case UserType.employer:
        return '/employer';
      case UserType.admin:
        return '/admin';
      case UserType.institution:
        return '/institution';
    }
  }
}
