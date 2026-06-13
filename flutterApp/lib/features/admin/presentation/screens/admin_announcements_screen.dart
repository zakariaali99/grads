import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/models/admin_models.dart';
import '../../data/models/mock_data.dart';

class AdminAnnouncementsScreen extends StatefulWidget {
  const AdminAnnouncementsScreen({super.key});

  @override
  State<AdminAnnouncementsScreen> createState() => _AdminAnnouncementsScreenState();
}

class _AdminAnnouncementsScreenState extends State<AdminAnnouncementsScreen> {
  late List<Announcement> _announcements;

  @override
  void initState() {
    super.initState();
    _announcements = List.from(mockAnnouncements);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('الإعلانات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: _showCreateDialog)],
      ),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: _announcements.length,
          itemBuilder: (context, index) {
            final ann = _announcements[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(ann.title, style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: ann.isPublished ? AppColors.success.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(ann.isPublished ? 'منشور' : 'مسودة', style: TextStyle(fontSize: 11, color: ann.isPublished ? AppColors.success : AppColors.warning)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(ann.body, style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.swap_horiz, size: 14, color: AppColors.textHint),
                        const SizedBox(width: 4),
                        Text(_targetLabel(ann.targetRole), style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                        const Spacer(),
                        Icon(Icons.access_time, size: 14, color: AppColors.textHint),
                        const SizedBox(width: 4),
                        Text('${ann.createdAt.day}/${ann.createdAt.month}/${ann.createdAt.year}', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showCreateDialog() {
    final titleController = TextEditingController();
    final bodyController = TextEditingController();
    String target = 'all';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('إعلان جديد', style: AppTypography.arabicTextTheme.titleMedium),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                textDirection: TextDirection.rtl,
                decoration: InputDecoration(
                  labelText: 'العنوان',
                  labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: bodyController,
                textDirection: TextDirection.rtl,
                decoration: InputDecoration(
                  labelText: 'المحتوى',
                  labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                maxLines: 4,
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: target,
                decoration: InputDecoration(
                  labelText: 'المستهدف',
                  labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('الجميع')),
                  DropdownMenuItem(value: 'graduate', child: Text('الخريجين')),
                  DropdownMenuItem(value: 'employer', child: Text('أصحاب العمل')),
                  DropdownMenuItem(value: 'institution', child: Text('المؤسسات')),
                ],
                onChanged: (v) => target = v ?? 'all',
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              if (titleController.text.isNotEmpty && bodyController.text.isNotEmpty) {
                setState(() {
                  _announcements.insert(0, Announcement(
                    id: '${_announcements.length + 1}',
                    title: titleController.text,
                    body: bodyController.text,
                    targetRole: target,
                    createdAt: DateTime.now(),
                    isPublished: true,
                  ));
                });
                Navigator.pop(ctx);
              }
            },
            child: Text('نشر', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  String _targetLabel(String target) {
    switch (target) {
      case 'all': return 'الجميع';
      case 'graduate': return 'الخريجين';
      case 'employer': return 'أصحاب العمل';
      case 'institution': return 'المؤسسات';
      default: return target;
    }
  }
}
