import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class JobDetailScreen extends StatefulWidget {
  const JobDetailScreen({super.key});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppDimensions.md),
                child: Column(
                  children: [
                    _buildHeader(context),
                    const SizedBox(height: AppDimensions.md),
                    _buildCompanyCard(context),
                    const SizedBox(height: AppDimensions.md),
                    _buildTabBar(),
                    const SizedBox(height: AppDimensions.md),
                    if (_selectedTab == 0) _buildDescription(),
                    if (_selectedTab == 1) _buildRequirements(),
                    if (_selectedTab == 2) _buildAboutCompany(),
                  ],
                ),
              ),
            ),
            _buildBottomBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.lg),
      child: Column(
        children: [
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Center(
              child: Text('ت', style: TextStyle(
                fontFamily: AppTypography.arabicFontFamily,
                fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.primary,
              )),
            ),
          ),
          const SizedBox(height: AppDimensions.md),
          Text(
            'مطور Flutter',
            style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'شركة تقنيات الابتكار',
            style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppDimensions.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _InfoBadge(icon: Icons.location_on_outlined, label: 'طرابلس'),
              const SizedBox(width: 8),
              _InfoBadge(icon: Icons.work_outline, label: 'دوام كامل'),
              const SizedBox(width: 8),
              _InfoBadge(icon: Icons.school_outlined, label: 'مبتدئ'),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Column(
                children: [
                  Text('٣٠٠٠ - ٥٠٠٠', style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700, color: AppColors.accent,
                  )),
                  Text('LYD / شهرياً', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                ],
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
                child: Container(width: 1, height: 36, color: Colors.grey.withValues(alpha: 0.2)),
              ),
              Column(
                children: [
                  Container(
                    width: 52, height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: Text('٩٥٪', style: TextStyle(
                        fontFamily: AppTypography.arabicFontFamily,
                        fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.success,
                      )),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('نسبة التطابق', style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.background, borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.visibility_outlined, size: 16, color: AppColors.textHint),
                      const SizedBox(width: 4),
                      Text('١٢٠ مشاهدة', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.background, borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.people_outlined, size: 16, color: AppColors.textHint),
                      const SizedBox(width: 4),
                      Text('١٥ متقدم', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompanyCard(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(child: Text('ت', style: TextStyle(
              fontFamily: AppTypography.arabicFontFamily,
              fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary,
            ))),
          ),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('شركة تقنيات الابتكار', style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                )),
                Text('تقنية المعلومات - ٥١-٢٠٠ موظف', style: const TextStyle(
                  fontSize: 12, color: AppColors.textHint,
                )),
              ],
            ),
          ),
          const Icon(Icons.arrow_back_ios_new, size: 14, color: AppColors.textHint),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    final tabs = ['الوصف', 'المتطلبات', 'عن الشركة'];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: List.generate(tabs.length, (i) {
          final isSelected = _selectedTab == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTab = i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isSelected ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8, offset: const Offset(0, 2),
                    ),
                  ] : null,
                ),
                child: Text(
                  tabs[i],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: AppTypography.arabicFontFamily,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildDescription() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('وصف الوظيفة', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'نبحث عن مطور Flutter موهوب للانضمام إلى فريقنا المتميز في تطوير تطبيقات الجوال. '
            'ستعمل على بناء تطبيقات عالية الأداء باستخدام Flutter و Dart، '
            'والتعاون مع فريق التصميم لتقديم تجربة مستخدم استثنائية.',
            style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary, height: 1.7,
            ),
          ),
          const SizedBox(height: AppDimensions.md),
          Text('المسؤوليات:', style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          )),
          const SizedBox(height: AppDimensions.sm),
          ...['تطوير تطبيقات Flutter جديدة', 'صيانة وتحسين التطبيقات الحالية',
             'التعاون مع فريق التصميم', 'كتابة اختبارات وضمان الجودة',
             'المشاركة في مراجعة الكود'].map((r) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('• ', style: TextStyle(color: AppColors.accent)),
                Expanded(child: Text(r, style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary,
                ))),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRequirements() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('المتطلبات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: AppDimensions.sm),
          ...['خبرة سنتين على الأقل في Flutter', 'إجادة Dart ومفاهيم OOP',
             'معرفة Firebase و REST APIs', 'فهم مبادئ UI/UX',
             'إجادة استخدام Git', 'مهارات تواصل جيدة'].map((r) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_outline, size: 16, color: AppColors.success),
                const SizedBox(width: 8),
                Expanded(child: Text(r, style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary,
                ))),
              ],
            ),
          )),
          const SizedBox(height: AppDimensions.md),
          Text('المزايا:', style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          )),
          const SizedBox(height: AppDimensions.sm),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: ['راتب تنافسي', 'تأمين صحي', 'ساعات مرنة', 'تطوير مهني',
                       'بيئة عمل ممتازة', 'فريق شبابي']
                .map((b) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.15)),
                  ),
                  child: Text(b, style: const TextStyle(
                    fontSize: 12, color: AppColors.success, fontWeight: FontWeight.w500,
                  )),
                )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutCompany() {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('عن الشركة', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'شركة تقنيات الابتكار هي شركة رائدة في مجال تقنية المعلومات في ليبيا، '
            'تأسست عام ٢٠١٨ وتقدم حلولاً رقمية مبتكرة للشركات والمؤسسات.',
            style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary, height: 1.7,
            ),
          ),
          const SizedBox(height: AppDimensions.md),
          _CompanyInfoRow(icon: Icons.people_outlined, label: 'عدد الموظفين', value: '٥١-٢٠٠'),
          const Divider(height: 20),
          _CompanyInfoRow(icon: Icons.location_on_outlined, label: 'المقر', value: 'طرابلس'),
          const Divider(height: 20),
          _CompanyInfoRow(icon: Icons.calendar_today_outlined, label: 'تأسست', value: '٢٠١٨'),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.sm, AppDimensions.md, AppDimensions.lg),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
          top: BorderSide(color: Colors.grey.withValues(alpha: 0.1)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(14),
              ),
              child: IconButton(
                icon: const Icon(Icons.bookmark_outline),
                onPressed: () {},
              ),
            ),
            const SizedBox(width: AppDimensions.sm),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _showApplyDialog(context),
                icon: const Icon(Icons.send_outlined, size: 20),
                label: const Text('تقديم الطلب'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  foregroundColor: AppColors.textOnAccent,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showApplyDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: AppDimensions.lg,
          right: AppDimensions.lg,
          top: AppDimensions.lg,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + AppDimensions.lg,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تقديم طلب', style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              const SizedBox(height: AppDimensions.lg),
              Text('اختر السيرة الذاتية', style: AppTypography.arabicTextTheme.titleSmall),
              const SizedBox(height: AppDimensions.sm),
              _CvOption(title: 'السيرة الذاتية - عربي', isSelected: true),
              const SizedBox(height: AppDimensions.sm),
              _CvOption(title: 'السيرة الذاتية - إنجليزي', isSelected: false),
              const SizedBox(height: AppDimensions.md),
              Text('رسالة تغطية (اختياري)', style: AppTypography.arabicTextTheme.titleSmall),
              const SizedBox(height: AppDimensions.sm),
              TextField(
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'اكتب رسالة مختصرة...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: AppColors.background,
                ),
              ),
              const SizedBox(height: AppDimensions.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('إرسال الطلب'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoBadge({required this.icon, required this.label});

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
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _CompanyInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _CompanyInfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textHint),
        const SizedBox(width: AppDimensions.sm),
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        const Spacer(),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _CvOption extends StatelessWidget {
  final String title;
  final bool isSelected;

  const _CvOption({required this.title, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.accent.withValues(alpha: 0.05) : AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? AppColors.accent : Colors.grey.withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        children: [
          Icon(
            isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
            color: isSelected ? AppColors.accent : AppColors.textHint,
            size: 20,
          ),
          const SizedBox(width: AppDimensions.sm),
          Text(title, style: TextStyle(
            fontFamily: AppTypography.arabicFontFamily,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          )),
        ],
      ),
    );
  }
}
