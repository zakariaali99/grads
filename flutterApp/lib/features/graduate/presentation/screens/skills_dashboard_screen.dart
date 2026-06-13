import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class SkillsDashboardScreen extends StatelessWidget {
  const SkillsDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تحليل المهارات')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRadarChart(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('مستوى المهارات'),
              const SizedBox(height: AppDimensions.sm),
              _buildSkillBars(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('المهارات المطلوبة في السوق'),
              const SizedBox(height: AppDimensions.sm),
              _buildMarketDemand(),
              const SizedBox(height: AppDimensions.lg),
              _buildSectionTitle('الفجوات المهارية'),
              const SizedBox(height: AppDimensions.sm),
              _buildSkillGaps(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
      fontWeight: FontWeight.w700,
    ));
  }

  Widget _buildRadarChart() {
    final skills = [
      _RadarSkill('Flutter', 0.9),
      _RadarSkill('Dart', 0.85),
      _RadarSkill('Firebase', 0.7),
      _RadarSkill('UI/UX', 0.6),
      _RadarSkill('Backend', 0.45),
      _RadarSkill('Git', 0.75),
    ];

    return GlassCard(
      child: Column(
        children: [
          Text('مخطط المهارات', style: AppTypography.arabicTextTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: AppDimensions.md),
          CustomPaint(
            size: const Size(double.infinity, 260),
            painter: _RadarChartPainter(skills),
          ),
          const SizedBox(height: AppDimensions.md),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: skills.map((s) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.5 + s.level * 0.5),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(s.name, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillBars() {
    final skills = [
      _SkillBar('Flutter', 0.9, 'متقدم'),
      _SkillBar('Dart', 0.85, 'متقدم'),
      _SkillBar('Firebase', 0.7, 'متوسط'),
      _SkillBar('UI/UX Design', 0.6, 'متوسط'),
      _SkillBar('REST API', 0.75, 'متوسط'),
      _SkillBar('Git', 0.75, 'متوسط'),
      _SkillBar('Python', 0.35, 'مبتدئ'),
      _SkillBar('SQL', 0.4, 'مبتدئ'),
    ];

    return Column(
      children: skills.map((s) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(s.name, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  )),
                  Text(s.level, style: TextStyle(
                    fontSize: 11,
                    color: s.level == 'متقدم' ? AppColors.success
                        : s.level == 'متوسط' ? AppColors.warning
                        : AppColors.textHint,
                    fontWeight: FontWeight.w500,
                  )),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: s.progress,
                  minHeight: 6,
                  backgroundColor: AppColors.background,
                  valueColor: AlwaysStoppedAnimation(
                    s.progress >= 0.8 ? AppColors.success
                        : s.progress >= 0.5 ? AppColors.accent
                        : AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildMarketDemand() {
    final demands = [
      _DemandSkill('الذكاء الاصطناعي', 98, 'مرتفع جداً'),
      _DemandSkill('Flutter', 95, 'مرتفع جداً'),
      _DemandSkill('الأمن السيبراني', 92, 'مرتفع جداً'),
      _DemandSkill('تحليل البيانات', 88, 'مرتفع'),
      _DemandSkill('تطوير الويب', 82, 'مرتفع'),
    ];

    return Column(
      children: demands.map((d) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d.name, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    )),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: d.demand / 100,
                        minHeight: 4,
                        backgroundColor: AppColors.background,
                        valueColor: AlwaysStoppedAnimation(
                          d.demand >= 90 ? AppColors.success
                              : d.demand >= 80 ? AppColors.accent
                              : AppColors.warning,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppDimensions.md),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text('${d.demand}%', style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w600,
                  color: AppColors.success,
                )),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildSkillGaps() {
    final gaps = [
      _SkillGap('الذكاء الاصطناعي', 'فجوة كبيرة', 'المهارة مطلوبة بشدة في السوق', 0.2),
      _SkillGap('تحليل البيانات', 'فجوة متوسطة', 'تطوير هذه المهارة يزيد فرصك', 0.45),
      _SkillGap('إدارة المشاريع', 'فجوة صغيرة', 'مهارة تكميلية مفيدة', 0.65),
    ];

    return Column(
      children: gaps.map((g) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: GlassCard(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: g.gap == 'فجوة كبيرة' ? AppColors.error.withValues(alpha: 0.1)
                      : g.gap == 'فجوة متوسطة' ? AppColors.warning.withValues(alpha: 0.1)
                      : AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  g.gap == 'فجوة كبيرة' ? Icons.warning_amber_rounded
                      : g.gap == 'فجوة متوسطة' ? Icons.trending_up
                      : Icons.check_circle_outline,
                  color: g.gap == 'فجوة كبيرة' ? AppColors.error
                      : g.gap == 'فجوة متوسطة' ? AppColors.warning
                      : AppColors.info,
                  size: 22,
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(g.name, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    )),
                    const SizedBox(height: 2),
                    Text(g.description, style: const TextStyle(
                      fontSize: 11, color: AppColors.textHint,
                    )),
                  ],
                ),
              ),
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: g.gap == 'فجوة كبيرة' ? AppColors.error.withValues(alpha: 0.1)
                          : g.gap == 'فجوة متوسطة' ? AppColors.warning.withValues(alpha: 0.1)
                          : AppColors.info.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(g.gap, style: TextStyle(
                      fontSize: 9, fontWeight: FontWeight.w600,
                      color: g.gap == 'فجوة كبيرة' ? AppColors.error
                          : g.gap == 'فجوة متوسطة' ? AppColors.warning
                          : AppColors.info,
                    )),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${(g.coverage * 100).toInt()}%',
                    style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }
}

class _RadarSkill {
  final String name;
  final double level;
  _RadarSkill(this.name, this.level);
}

class _RadarChartPainter extends CustomPainter {
  final List<_RadarSkill> skills;

  _RadarChartPainter(this.skills);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width < size.height ? size.width * 0.35 : size.height * 0.35;
    final angleStep = (2 * pi) / skills.length;
    final paintGrid = Paint()
      ..color = Colors.grey.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int ring = 1; ring <= 4; ring++) {
      final r = radius * ring / 4;
      final path = Path();
      for (int i = 0; i < skills.length; i++) {
        final angle = -pi / 2 + i * angleStep;
        final x = center.dx + r * cos(angle);
        final y = center.dy + r * sin(angle);
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
      canvas.drawPath(path, paintGrid);
    }

    for (int i = 0; i < skills.length; i++) {
      final angle = -pi / 2 + i * angleStep;
      final x = center.dx + radius * cos(angle);
      final y = center.dy + radius * sin(angle);
      canvas.drawLine(center, Offset(x, y), paintGrid);
    }

    final dataPaint = Paint()
      ..color = AppColors.accent.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill;

    final dataPath = Path();
    for (int i = 0; i < skills.length; i++) {
      final angle = -pi / 2 + i * angleStep;
      final r = radius * skills[i].level;
      final x = center.dx + r * cos(angle);
      final y = center.dy + r * sin(angle);
      if (i == 0) {
        dataPath.moveTo(x, y);
      } else {
        dataPath.lineTo(x, y);
      }
    }
    dataPath.close();
    canvas.drawPath(dataPath, dataPaint);

    final dotPaint = Paint()
      ..color = AppColors.accent
      ..style = PaintingStyle.fill;
    for (int i = 0; i < skills.length; i++) {
      final angle = -pi / 2 + i * angleStep;
      final r = radius * skills[i].level;
      final x = center.dx + r * cos(angle);
      final y = center.dy + r * sin(angle);
      canvas.drawCircle(Offset(x, y), 4, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _SkillBar {
  final String name;
  final double progress;
  final String level;
  _SkillBar(this.name, this.progress, this.level);
}

class _DemandSkill {
  final String name;
  final int demand;
  final String label;
  _DemandSkill(this.name, this.demand, this.label);
}

class _SkillGap {
  final String name;
  final String gap;
  final String description;
  final double coverage;
  _SkillGap(this.name, this.gap, this.description, this.coverage);
}
