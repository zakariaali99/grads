import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class EmployerAnalyticsScreen extends StatelessWidget {
  const EmployerAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('الإحصائيات', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: AppDimensions.md),
              _buildSummaryCards(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('قمع التوظيف'),
              const SizedBox(height: AppDimensions.sm),
              _buildFunnel(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('المهارات المطلوبة'),
              const SizedBox(height: AppDimensions.sm),
              _buildSkillDemand(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('أداء الوظائف'),
              const SizedBox(height: AppDimensions.sm),
              _buildJobPerformance(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700));
  }

  Widget _buildSummaryCards() {
    return Row(
      children: [
        Expanded(child: _MetricCard(label: 'نسبة القبول', value: '٢٤٪', icon: Icons.trending_up, color: AppColors.success, delta: '+٥٪')),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: _MetricCard(label: 'متوسط التطابق', value: '٧٨٪', icon: Icons.compare_arrows, color: AppColors.accent, delta: '+٣٪')),
        const SizedBox(width: AppDimensions.sm),
        Expanded(child: _MetricCard(label: 'زمن التوظيف', value: '١٢ يوماً', icon: Icons.schedule, color: AppColors.warning, delta: '-٢')),
      ],
    );
  }

  Widget _buildFunnel() {
    final stages = [
      _FunnelStage('المشاهدات', 480, AppColors.info),
      _FunnelStage('المتقدمين', 84, AppColors.accent),
      _FunnelStage('مرشحين أوليين', 32, AppColors.secondary),
      _FunnelStage('مقابلات', 12, AppColors.warning),
      _FunnelStage('توظيف', 5, AppColors.success),
    ];
    return GlassCard(
      child: Column(
        children: stages.asMap().entries.map((entry) {
          final stage = entry.value;
          final maxCount = stages.first.count;
          return Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.sm),
            child: Row(
              children: [
                SizedBox(width: 80, child: Text(stage.name, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary))),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: stage.count / maxCount,
                      minHeight: 20,
                      backgroundColor: AppColors.background,
                      valueColor: AlwaysStoppedAnimation(stage.color.withValues(alpha: 0.7)),
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                SizedBox(
                  width: 36,
                  child: Text('${stage.count}', textAlign: TextAlign.right,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSkillDemand() {
    final skills = [
      _SkillDemand('Flutter', 34, AppColors.accent),
      _SkillDemand('Python', 28, AppColors.info),
      _SkillDemand('UI/UX', 22, AppColors.secondary),
      _SkillDemand('数据分析', 18, AppColors.warning),
      _SkillDemand('DevOps', 12, AppColors.success),
    ];
    return GlassCard(
      child: Column(
        children: skills.map((s) => Padding(
          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
          child: Row(
            children: [
              SizedBox(width: 80, child: Text(s.name, style: const TextStyle(fontSize: 12))),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: LinearProgressIndicator(
                    value: s.count / 34,
                    minHeight: 8,
                    backgroundColor: AppColors.background,
                    valueColor: AlwaysStoppedAnimation(s.color),
                  ),
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Text('${s.count}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(width: 4),
              const Text('متقدم', style: TextStyle(fontSize: 10, color: AppColors.textHint)),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildJobPerformance() {
    final perf = [
      _JobPerf('مطور Flutter', 24, 85, AppColors.success),
      _JobPerf('مهندس Backend', 15, 78, AppColors.accent),
      _JobPerf('مصمم UI/UX', 12, 72, AppColors.warning),
    ];
    return Column(
      children: perf.map((p) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.title, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                    Row(
                      children: [
                        Icon(Icons.people_outlined, size: 12, color: AppColors.textHint),
                        const SizedBox(width: 4),
                        Text('${p.applicants} متقدم', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${p.matchRate}%', style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w700, color: p.color,
                  )),
                  Text('تطابق', style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
                ],
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label; final String value; final IconData icon; final Color color; final String delta;
  const _MetricCard({required this.label, required this.value, required this.icon, required this.color, required this.delta});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.sm),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          Text(label, style: const TextStyle(fontSize: 9, color: AppColors.textHint)),
          Text(delta, style: TextStyle(fontSize: 9, color: delta.startsWith('+') ? AppColors.success : AppColors.warning, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _FunnelStage {
  final String name; final int count; final Color color;
  _FunnelStage(this.name, this.count, this.color);
}

class _SkillDemand {
  final String name; final int count; final Color color;
  _SkillDemand(this.name, this.count, this.color);
}

class _JobPerf {
  final String title; final int applicants; final int matchRate; final Color color;
  _JobPerf(this.title, this.applicants, this.matchRate, this.color);
}
