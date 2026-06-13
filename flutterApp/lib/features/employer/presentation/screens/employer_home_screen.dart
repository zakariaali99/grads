import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/stats_card.dart';
import '../../../../shared/widgets/glass_card.dart';

class EmployerHomeScreen extends StatelessWidget {
  const EmployerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: AppDimensions.md),
              _buildKpiRow(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('الوظائف النشطة', 'عرض الكل'),
              const SizedBox(height: AppDimensions.sm),
              _buildActiveJobs(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('آخر المتقدمين', 'عرض الكل'),
              const SizedBox(height: AppDimensions.sm),
              _buildRecentApplicants(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('نشاط المنصة', ''),
              const SizedBox(height: AppDimensions.sm),
              _buildActivityFeed(),
              const SizedBox(height: AppDimensions.xxl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Center(child: Text('ت', style: TextStyle(
              fontFamily: AppTypography.arabicFontFamily,
              fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.primary,
            ))),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('شركة تقنيات الابتكار', style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                )),
                Text('تقنية المعلومات', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified, size: 14, color: AppColors.success),
                SizedBox(width: 4),
                Text('موثق', style: TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKpiRow() {
    return Row(
      children: [
        Expanded(child: StatsCard(label: 'الوظائف النشطة', value: '١٢', icon: Icons.work_outline, color: AppColors.accent, change: 20)),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: StatsCard(label: 'المتقدمين', value: '٨٤', icon: Icons.people_outline, color: AppColors.info, change: 15)),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: StatsCard(label: 'المقابلات', value: '٨', icon: Icons.calendar_today_outlined, color: AppColors.secondary, change: -5)),
      ],
    );
  }

  Widget _buildSectionTitle(String title, String? action) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        if (action != null && action.isNotEmpty)
          TextButton(onPressed: () {}, child: Text(action, style: const TextStyle(fontSize: 13))),
      ],
    );
  }

  Widget _buildActiveJobs() {
    final jobs = [
      _JobBrief('مطور Flutter', 'نشط', AppColors.success, '٢٤ متقدم', 'منذ ٣ أيام'),
      _JobBrief('مهندس Backend', 'نشط', AppColors.success, '١٥ متقدم', 'منذ أسبوع'),
      _JobBrief('مصمم UI/UX', 'متوقف', AppColors.warning, '١٢ متقدم', 'منذ أسبوعين'),
    ];
    return Column(
      children: jobs.map((j) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(j.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: j.statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(j.status, style: TextStyle(fontSize: 10, color: j.statusColor, fontWeight: FontWeight.w500)),
                        ),
                        const SizedBox(width: 8),
                        Text(j.applicants, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ),
                  ],
                ),
              ),
              Text(j.date, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildRecentApplicants() {
    final applicants = [
      _Applicant('أحمد علي', 'مطور Flutter', '٩٥٪', AppColors.success),
      _Applicant('سارة محمد', 'مهندس Backend', '٨٨٪', AppColors.success),
      _Applicant('خالد عمر', 'مصمم UI/UX', '٧٢٪', AppColors.warning),
    ];
    return Column(
      children: applicants.map((a) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: Text(a.name[0], style: const TextStyle(
                  fontFamily: AppTypography.arabicFontFamily,
                  fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary,
                ))),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                    Text(a.position, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: a.matchColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(a.match, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: a.matchColor)),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildActivityFeed() {
    final activities = [
      _Activity('تقدم جديد لوظيفة مطور Flutter', 'منذ ساعة'),
      _Activity('تم جدولة مقابلة مع سارة محمد', 'منذ ٣ ساعات'),
      _Activity('تم تحديث حالة وظيفة مصمم UI/UX', 'منذ يوم'),
    ];
    return Column(
      children: activities.map((a) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.circle_notifications, size: 18, color: AppColors.accent),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.title, style: const TextStyle(fontSize: 13)),
                    const SizedBox(height: 2),
                    Text(a.time, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                  ],
                ),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }
}

class _JobBrief {
  final String title; final String status; final Color statusColor;
  final String applicants; final String date;
  _JobBrief(this.title, this.status, this.statusColor, this.applicants, this.date);
}

class _Applicant {
  final String name; final String position; final String match; final Color matchColor;
  _Applicant(this.name, this.position, this.match, this.matchColor);
}

class _Activity {
  final String title; final String time;
  _Activity(this.title, this.time);
}
