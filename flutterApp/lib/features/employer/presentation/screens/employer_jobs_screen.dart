import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class EmployerJobsScreen extends StatefulWidget {
  const EmployerJobsScreen({super.key});

  @override
  State<EmployerJobsScreen> createState() => _EmployerJobsScreenState();
}

class _EmployerJobsScreenState extends State<EmployerJobsScreen> {
  int _selectedFilter = 0;
  final _filters = ['الكل', 'نشط', 'متوقف', 'مغلق', 'مسودة'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('الوظائف', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
                  FloatingActionButton.small(
                    onPressed: () {},
                    backgroundColor: AppColors.accent,
                    child: const Icon(Icons.add, color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            _buildFilters(),
            Expanded(child: _buildJobList()),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.background,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(child: Text(_filters[index], style: TextStyle(
                fontSize: 13, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ))),
            ),
          );
        },
      ),
    );
  }

  Widget _buildJobList() {
    final jobs = [
      _EmployerJob('مطور Flutter', 'نشط', AppColors.success, '٢٤ متقدم', 'منشورة منذ ٣ أيام', true),
      _EmployerJob('مهندس Backend', 'نشط', AppColors.success, '١٥ متقدم', 'منشورة منذ أسبوع', true),
      _EmployerJob('مصمم UI/UX', 'متوقف', AppColors.warning, '١٢ متقدم', 'تم الإيقاف منذ يومين', false),
      _EmployerJob('محلل بيانات', 'مغلق', AppColors.error, '٣٠ متقدم', 'تم الإغلاق منذ أسبوع', false),
      _EmployerJob('مسؤول أمن سيبراني', 'مسودة', AppColors.textHint, '٠ متقدم', 'لم تنشر بعد', false),
    ];
    return ListView.builder(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: jobs.length,
      itemBuilder: (context, index) {
        final job = jobs[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(job.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                          Text(job.date, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: job.statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(job.status, style: TextStyle(fontSize: 12, color: job.statusColor, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.sm),
                Row(
                  children: [
                    _StatChip(icon: Icons.people_outlined, label: job.applicants),
                    const SizedBox(width: AppDimensions.md),
                    _StatChip(icon: Icons.visibility_outlined, label: '١٢٠ مشاهدة'),
                    const Spacer(),
                    if (job.isActive)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _QuickAction(icon: Icons.edit_outlined, color: AppColors.info),
                          const SizedBox(width: 4),
                          _QuickAction(icon: Icons.pause_circle_outlined, color: AppColors.warning),
                          const SizedBox(width: 4),
                          _QuickAction(icon: Icons.close_outlined, color: AppColors.error),
                        ],
                      )
                    else
                      _QuickAction(icon: Icons.refresh_outlined, color: AppColors.accent),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _EmployerJob {
  final String title; final String status; final Color statusColor;
  final String applicants; final String date; final bool isActive;
  _EmployerJob(this.title, this.status, this.statusColor, this.applicants, this.date, this.isActive);
}

class _StatChip extends StatelessWidget {
  final IconData icon; final String label;
  const _StatChip({required this.icon, required this.label});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textHint),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
      ],
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon; final Color color;
  const _QuickAction({required this.icon, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, size: 16, color: color),
    );
  }
}
