import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class CvManagementScreen extends StatefulWidget {
  const CvManagementScreen({super.key});

  @override
  State<CvManagementScreen> createState() => _CvManagementScreenState();
}

class _CvManagementScreenState extends State<CvManagementScreen> {
  int _selectedCvIndex = 0;

  final _cvs = [
    _CvData('السيرة الذاتية - عربي', 'ar', 'تم الرفع', 'تم التحليل', 85, true),
    _CvData('السيرة الذاتية - إنجليزي', 'en', 'تم الرفع', 'في الانتظار', 0, false),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('السيرة الذاتية')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCvList(),
              const SizedBox(height: AppDimensions.lg),
              _buildUploadSection(),
              const SizedBox(height: AppDimensions.lg),
              if (_cvs[_selectedCvIndex].isParsed)
                _buildParsedData(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCvList() {
    return Column(
      children: List.generate(_cvs.length, (index) {
        final cv = _cvs[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Row(
              children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: cv.isDefault
                        ? AppColors.accent.withValues(alpha: 0.1)
                        : AppColors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.description_outlined,
                    color: cv.isDefault ? AppColors.accent : AppColors.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(cv.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      )),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          _StatusBadge(
                            label: cv.status,
                            color: cv.status == 'تم الرفع' ? AppColors.success : AppColors.warning,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            cv.language == 'ar' ? 'عربي' : 'English',
                            style: const TextStyle(fontSize: 11, color: AppColors.textHint),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    if (cv.isParsed)
                      GestureDetector(
                        onTap: () => setState(() => _selectedCvIndex = index),
                        child: Container(
                          width: 24, height: 24,
                          decoration: BoxDecoration(
                            color: _selectedCvIndex == index
                                ? AppColors.accent
                                : Colors.transparent,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: _selectedCvIndex == index
                                  ? AppColors.accent
                                  : AppColors.textHint,
                            ),
                          ),
                          child: _selectedCvIndex == index
                              ? const Icon(Icons.check, color: Colors.white, size: 16)
                              : null,
                        ),
                      ),
                    const SizedBox(height: 4),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                      onPressed: () {},
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildUploadSection() {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.lg),
      child: Column(
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.upload_file_outlined, size: 32, color: AppColors.accent),
          ),
          const SizedBox(height: AppDimensions.md),
          Text('رفع سيرة ذاتية جديدة', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          )),
          const SizedBox(height: 4),
          Text(
            'PDF أو Word - الحد الأقصى 10MB',
            style: AppTypography.arabicTextTheme.bodySmall?.copyWith(color: AppColors.textHint),
          ),
          const SizedBox(height: AppDimensions.md),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.cloud_upload_outlined, size: 20),
              label: const Text('اختيار ملف'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParsedData() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('بيانات السيرة المستخرجة', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('دقة ٨٥٪', style: TextStyle(
                  fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w500,
                )),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          _ParsedRow(label: 'الاسم', value: 'أحمد علي محمد'),
          const Divider(height: 20),
          _ParsedRow(label: 'البريد', value: 'ahmed@example.com'),
          const Divider(height: 20),
          _ParsedRow(label: 'الهاتف', value: '+218 91 234 5678'),
          const Divider(height: 20),
          _ParsedRow(label: 'المهارات', value: 'Flutter, Dart, Firebase, Git'),
          const Divider(height: 20),
          _ParsedRow(label: 'الخبرة', value: 'سنتين كـ Flutter Developer'),
        ],
      ),
    );
  }
}

class _CvData {
  final String title;
  final String language;
  final String status;
  final String parseStatus;
  final int parseAccuracy;
  final bool isDefault;

  _CvData(this.title, this.language, this.status, this.parseStatus, this.parseAccuracy, this.isDefault);

  bool get isParsed => parseStatus == 'تم التحليل';
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w500)),
    );
  }
}

class _ParsedRow extends StatelessWidget {
  final String label;
  final String value;

  const _ParsedRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 60,
          child: Text(label, style: const TextStyle(
            fontSize: 12, color: AppColors.textHint, fontWeight: FontWeight.w500,
          )),
        ),
        Expanded(
          child: Text(value, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          )),
        ),
      ],
    );
  }
}
