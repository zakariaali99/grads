import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({super.key});

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen> {
  int _selectedFilter = 0;

  final _filters = ['الكل', 'قيد المراجعة', 'مقابلة', 'مقبول', 'مرفوض'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, 0),
              child: Text(
                'طلبات التقديم',
                style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            _buildFilterTabs(),
            const SizedBox(height: AppDimensions.sm),
            Expanded(child: _buildApplicationsList()),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterTabs() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.background,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: Text(
                  _filters[index],
                  style: TextStyle(
                    fontFamily: AppTypography.arabicFontFamily,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildApplicationsList() {
    final applications = [
      _AppData('مطور Flutter', 'شركة تك', 'قيد المراجعة', AppColors.statusReviewed, 'منذ يومين', 95),
      _AppData('مهندس Backend', 'بنك الابتكار', 'مقابلة', AppColors.statusInterview, 'منذ أسبوع', 88),
      _AppData('مصمم UI/UX', 'مؤسسة رقمية', 'مقبول', AppColors.statusAccepted, 'منذ ٣ أيام', 82),
      _AppData('محلل بيانات', 'شركة حلول', 'مرفوض', AppColors.statusRejected, 'منذ أسبوعين', 76),
      _AppData('مهندس DevOps', 'منصة تعليم', 'قيد المراجعة', AppColors.statusReviewed, 'منذ ٥ أيام', 91),
    ];

    if (applications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description_outlined, size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
            const SizedBox(height: AppDimensions.md),
            Text('لا توجد طلبات بعد', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
              color: AppColors.textHint,
            )),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
      itemCount: applications.length,
      itemBuilder: (context, index) {
        final app = applications[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(child: Text(app.company[0], style: const TextStyle(
                        fontFamily: AppTypography.arabicFontFamily,
                        fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary,
                      ))),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(app.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          )),
                          Text(app.company, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: app.statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6, height: 6,
                            decoration: BoxDecoration(
                              color: app.statusColor, shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(app.status, style: TextStyle(
                            fontSize: 11, color: app.statusColor, fontWeight: FontWeight.w500,
                          )),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.sm),
                Row(
                  children: [
                    Text('نسبة التطابق: ', style: const TextStyle(fontSize: 12, color: AppColors.textHint)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: app.matchScore >= 80
                            ? AppColors.success.withValues(alpha: 0.1)
                            : AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('${app.matchScore}%', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600,
                        color: app.matchScore >= 80 ? AppColors.success : AppColors.warning,
                      )),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Icon(Icons.schedule_outlined, size: 14, color: AppColors.textHint),
                        const SizedBox(width: 4),
                        Text(app.date, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ),
                    if (app.status == 'مقابلة') ...[
                      const SizedBox(width: AppDimensions.sm),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.statusInterview.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.calendar_today, size: 12, color: AppColors.statusInterview),
                            SizedBox(width: 4),
                            Text('عرض الموعد', style: TextStyle(
                              fontSize: 10, color: AppColors.statusInterview, fontWeight: FontWeight.w500,
                            )),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AppData {
  final String title;
  final String company;
  final String status;
  final Color statusColor;
  final String date;
  final int matchScore;

  _AppData(this.title, this.company, this.status, this.statusColor, this.date, this.matchScore);
}
