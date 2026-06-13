import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class AdminSettingsScreen extends StatelessWidget {
  const AdminSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final divider = Theme.of(context).dividerColor.withValues(alpha: 0.1);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('الإعدادات', style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppDimensions.md),
              Text('إدارة البيانات الأساسية', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppDimensions.sm),
              GlassCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _settingsItem(context, Icons.code_outlined, 'المهارات', 'إدارة المهارات المتاحة', '/admin/settings/skills'),
                    Divider(height: 1, indent: 56, color: divider),
                    _settingsItem(context, Icons.school_outlined, 'الكليات', 'إدارة قائمة الكليات', '/admin/settings/colleges'),
                    Divider(height: 1, indent: 56, color: divider),
                    _settingsItem(context, Icons.category_outlined, 'التصنيفات', 'إدارة تصنيفات الوظائف', '/admin/settings/categories'),
                  ],
                ),
              ),
              const SizedBox(height: AppDimensions.md),
              Text('النظام', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppDimensions.sm),
              GlassCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _settingsItem(context, Icons.campaign_outlined, 'الإعلانات', 'إدارة إعلانات المنصة', '/admin/settings/announcements'),
                    Divider(height: 1, indent: 56, color: divider),
                    _settingsItem(context, Icons.history_outlined, 'سجل النشاطات', 'عرض سجل إجراءات المشرفين', '/admin/settings/audit-log'),
                    Divider(height: 1, indent: 56, color: divider),
                    _settingsItem(context, Icons.assessment_outlined, 'التقارير', 'تقارير وإحصائيات المنصة', ''),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _settingsItem(BuildContext context, IconData icon, String title, String subtitle, String route) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: AppColors.textHint)),
      trailing: const Icon(Icons.chevron_left, size: 20, color: AppColors.textHint),
      onTap: route.isNotEmpty ? () => context.push(route) : null,
    );
  }
}
