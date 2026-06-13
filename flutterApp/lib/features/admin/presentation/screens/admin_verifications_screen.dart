import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../data/models/admin_models.dart';
import '../../data/models/mock_data.dart';

class AdminVerificationsScreen extends StatefulWidget {
  const AdminVerificationsScreen({super.key});

  @override
  State<AdminVerificationsScreen> createState() => _AdminVerificationsScreenState();
}

class _AdminVerificationsScreenState extends State<AdminVerificationsScreen> {
  String _selectedTab = 'pending';
  final _tabs = ['pending', 'approved', 'rejected'];

  @override
  Widget build(BuildContext context) {
    final filtered = mockVerifications.where((v) => v.status == _selectedTab).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, AppDimensions.sm),
              child: Text('طلبات التوثيق', style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            ),
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: _tabs.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final tab = _tabs[index];
                  final isSelected = _selectedTab == tab;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedTab = tab),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.primary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        tab == 'pending' ? 'قيد الانتظار' : tab == 'approved' ? 'مقبول' : 'مرفوض',
                        style: TextStyle(
                          fontFamily: AppTypography.arabicFontFamily,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            Expanded(
              child: filtered.isEmpty
                  ? const Center(child: EmptyState(icon: Icons.verified_outlined, title: 'لا توجد طلبات', subtitle: 'لا توجد طلبات توثيق في هذه الفئة'))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final req = filtered[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: GlassCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 18,
                                      backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                      child: Text(req.userName[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(req.userName, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                                          Text(req.userEmail, style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _tabColor(req.status).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(req.status == 'pending' ? 'قيد الانتظار' : req.status == 'approved' ? 'مقبول' : 'مرفوض',
                                        style: TextStyle(fontSize: 11, color: _tabColor(req.status))),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    Icon(Icons.description_outlined, size: 16, color: AppColors.textHint),
                                    const SizedBox(width: 6),
                                    Text(req.documentType, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                                    const Spacer(),
                                    Icon(Icons.calendar_today, size: 14, color: AppColors.textHint),
                                    const SizedBox(width: 4),
                                    Text('${req.submittedDate.day}/${req.submittedDate.month}/${req.submittedDate.year}',
                                      style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                                  ],
                                ),
                                if (req.reviewedDate != null) ...[
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Icon(Icons.check_circle_outline, size: 16, color: AppColors.textHint),
                                      const SizedBox(width: 6),
                                      Text('تمت المراجعة: ${req.reviewedDate!.day}/${req.reviewedDate!.month}/${req.reviewedDate!.year}',
                                        style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                                    ],
                                  ),
                                ],
                                if (req.reviewerNotes != null) ...[
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.background,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Icon(Icons.notes, size: 14, color: AppColors.textHint),
                                        const SizedBox(width: 6),
                                        Expanded(child: Text(req.reviewerNotes!, style: TextStyle(fontSize: 12, color: AppColors.textSecondary))),
                                      ],
                                    ),
                                  ),
                                ],
                                if (req.status == 'pending') ...[
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => _showConfirmation(req, 'approved'),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 10),
                                            decoration: BoxDecoration(
                                              color: AppColors.success.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text('قبول', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600, fontFamily: AppTypography.arabicFontFamily)),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => _showRejectionDialog(req),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 10),
                                            decoration: BoxDecoration(
                                              color: AppColors.error.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text('رفض', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600, fontFamily: AppTypography.arabicFontFamily)),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
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

  void _showConfirmation(VerificationRequest req, String newStatus) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(newStatus == 'approved' ? 'تأكيد القبول' : 'تأكيد الرفض', style: AppTypography.arabicTextTheme.titleMedium),
        content: Text('هل أنت متأكد من ${newStatus == 'approved' ? 'قبول' : 'رفض'} طلب توثيق ${req.userName}؟',
          style: TextStyle(fontFamily: AppTypography.arabicFontFamily)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () { Navigator.pop(ctx); setState(() {}); },
            child: Text(newStatus == 'approved' ? 'قبول' : 'رفض',
              style: TextStyle(color: newStatus == 'approved' ? AppColors.success : AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showRejectionDialog(VerificationRequest req) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('سبب الرفض', style: AppTypography.arabicTextTheme.titleMedium),
        content: TextField(
          controller: controller,
          textDirection: TextDirection.rtl,
          decoration: InputDecoration(
            hintText: 'اكتب سبب الرفض...',
            hintTextDirection: TextDirection.rtl,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () { Navigator.pop(ctx); setState(() {}); },
            child: Text('رفض', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  Color _tabColor(String status) {
    switch (status) {
      case 'pending': return AppColors.warning;
      case 'approved': return AppColors.success;
      case 'rejected': return AppColors.error;
      default: return AppColors.textHint;
    }
  }
}
