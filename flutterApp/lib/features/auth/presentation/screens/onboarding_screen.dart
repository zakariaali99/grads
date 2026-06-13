import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/constants/enums.dart';
import '../../../../core/extensions/context_extensions.dart';
import '../widgets/role_selection_card.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  int _currentPage = 0;
  UserType? _selectedRole;

  final _pages = [
    _OnboardingPageData(
      title: 'مرحباً بك في خريجون',
      subtitle: 'المنصة الأولى للتوظيف التقني في ليبيا',
      gradient: AppColors.primaryGradient,
      icon: Icons.rocket_launch_outlined,
    ),
    _OnboardingPageData(
      title: 'ابحث عن الفرصة المناسبة',
      subtitle: 'نظام ذكي يوصيك بالوظائف والمرشحين المناسبين',
      gradient: AppColors.accentGradient,
      icon: Icons.search_outlined,
    ),
    _OnboardingPageData(
      title: 'ابنِ مستقبلك المهني',
      subtitle: 'تواصل مع الشركات وطور مهاراتك',
      gradient: AppColors.sunsetGradient,
      icon: Icons.trending_up_outlined,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Padding(
              padding: const EdgeInsets.all(AppDimensions.md),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentPage < _pages.length - 1)
                    TextButton(
                      onPressed: () => _pageController.jumpToPage(_pages.length - 1),
                      child: const Text('تخطي'),
                    )
                  else
                    const Spacer(),
                  Text(
                    'خريجون',
                    style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),

            // PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (page) {
                  setState(() => _currentPage = page);
                  _animationController.reset();
                  _animationController.forward();
                },
                itemCount: _pages.length + 1,
                itemBuilder: (context, index) {
                  if (index < _pages.length) {
                    return _OnboardingPage(data: _pages[index]);
                  }
                  return _RoleSelectionPage(
                    selectedRole: _selectedRole,
                    onRoleSelected: (role) {
                      setState(() => _selectedRole = role);
                    },
                  );
                },
              ),
            ),

            // Bottom section
            Container(
              padding: const EdgeInsets.all(AppDimensions.lg),
              decoration: BoxDecoration(
                color: context.isSmallScreen
                    ? Theme.of(context).scaffoldBackgroundColor
                    : Colors.transparent,
                border: Border(
                  top: BorderSide(
                    color: Colors.grey.withValues(alpha: 0.1),
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Dots indicator
                  if (_currentPage < _pages.length)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _pages.length + 1,
                        (i) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == i ? 32 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: _currentPage == i
                                ? AppColors.primary
                                : AppColors.primary.withValues(alpha: 0.2),
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: AppDimensions.md),

                  // Action button
                  _currentPage < _pages.length
                      ? GradientButton(
                          text: 'التالي',
                          gradient: AppColors.primaryGradient,
                          onPressed: () {
                            _pageController.nextPage(
                              duration: const Duration(milliseconds: 400),
                              curve: Curves.easeInOut,
                            );
                          },
                        )
                      : GradientButton(
                          text: 'ابدأ الآن',
                          gradient: _selectedRole != null
                              ? AppColors.accentGradient
                              : AppColors.primaryGradient,
                          onPressed: _selectedRole != null
                              ? () {
                                  context.push('/auth/register');
                                }
                              : null,
                        ),

                  const SizedBox(height: AppDimensions.sm),

                  if (_currentPage < _pages.length)
                    TextButton(
                      onPressed: () => _pageController.jumpToPage(_pages.length),
                      child: Text(
                        'لديك حساب بالفعل؟ سجل الدخول',
                        style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
                          color: AppColors.accent,
                        ),
                      ),
                    )
                  else
                    TextButton(
                      onPressed: () => context.push('/auth/login'),
                      child: const Text('لديك حساب بالفعل؟ سجل الدخول'),
                    ),
                ],
              ),
          ),
        ],
      ),
      ),
    );
  }
}

class _OnboardingPageData {
  final String title;
  final String subtitle;
  final LinearGradient gradient;
  final IconData icon;

  _OnboardingPageData({
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.icon,
  });
}

class _OnboardingPage extends StatelessWidget {
  final _OnboardingPageData data;

  const _OnboardingPage({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              gradient: data.gradient,
              borderRadius: BorderRadius.circular(40),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Icon(
              data.icon,
              size: 64,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppDimensions.xxl),
          Text(
            data.title,
            style: AppTypography.arabicTextTheme.displaySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.md),
          Text(
            data.subtitle,
            style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class GradientButton extends StatelessWidget {
  final String text;
  final LinearGradient gradient;
  final VoidCallback? onPressed;

  const GradientButton({
    super.key,
    required this.text,
    required this.gradient,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: AppDimensions.buttonHeight,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: onPressed != null ? gradient : null,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          color: onPressed == null ? Colors.grey : null,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
            child: Center(
              child: Text(
                text,
                style: const TextStyle(
                  fontFamily: AppTypography.arabicFontFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleSelectionPage extends StatelessWidget {
  final UserType? selectedRole;
  final ValueChanged<UserType> onRoleSelected;

  const _RoleSelectionPage({
    required this.selectedRole,
    required this.onRoleSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.xl),
      child: SingleChildScrollView(
        child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.person_outline, size: 80, color: AppColors.primary),
          const SizedBox(height: AppDimensions.lg),
          Text(
            'اختر نوع حسابك',
            style: AppTypography.arabicTextTheme.displaySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'حدد دورك لتبدأ رحلتك المهنية',
            style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.xl),
          RoleSelectionCard(
            title: 'خريج',
            subtitle: 'أبحث عن فرص عمل تناسب مهاراتي',
            icon: Icons.school_outlined,
            gradient: AppColors.primaryGradient,
            isSelected: selectedRole == UserType.graduate,
            onTap: () => onRoleSelected(UserType.graduate),
          ),
          const SizedBox(height: AppDimensions.md),
          RoleSelectionCard(
            title: 'صاحب عمل',
            subtitle: 'أبحث عن كفاءات تقنية للتوظيف',
            icon: Icons.business_outlined,
            gradient: AppColors.accentGradient,
            isSelected: selectedRole == UserType.employer,
            onTap: () => onRoleSelected(UserType.employer),
          ),
          const SizedBox(height: AppDimensions.md),
          RoleSelectionCard(
            title: 'مؤسسة تعليمية',
            subtitle: 'أتتبع خريجي وأطور المناهج',
            icon: Icons.account_balance_outlined,
            gradient: AppColors.sunsetGradient,
            isSelected: selectedRole == UserType.institution,
            onTap: () => onRoleSelected(UserType.institution),
          ),
        ],
      ),
      ),
    );
  }
}
