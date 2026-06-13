import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import 'admin_home_screen.dart';
import 'admin_users_screen.dart';
import 'admin_verifications_screen.dart';
import 'admin_settings_screen.dart';

class AdminShell extends StatefulWidget {
  final Widget child;

  const AdminShell({super.key, required this.child});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _selectedIndex = 0;

  final _screens = const [
    AdminHomeScreen(),
    AdminUsersScreen(),
    AdminVerificationsScreen(),
    AdminSettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isRootRoute = widget.child.runtimeType == SizedBox;
    return Scaffold(
      body: isRootRoute
          ? IndexedStack(index: _selectedIndex, children: _screens)
          : widget.child,
      bottomNavigationBar: isRootRoute
          ? Container(
              decoration: BoxDecoration(
                color: Theme.of(context).bottomNavigationBarTheme.backgroundColor,
                border: Border(
                  top: BorderSide(color: Colors.grey.withValues(alpha: 0.1)),
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _NavItem(
                        icon: Icons.dashboard_outlined,
                        activeIcon: Icons.dashboard,
                        label: 'لوحة التحكم',
                        isSelected: _selectedIndex == 0,
                        onTap: () => _navigate(0, '/admin/home'),
                      ),
                      _NavItem(
                        icon: Icons.people_outline,
                        activeIcon: Icons.people,
                        label: 'المستخدمين',
                        isSelected: _selectedIndex == 1,
                        onTap: () => _navigate(1, '/admin/users'),
                      ),
                      _NavItem(
                        icon: Icons.verified_outlined,
                        activeIcon: Icons.verified,
                        label: 'التحقق',
                        isSelected: _selectedIndex == 2,
                        onTap: () => _navigate(2, '/admin/verifications'),
                      ),
                      _NavItem(
                        icon: Icons.settings_outlined,
                        activeIcon: Icons.settings,
                        label: 'الإعدادات',
                        isSelected: _selectedIndex == 3,
                        onTap: () => _navigate(3, '/admin/settings'),
                      ),
                    ],
                  ),
                ),
              ),
            )
          : null,
    );
  }

  void _navigate(int index, String route) {
    setState(() => _selectedIndex = index);
    context.go(route);
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppColors.primary : AppColors.textHint,
              size: AppDimensions.bottomNavIconSize,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontFamily: AppTypography.arabicFontFamily,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? AppColors.primary : AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
