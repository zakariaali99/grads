import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final conversations = [
      _Conversation('سارة محمد', 'مهندس Backend', 'تمام، هتوفرلك الملفات المطلوبة', 'منذ دقيقة', true, true),
      _Conversation('خالد عمر', 'مصمم UI/UX', 'شكراً جزيلاً على المقابلة', 'منذ ساعة', false, false),
      _Conversation('نورة أحمد', 'محلل بيانات', 'تم استلام طلبك وسيتم المراجعة', 'منذ ٣ ساعات', false, true),
      _Conversation('أحمد علي', 'مطور Flutter', 'موعد المقابلة يوم الأحد الساعة ١٠ صباحاً', 'منذ ٥ ساعات', true, false),
      _Conversation('عمر حسن', 'مهندس DevOps', 'بالتوفيق في مشوارك المهني', 'منذ يوم', false, false),
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
                  Text('المحادثات', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.mark_email_read_outlined, size: 16, color: AppColors.accent),
                        SizedBox(width: 4),
                        Text('تحديد الكل مقروء', style: TextStyle(fontSize: 11, color: AppColors.accent)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'ابحث في المحادثات...',
                  prefixIcon: const Icon(Icons.search_outlined),
                  filled: true,
                  fillColor: Theme.of(context).cardColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: conversations.length,
                itemBuilder: (context, index) {
                  final c = conversations[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                    child: GlassCard(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      child: GestureDetector(
                        onTap: () => context.push('/chat/conversation'),
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                Container(
                                  width: 52, height: 52,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Center(child: Text(c.name[0], style: const TextStyle(
                                    fontFamily: AppTypography.arabicFontFamily,
                                    fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary,
                                  ))),
                                ),
                                if (c.isOnline)
                                  Positioned(
                                    bottom: 2, right: 2,
                                    child: Container(
                                      width: 12, height: 12,
                                      decoration: BoxDecoration(
                                        color: AppColors.success,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 2),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(width: AppDimensions.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(c.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                                        fontWeight: c.isUnread ? FontWeight.w700 : FontWeight.w500,
                                      )),
                                      Text(c.time, style: TextStyle(
                                        fontSize: 11, color: c.isUnread ? AppColors.accent : AppColors.textHint,
                                        fontWeight: c.isUnread ? FontWeight.w600 : FontWeight.w400,
                                      )),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(c.role, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(c.lastMessage, style: TextStyle(
                                          fontSize: 13,
                                          color: c.isUnread ? AppColors.textPrimary : AppColors.textHint,
                                          fontWeight: c.isUnread ? FontWeight.w500 : FontWeight.w400,
                                        ), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      ),
                                      if (c.isUnread)
                                        Container(
                                          width: 8, height: 8,
                                          decoration: const BoxDecoration(
                                            color: AppColors.accent, shape: BoxShape.circle,
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
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

class _Conversation {
  final String name; final String role; final String lastMessage;
  final String time; final bool isUnread; final bool isOnline;
  _Conversation(this.name, this.role, this.lastMessage, this.time, this.isUnread, this.isOnline);
}
