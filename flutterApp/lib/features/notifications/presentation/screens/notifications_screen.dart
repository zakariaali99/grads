import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      _NotifData(Icons.favorite, 'أعجب بمنشورك', 'أعجب خالد عمر بمنشورك', 'منذ دقيقة', AppColors.accent, false),
      _NotifData(Icons.chat_bubble_outline, 'تعليق جديد', 'علقت سارة محمد على منشورك', 'منذ ١٠ دقائق', AppColors.info, false),
      _NotifData(Icons.work_outline, 'تحديث وظيفة', 'تم تحديث حالة طلبك إلى مقابلة', 'منذ ساعة', AppColors.secondary, false),
      _NotifData(Icons.people_outline, 'متابعة جديدة', 'تابعك عمر حسن', 'منذ ساعتين', AppColors.success, true),
      _NotifData(Icons.check_circle, 'تم التحقق', 'تم توثيق حسابك بنجاح 🎉', 'منذ ٣ ساعات', AppColors.success, true),
      _NotifData(Icons.calendar_today_outlined, 'تذكير مقابلة', 'مقابلتك بعد غد الساعة ١٠ صباحاً', 'منذ ٥ ساعات', AppColors.warning, true),
      _NotifData(Icons.visibility_outlined, 'مشاهدة ملف', 'شاهدت شركة تك ملفك الشخصي', 'منذ يوم', AppColors.info, true),
      _NotifData(Icons.system_update_outlined, 'تحديث النظام', 'تم إضافة ميزة جديدة للمنصة', 'منذ يومين', AppColors.textHint, true),
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('الإشعارات', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
                  TextButton(
                    onPressed: () {},
                    child: const Text('تحديد الكل مقروء', style: TextStyle(fontSize: 13)),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              child: Row(
                children: [
                  _FilterChip(label: 'الكل', isSelected: true),
                  const SizedBox(width: 8),
                  _FilterChip(label: 'غير مقروء', isSelected: false),
                  const SizedBox(width: 8),
                  _FilterChip(label: 'التفاعلات', isSelected: false),
                  const SizedBox(width: 8),
                  _FilterChip(label: 'الوظائف', isSelected: false),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final n = notifications[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                    child: GlassCard(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: n.color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(n.icon, color: n.color, size: 22),
                          ),
                          const SizedBox(width: AppDimensions.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(n.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                                      fontWeight: n.isRead ? FontWeight.w500 : FontWeight.w700,
                                    )),
                                    Row(
                                      children: [
                                        Text(n.time, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                                        if (!n.isRead) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            width: 8, height: 8,
                                            decoration: const BoxDecoration(
                                              color: AppColors.accent, shape: BoxShape.circle,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(n.body, style: TextStyle(
                                  fontSize: 13, color: n.isRead ? AppColors.textHint : AppColors.textSecondary,
                                )),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotifData {
  final IconData icon; final String title; final String body;
  final String time; final Color color; final bool isRead;
  _NotifData(this.icon, this.title, this.body, this.time, this.color, this.isRead);
}

class _FilterChip extends StatelessWidget {
  final String label; final bool isSelected;
  const _FilterChip({required this.label, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primary : AppColors.background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: TextStyle(
        fontSize: 12, fontWeight: FontWeight.w500,
        color: isSelected ? Colors.white : AppColors.textSecondary,
      )),
    );
  }
}
