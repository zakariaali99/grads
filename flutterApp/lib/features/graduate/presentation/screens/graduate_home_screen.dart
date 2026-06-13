import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/stats_card.dart';
import '../../../../shared/widgets/avatar_widget.dart';
import '../../../../shared/widgets/glass_card.dart';

class GraduateHomeScreen extends ConsumerStatefulWidget {
  const GraduateHomeScreen({super.key});

  @override
  ConsumerState<GraduateHomeScreen> createState() => _GraduateHomeScreenState();
}

class _GraduateHomeScreenState extends ConsumerState<GraduateHomeScreen> {
  final _mockJobs = List.generate(
    5,
    (i) => _MockJob(
      title: ['مطور Flutter', 'مهندس Backend', 'مصمم UI/UX', 'محلل بيانات', 'مهندس DevOps'][i],
      company: ['شركة تك', 'بنك الابتكار', 'مؤسسة رقمية', 'شركة حلول', 'منصة تعليم'][i],
      location: 'طرابلس',
      salary: '4000 - 6000 LYD',
      matchScore: [95, 88, 82, 76, 91][i],
      tags: ['مبتدئ', 'عن بعد', 'دوام كامل'][i % 3],
    ),
  );

  final _suggestedSkills = [
    _SuggestedSkill('Flutter', 95, 'مطلوب بشدة', true),
    _SuggestedSkill('Django', 82, 'مطلوب', false),
    _SuggestedSkill('UI/UX', 78, 'متزايد', false),
    _SuggestedSkill('数据分析', 88, 'مطلوب بشدة', false),
  ];

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
              _buildStatsRow(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('الوظائف المقترحة', 'عرض الكل'),
              const SizedBox(height: AppDimensions.sm),
              _buildRecommendedJobs(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('المهارات المقترحة', 'التفاصيل'),
              const SizedBox(height: AppDimensions.sm),
              _buildSuggestedSkills(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('النشاط الأخير', ''),
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
          const AvatarWidget(
            initials: 'أ',
            size: 56,
            isVerified: true,
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'أحمد علي',
                  style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'مطور تطبيقات Flutter',
                  style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle, size: 12, color: AppColors.success),
                    SizedBox(width: 4),
                    Text('مكتمل', style: TextStyle(fontSize: 11, color: AppColors.success)),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '70%',
                style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(
                  color: AppColors.accent,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: StatsCard(
            label: 'مشاهدات الملف',
            value: '١٢٤',
            icon: Icons.visibility_outlined,
            color: AppColors.info,
            change: 12,
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: StatsCard(
            label: 'طلبات التقديم',
            value: '٨',
            icon: Icons.description_outlined,
            color: AppColors.accent,
            change: -3,
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: StatsCard(
            label: 'مقابلات',
            value: '٣',
            icon: Icons.calendar_today_outlined,
            color: AppColors.secondary,
            change: 50,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title, String? action) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w700,
        )),
        if (action != null && action.isNotEmpty)
          TextButton(
            onPressed: () {},
            child: Text(action, style: const TextStyle(fontSize: 13)),
          ),
      ],
    );
  }

  Widget _buildRecommendedJobs() {
    return SizedBox(
      height: 200,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _mockJobs.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppDimensions.sm),
        itemBuilder: (context, index) {
          final job = _mockJobs[index];
          return _JobCard(job: job);
        },
      ),
    );
  }

  Widget _buildSuggestedSkills() {
    return Column(
      children: _suggestedSkills.map((skill) => _SkillTile(skill: skill)).toList(),
    );
  }

  Widget _buildActivityFeed() {
    final activities = [
      _Activity('تمت مشاهدة ملفك من قبل شركة تك', Icons.visibility_outlined, 'منذ ساعتين'),
      _Activity('تم تحديث حالة طلبك إلى "مراجعة"', Icons.update_outlined, 'منذ ٥ ساعات'),
      _Activity('وظيفة جديدة تناسب مهاراتك', Icons.work_outlined, 'منذ يوم'),
    ];

    return Column(
      children: activities.map((a) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(a.icon, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.title, style: AppTypography.arabicTextTheme.bodyMedium),
                    const SizedBox(height: 2),
                    Text(a.time, style: AppTypography.arabicTextTheme.bodySmall?.copyWith(
                      color: AppColors.textHint,
                    )),
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

class _MockJob {
  final String title;
  final String company;
  final String location;
  final String salary;
  final int matchScore;
  final String tags;

  _MockJob({
    required this.title,
    required this.company,
    required this.location,
    required this.salary,
    required this.matchScore,
    required this.tags,
  });
}

class _JobCard extends StatelessWidget {
  final _MockJob job;

  const _JobCard({required this.job});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        width: 260,
        padding: const EdgeInsets.all(AppDimensions.md),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          border: Border.all(
            color: Theme.of(context).dividerColor.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      job.company[0],
                      style: const TextStyle(
                        fontFamily: AppTypography.arabicFontFamily,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.title,
                        style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        job.company,
                        style: AppTypography.arabicTextTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          '${job.matchScore}%',
                          style: const TextStyle(
                            fontFamily: AppTypography.arabicFontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.accent,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                Icon(Icons.location_on_outlined, size: 14, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(job.location, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                const Spacer(),
                Icon(Icons.attach_money, size: 14, color: AppColors.textHint),
                const SizedBox(width: 2),
                Text(job.salary, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
              ],
            ),
            const SizedBox(height: AppDimensions.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                job.tags,
                style: const TextStyle(fontSize: 10, color: AppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SuggestedSkill {
  final String name;
  final int demand;
  final String label;
  final bool isOwned;

  _SuggestedSkill(this.name, this.demand, this.label, this.isOwned);
}

class _SkillTile extends StatelessWidget {
  final _SuggestedSkill skill;

  const _SkillTile({required this.skill});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.sm),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: skill.isOwned
                    ? AppColors.success.withValues(alpha: 0.1)
                    : AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                skill.isOwned ? Icons.check_circle_outline : Icons.lightbulb_outline,
                color: skill.isOwned ? AppColors.success : AppColors.warning,
                size: 20,
              ),
            ),
            const SizedBox(width: AppDimensions.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(skill.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  )),
                  Row(
                    children: [
                      Text('طلب في السوق: ${skill.demand}%',
                        style: const TextStyle(fontSize: 11, color: AppColors.textHint),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(skill.label,
                          style: const TextStyle(fontSize: 9, color: AppColors.warning),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_back_ios_new, size: 14, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}

class _Activity {
  final String title;
  final IconData icon;
  final String time;

  _Activity(this.title, this.icon, this.time);
}
