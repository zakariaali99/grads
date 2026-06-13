import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class EmployerCandidatesScreen extends StatefulWidget {
  const EmployerCandidatesScreen({super.key});

  @override
  State<EmployerCandidatesScreen> createState() => _EmployerCandidatesScreenState();
}

class _EmployerCandidatesScreenState extends State<EmployerCandidatesScreen> {
  int _selectedTab = 0;

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
                  Text('المرشحين', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_outlined, size: 18, color: AppColors.primary),
                        SizedBox(width: 4),
                        Text('بحث متقدم', style: TextStyle(fontSize: 12, color: AppColors.primary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.md),
            _buildTabs(),
            Expanded(child: _selectedTab == 0 ? _buildPipeline() : _buildCandidateList()),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    final tabs = ['خط الأنابيب', 'قائمة المرشحين'];
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
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
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2)),
                  ] : null,
                ),
                child: Text(tabs[i], textAlign: TextAlign.center, style: TextStyle(
                  fontSize: 13, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                )),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildPipeline() {
    final stages = [
      _StageData('قيد المراجعة', AppColors.statusReviewed, 8),
      _StageData('المقابلة', AppColors.statusInterview, 4),
      _StageData('مقبول', AppColors.statusAccepted, 2),
      _StageData('مرفوض', AppColors.statusRejected, 3),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: stages.length,
      itemBuilder: (context, index) {
        final stage = stages[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.md),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 12, height: 12,
                      decoration: BoxDecoration(color: stage.color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Text(stage.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: stage.color.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('${stage.count}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: stage.color)),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.sm),
                ...List.generate(2, (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: _PipelineCandidate(
                    name: ['أحمد علي', 'سارة محمد'][i],
                    position: ['مطور Flutter', 'مهندس Backend'][i],
                    match: [95, 88][i],
                  ),
                )),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCandidateList() {
    final candidates = [
      _CandidateData('أحمد علي', 'مطور Flutter', 'طرابلس', 95, true),
      _CandidateData('سارة محمد', 'مهندس Backend', 'بنغازي', 88, false),
      _CandidateData('خالد عمر', 'مصمم UI/UX', 'طرابلس', 72, false),
      _CandidateData('نورة أحمد', 'محلل بيانات', 'مصراتة', 91, true),
      _CandidateData('عمر حسن', 'مهندس DevOps', 'عن بعد', 67, false),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: candidates.length,
      itemBuilder: (context, index) {
        final c = candidates[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: GlassCard(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Row(
              children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(child: Text(c.name[0], style: const TextStyle(
                    fontFamily: AppTypography.arabicFontFamily,
                    fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary,
                  ))),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                      Text(c.position, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                if (c.isTopMatch)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('الأفضل', style: TextStyle(fontSize: 9, color: AppColors.accent, fontWeight: FontWeight.w600)),
                  ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: c.match >= 80
                        ? AppColors.success.withValues(alpha: 0.1)
                        : AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${c.match}%', style: TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700,
                    color: c.match >= 80 ? AppColors.success : AppColors.warning,
                  )),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _StageData {
  final String name; final Color color; final int count;
  _StageData(this.name, this.color, this.count);
}

class _PipelineCandidate extends StatelessWidget {
  final String name; final String position; final int match;
  const _PipelineCandidate({required this.name, required this.position, required this.match});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.sm, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(name[0], style: const TextStyle(
              fontFamily: AppTypography.arabicFontFamily,
              fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary,
            ))),
          ),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                Text(position, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: match >= 80 ? AppColors.success.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text('$match%', style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w700,
              color: match >= 80 ? AppColors.success : AppColors.warning,
            )),
          ),
        ],
      ),
    );
  }
}

class _CandidateData {
  final String name; final String position; final String location;
  final int match; final bool isTopMatch;
  _CandidateData(this.name, this.position, this.location, this.match, this.isTopMatch);
}
