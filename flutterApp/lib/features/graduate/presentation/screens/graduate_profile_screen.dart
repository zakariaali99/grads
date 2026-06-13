import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatar_widget.dart';
import '../../../../shared/widgets/glass_card.dart';

class GraduateProfileScreen extends StatelessWidget {
  const GraduateProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            children: [
              _buildProfileHeader(context),
              const SizedBox(height: AppDimensions.md),
              _buildQuickActions(context),
              const SizedBox(height: AppDimensions.md),
              _buildAboutSection(),
              const SizedBox(height: AppDimensions.md),
              _buildEducationSection(),
              const SizedBox(height: AppDimensions.md),
              _buildExperienceSection(),
              const SizedBox(height: AppDimensions.md),
              _buildSkillsSection(),
              const SizedBox(height: AppDimensions.md),
              _buildCertificationsSection(),
              const SizedBox(height: AppDimensions.xxl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.lg),
      child: Column(
        children: [
          const AvatarWidget(
            initials: 'أ',
            size: 80,
            isVerified: true,
          ),
          const SizedBox(height: AppDimensions.md),
          Text(
            'أحمد علي محمد',
            style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'مطور تطبيقات Flutter | مهندس برمجيات',
            style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppDimensions.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _InfoChip(icon: Icons.location_on_outlined, label: 'طرابلس'),
              const SizedBox(width: AppDimensions.sm),
              _InfoChip(icon: Icons.school_outlined, label: 'جامعة طرابلس'),
              const SizedBox(width: AppDimensions.sm),
              _InfoChip(icon: Icons.calendar_today_outlined, label: '2024'),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Row(
            children: [
              Expanded(
                child: _ProfileStat(label: 'المشاهدات', value: '١٢٤'),
              ),
              Container(width: 1, height: 32, color: Colors.grey.withValues(alpha: 0.2)),
              Expanded(
                child: _ProfileStat(label: 'التقديمات', value: '٨'),
              ),
              Container(width: 1, height: 32, color: Colors.grey.withValues(alpha: 0.2)),
              Expanded(
                child: _ProfileStat(label: 'التواجد', value: '٩٢%'),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => context.push('/graduate/profile/edit'),
              icon: const Icon(Icons.edit_outlined, size: 18),
              label: const Text('تعديل الملف الشخصي'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            icon: Icons.upload_file_outlined,
            label: 'رفع سيرة ذاتية',
            color: AppColors.accent,
            onTap: () {},
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: _ActionCard(
            icon: Icons.share_outlined,
            label: 'مشاركة الملف',
            color: AppColors.info,
            onTap: () {},
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: _ActionCard(
            icon: Icons.download_outlined,
            label: 'تصدير PDF',
            color: AppColors.success,
            onTap: () {},
          ),
        ),
      ],
    );
  }

  Widget _buildAboutSection() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('نبذة عني', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'مطور تطبيقات Flutter بخبرة سنتين في بناء تطبيقات متعددة المنصات. '
            'أعمل على تصميم وتطوير تطبيقات عالية الأداء باستخدام أحدث تقنيات Flutter و Dart. '
            'لدي شغف بتجربة المستخدم وتصميم واجهات جذابة.',
            style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEducationSection() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('التعليم', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          _TimelineItem(
            title: 'بكالوريوس هندسة برمجيات',
            subtitle: 'جامعة طرابلس',
            period: '2020 - 2024',
            trailing: '3.5',
          ),
        ],
      ),
    );
  }

  Widget _buildExperienceSection() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('الخبرات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          _TimelineItem(
            title: 'مطور Flutter',
            subtitle: 'شركة تقنيات الابتكار',
            period: '2023 - الآن',
            trailing: 'دوام كامل',
          ),
          const Divider(height: 24),
          _TimelineItem(
            title: 'متدرب تطوير تطبيقات',
            subtitle: 'مركز الحاسوب',
            period: '2022 - 2023',
            trailing: 'تدريب',
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsSection() {
    final skills = ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git', 'UI/UX', 'Python', 'SQL'];
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('المهارات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              TextButton(
                onPressed: () {},
                child: const Text('تحليل المهارات', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: skills.map((s) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
              ),
              child: Text(s, style: const TextStyle(
                fontFamily: AppTypography.arabicFontFamily,
                fontSize: 13,
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              )),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificationsSection() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('الشهادات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          _TimelineItem(
            title: 'Flutter & Dart - The Complete Guide',
            subtitle: 'Udemy',
            period: '2023',
            trailing: 'معتمد',
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textHint),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final String label;
  final String value;

  const _ProfileStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
        )),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppDimensions.md),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(
              fontFamily: AppTypography.arabicFontFamily,
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w500,
            )),
          ],
        ),
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String period;
  final String? trailing;

  const _TimelineItem({
    required this.title,
    required this.subtitle,
    required this.period,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 8,
          height: 8,
          margin: const EdgeInsets.only(top: 6),
          decoration: const BoxDecoration(
            color: AppColors.accent,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              )),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(
                fontSize: 13, color: AppColors.textSecondary,
              )),
              const SizedBox(height: 2),
              Text(period, style: const TextStyle(
                fontSize: 11, color: AppColors.textHint,
              )),
            ],
          ),
        ),
        if (trailing != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(trailing!, style: const TextStyle(
              fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w500,
            )),
          ),
      ],
    );
  }
}
