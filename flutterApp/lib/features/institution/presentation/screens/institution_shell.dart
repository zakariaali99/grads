import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';

class InstitutionShell extends StatefulWidget {
  final Widget child;

  const InstitutionShell({super.key, required this.child});

  @override
  State<InstitutionShell> createState() => _InstitutionShellState();
}

class _InstitutionShellState extends State<InstitutionShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).bottomNavigationBarTheme.backgroundColor,
          border: Border(
            top: BorderSide(
              color: Colors.grey.withValues(alpha: 0.1),
            ),
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
                  label: 'الرئيسية',
                  isSelected: _selectedIndex == 0,
                  onTap: () => _navigate(0, '/institution/home'),
                ),
                _NavItem(
                  icon: Icons.school_outlined,
                  activeIcon: Icons.school,
                  label: 'الخريجين',
                  isSelected: _selectedIndex == 1,
                  onTap: () => _navigate(1, '/institution/graduates'),
                ),
                _NavItem(
                  icon: Icons.handshake_outlined,
                  activeIcon: Icons.handshake,
                  label: 'الشراكات',
                  isSelected: _selectedIndex == 2,
                  onTap: () => _navigate(2, '/institution/partnerships'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _navigate(int index, String route) {
    setState(() => _selectedIndex = index);
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
