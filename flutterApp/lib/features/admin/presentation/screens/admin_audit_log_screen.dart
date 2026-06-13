import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/models/mock_data.dart';

class AdminAuditLogScreen extends StatelessWidget {
  const AdminAuditLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('سجل النشاطات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: mockAuditLog.length,
          itemBuilder: (context, index) {
            final entry = mockAuditLog[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassCard(
                padding: EdgeInsets.zero,
                child: ListTile(
                  leading: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: _actionColor(entry.action).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_actionIcon(entry.action), color: _actionColor(entry.action), size: 20),
                  ),
                  title: Text('${entry.action} - ${entry.targetName}', style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${entry.adminName} • ${entry.targetType}', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                      const SizedBox(height: 4),
                      Text(entry.details, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('${entry.timestamp.hour}:${entry.timestamp.minute.toString().padLeft(2, '0')}',
                        style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                      Text('${entry.timestamp.day}/${entry.timestamp.month}',
                        style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  IconData _actionIcon(String action) {
    switch (action) {
      case 'حظر مستخدم': return Icons.block;
      case 'تعديل': return Icons.edit;
      case 'إضافة': return Icons.add_circle_outline;
      case 'قبول توثيق': return Icons.check_circle_outline;
      case 'رفض توثيق': return Icons.cancel_outlined;
      case 'إعلان': return Icons.campaign_outlined;
      default: return Icons.info_outline;
    }
  }

  Color _actionColor(String action) {
    switch (action) {
      case 'حظر مستخدم': return AppColors.error;
      case 'تعديل': return AppColors.primary;
      case 'إضافة': return AppColors.success;
      case 'قبول توثيق': return AppColors.success;
      case 'رفض توثيق': return AppColors.error;
      case 'إعلان': return AppColors.warning;
      default: return AppColors.textHint;
    }
  }
}
