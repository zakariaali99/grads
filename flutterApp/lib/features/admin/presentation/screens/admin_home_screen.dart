import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/stats_card.dart';
import '../../data/models/mock_data.dart';

Color _severityColor(String severity) {
  switch (severity) {
    case 'critical': return AppColors.error;
    case 'high': return Colors.orange;
    case 'medium': return Colors.amber;
    default: return AppColors.warning;
  }
}

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pendingVerifications = mockVerifications.where((v) => v.status == 'pending').length;
    final activeAlerts = mockFraudAlerts.where((a) => !a.isResolved).length;
    final reportedContent = 12;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('لوحة التحكم', style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppDimensions.sm),
              Text('نظرة عامة على المنصة', style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(color: AppColors.textHint)),
              const SizedBox(height: AppDimensions.md),
              _buildKpiRow(pendingVerifications, activeAlerts, reportedContent),
              const SizedBox(height: AppDimensions.md),
              _buildFraudAlertsSection(),
              const SizedBox(height: AppDimensions.md),
              _buildRecentUsersSection(context),
              const SizedBox(height: AppDimensions.md),
              _buildSystemOverview(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKpiRow(int pendingVerifications, int activeAlerts, int reportedContent) {
    return Row(
      children: [
        Expanded(child: StatsCard(icon: Icons.verified_outlined, value: '$pendingVerifications', label: 'طلبات التوثيق', change: 2.0)),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: StatsCard(icon: Icons.warning_amber_outlined, value: '$activeAlerts', label: 'تنبيهات نشطة', change: -1.0)),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: StatsCard(icon: Icons.flag_outlined, value: '$reportedContent', label: 'بلاغات', change: 3.0)),
      ],
    );
  }

  Widget _buildFraudAlertsSection() {
    final alerts = mockFraudAlerts.where((a) => !a.isResolved).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 20),
            const SizedBox(width: 8),
            Text('تنبيهات الاحتيال', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: AppDimensions.sm),
        ...alerts.map((alert) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.sm),
            child: Row(
              children: [
                Container(
                  width: 4, height: 48,
                  decoration: BoxDecoration(
                    color: _severityColor(alert.severity),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(alert.type, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: _severityColor(alert.severity).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(alert.severity, style: TextStyle(fontSize: 10, color: _severityColor(alert.severity))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(alert.description, style: AppTypography.arabicTextTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                      if (alert.userName.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text('المستخدم: ${alert.userName}', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildRecentUsersSection(BuildContext context) {
    final recent = mockUsers.take(4).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('أحدث المستخدمين', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: AppDimensions.sm),
        GlassCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: recent.map((user) => ListTile(
              leading: CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                child: Text(user.name[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ),
              title: Text(user.name, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
              subtitle: Text('${user.email} • ${_roleLabel(user.role)}', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: user.status == 'active' ? AppColors.success.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(user.status == 'active' ? 'نشط' : 'معلق', style: TextStyle(fontSize: 11, color: user.status == 'active' ? AppColors.success : AppColors.warning)),
              ),
            )).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildSystemOverview(BuildContext context) {
    final divider = Theme.of(context).dividerColor;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('إحصائيات النظام', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: AppDimensions.sm),
        GlassCard(
          child: Column(
            children: [
              _statRow('إجمالي المستخدمين', '١٬٢٤٣', Icons.people_outline),
              Divider(height: 1, color: divider.withValues(alpha: 0.1)),
              _statRow('الوظائف النشطة', '٨٩', Icons.work_outline),
              Divider(height: 1, color: divider.withValues(alpha: 0.1)),
              _statRow('طلبات التوثيق', '٣٤', Icons.verified_outlined),
              Divider(height: 1, color: divider.withValues(alpha: 0.1)),
              _statRow('الشركات المسجلة', '٥٦', Icons.business_outlined),
              Divider(height: 1, color: divider.withValues(alpha: 0.1)),
              _statRow('المؤسسات التعليمية', '٢٣', Icons.school_outlined),
            ],
          ),
        ),
      ],
    );
  }

  Widget _statRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Text(label, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          const Spacer(),
          Text(value, style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'graduate': return 'خريج';
      case 'employer': return 'صاحب عمل';
      case 'institution': return 'مؤسسة';
      case 'admin': return 'مشرف';
      default: return role;
    }
  }
}
