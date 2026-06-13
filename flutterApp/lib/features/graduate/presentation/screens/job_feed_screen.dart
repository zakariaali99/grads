import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class JobFeedScreen extends StatefulWidget {
  const JobFeedScreen({super.key});

  @override
  State<JobFeedScreen> createState() => _JobFeedScreenState();
}

class _JobFeedScreenState extends State<JobFeedScreen> {
  final _searchController = TextEditingController();
  int _selectedFilter = -1;

  final _filters = ['الكل', 'عن بعد', 'دوام كامل', 'دوام جزئي', 'متدرب'];
  final _jobs = List.generate(10, (i) => _JobData(
    title: ['مطور Flutter', 'مهندس Backend', 'مصمم UI/UX', 'محلل بيانات', 'مهندس DevOps',
            'مطور ويب', 'مسؤول أمن سيبراني', 'مهندس ذكاء اصطناعي', 'مدير مشروع', 'مختبر اختراق'][i],
    company: ['شركة تك', 'بنك الابتكار', 'مؤسسة رقمية', 'شركة حلول', 'منصة تعليم',
              'متجر إلكتروني', 'شركة أمن', 'مختبر AI', 'شركة استشارات', 'مركز تقنية'][i],
    location: ['طرابلس', 'بنغازي', 'عن بعد', 'مصراتة', 'طرابلس',
               'عن بعد', 'طرابلس', 'بنغازي', 'عن بعد', 'طرابلس'][i],
    salary: '4000 - 6000 LYD',
    matchScore: [95, 88, 82, 76, 91, 67, 45, 72, 55, 38][i],
    tags: ['مبتدئ', 'عن بعد', 'دوام كامل', 'خبرة', 'عن بعد',
           'مبتدئ', 'خبير', 'متقدم', 'متوسط', 'مبتدئ'][i],
    type: ['دوام كامل', 'دوام كامل', 'دوام كامل', 'دوام كامل', 'عن بعد',
            'دوام كامل', 'دوام كامل', 'دوام كامل', 'عن بعد', 'دوام جزئي'][i],
    postedAt: ['منذ ساعة', 'منذ ٣ ساعات', 'منذ يوم', 'منذ يومين', 'منذ ٥ ساعات',
               'منذ ٣ أيام', 'منذ أسبوع', 'منذ يوم', 'منذ ٤ ساعات', 'منذ أسبوعين'][i],
    isSaved: [false, true, false, false, true, false, false, false, true, false][i],
  ));

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildSearchBar(),
            _buildFilters(),
            Expanded(child: _buildJobList()),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, 0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'ابحث عن وظيفة...',
          prefixIcon: const Icon(Icons.search_outlined),
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.tune_outlined),
                onPressed: () => _showFilterSheet(),
              ),
            ],
          ),
          filled: true,
          fillColor: Theme.of(context).cardColor,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 8),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = isSelected ? -1 : index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.grey.withValues(alpha: 0.2),
                ),
              ),
              child: Center(
                child: Text(
                  _filters[index],
                  style: TextStyle(
                    fontFamily: AppTypography.arabicFontFamily,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildJobList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
      itemCount: _jobs.length,
      itemBuilder: (context, index) {
        final job = _jobs[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: GestureDetector(
              onTap: () => context.push('/graduate/jobs/detail'),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            job.company[0],
                            style: const TextStyle(
                              fontFamily: AppTypography.arabicFontFamily,
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(job.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            )),
                            Text(job.company, style: const TextStyle(
                              fontSize: 13, color: AppColors.textSecondary,
                            )),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            width: 46, height: 46,
                            decoration: BoxDecoration(
                              color: job.matchScore >= 80
                                  ? AppColors.success.withValues(alpha: 0.1)
                                  : job.matchScore >= 60
                                      ? AppColors.warning.withValues(alpha: 0.1)
                                      : AppColors.textHint.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                '${job.matchScore}%',
                                style: TextStyle(
                                  fontFamily: AppTypography.arabicFontFamily,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: job.matchScore >= 80
                                      ? AppColors.success
                                      : job.matchScore >= 60
                                          ? AppColors.warning
                                          : AppColors.textHint,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: Icon(
                          job.isSaved ? Icons.bookmark : Icons.bookmark_outline,
                          color: job.isSaved ? AppColors.accent : AppColors.textHint,
                          size: 22,
                        ),
                        onPressed: () {
                          setState(() => _jobs[index] = _jobs[index].copyWithSaved(!job.isSaved));
                        },
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: AppColors.textHint),
                      const SizedBox(width: 4),
                      Text(job.location, style: const TextStyle(fontSize: 12, color: AppColors.textHint)),
                      const SizedBox(width: AppDimensions.md),
                      Icon(Icons.attach_money, size: 14, color: AppColors.textHint),
                      const SizedBox(width: 4),
                      Text(job.salary, style: const TextStyle(fontSize: 12, color: AppColors.textHint)),
                      const Spacer(),
                      Text(job.postedAt, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(job.type, style: const TextStyle(
                          fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.w500,
                        )),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(job.tags, style: const TextStyle(
                          fontSize: 10, color: AppColors.accent, fontWeight: FontWeight.w500,
                        )),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(AppDimensions.lg),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تصفية متقدمة', style: AppTypography.arabicTextTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              )),
              const SizedBox(height: AppDimensions.lg),
              Text('نوع التوظيف', style: AppTypography.arabicTextTheme.titleSmall),
              const SizedBox(height: AppDimensions.sm),
              Wrap(
                spacing: 8,
                children: ['دوام كامل', 'دوام جزئي', 'عن بعد', 'مستقل', 'تدريب']
                    .map((t) => FilterChip(
                      label: Text(t),
                      selected: false,
                      onSelected: (_) {},
                    ))
                    .toList(),
              ),
              const SizedBox(height: AppDimensions.md),
              Text('مستوى الخبرة', style: AppTypography.arabicTextTheme.titleSmall),
              const SizedBox(height: AppDimensions.sm),
              Wrap(
                spacing: 8,
                children: ['مبتدئ', 'متوسط', 'خبير', 'مدير']
                    .map((l) => FilterChip(
                      label: Text(l),
                      selected: false,
                      onSelected: (_) {},
                    ))
                    .toList(),
              ),
              const SizedBox(height: AppDimensions.md),
              Text('نطاق الراتب', style: AppTypography.arabicTextTheme.titleSmall),
              const SizedBox(height: AppDimensions.sm),
              RangeSlider(
                values: const RangeValues(1000, 10000),
                min: 0,
                max: 20000,
                divisions: 20,
                labels: const RangeLabels('1000', '10000'),
                onChanged: (_) {},
              ),
              const SizedBox(height: AppDimensions.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('تطبيق الفلتر'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _JobData {
  final String title;
  final String company;
  final String location;
  final String salary;
  final int matchScore;
  final String tags;
  final String type;
  final String postedAt;
  final bool isSaved;

  _JobData({
    required this.title,
    required this.company,
    required this.location,
    required this.salary,
    required this.matchScore,
    required this.tags,
    required this.type,
    required this.postedAt,
    required this.isSaved,
  });

  _JobData copyWithSaved(bool saved) => _JobData(
    title: title, company: company, location: location,
    salary: salary, matchScore: matchScore, tags: tags,
    type: type, postedAt: postedAt, isSaved: saved,
  );
}
