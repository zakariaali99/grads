import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class SavedJobsScreen extends StatefulWidget {
  const SavedJobsScreen({super.key});

  @override
  State<SavedJobsScreen> createState() => _SavedJobsScreenState();
}

class _SavedJobsScreenState extends State<SavedJobsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'الوظائف المحفوظة',
                    style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '٤ وظائف',
                    style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(color: AppColors.textHint),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.md),
            Expanded(child: _buildSavedList()),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedList() {
    final jobs = [
      _SavedJob('مطور Flutter', 'شركة تك', 'طرابلس', '4000 - 6000 LYD', 'منذ ٣ أيام', true),
      _SavedJob('مهندس Backend', 'بنك الابتكار', 'بنغازي', '5000 - 7000 LYD', 'منذ أسبوع', true),
      _SavedJob('مصمم UI/UX', 'مؤسسة رقمية', 'عن بعد', '3000 - 5000 LYD', 'منذ ٥ أيام', true),
      _SavedJob('محلل بيانات', 'شركة حلول', 'طرابلس', '3500 - 5500 LYD', 'منذ أسبوعين', true),
    ];

    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bookmark_outline, size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
            const SizedBox(height: AppDimensions.md),
            Text('لا توجد وظائف محفوظة', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
              color: AppColors.textHint,
            )),
            const SizedBox(height: 4),
            Text('احفظ الوظائف التي تهمك لمتابعتها لاحقاً', style: const TextStyle(
              fontSize: 13, color: AppColors.textHint,
            )),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
      itemCount: jobs.length,
      itemBuilder: (context, index) {
        final job = jobs[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Row(
              children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(child: Text(job.company[0], style: const TextStyle(
                    fontFamily: AppTypography.arabicFontFamily,
                    fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary,
                  ))),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      )),
                      Text(job.company, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined, size: 12, color: AppColors.textHint),
                          const SizedBox(width: 2),
                          Text(job.location, style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
                          const SizedBox(width: 8),
                          Text(job.salary, style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    IconButton(
                      icon: Icon(
                        job.isSaved ? Icons.bookmark : Icons.bookmark_outline,
                        color: job.isSaved ? AppColors.accent : AppColors.textHint,
                      ),
                      onPressed: () {},
                      visualDensity: VisualDensity.compact,
                    ),
                    Text(job.date, style: const TextStyle(fontSize: 9, color: AppColors.textHint)),
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

class _SavedJob {
  final String title;
  final String company;
  final String location;
  final String salary;
  final String date;
  final bool isSaved;

  _SavedJob(this.title, this.company, this.location, this.salary, this.date, this.isSaved);
}
