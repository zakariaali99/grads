import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key});

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final _commentController = TextEditingController();
  bool _isLiked = true;
  int _likeCount = 24;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التفاصيل')),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppDimensions.md),
                child: Column(
                  children: [
                    _buildPostContent(),
                    const SizedBox(height: AppDimensions.md),
                    _buildReactionRow(),
                    const SizedBox(height: AppDimensions.md),
                    _buildCommentInput(),
                    const SizedBox(height: AppDimensions.md),
                    _buildSectionTitle('التعليقات (٥)'),
                    const SizedBox(height: AppDimensions.sm),
                    _buildCommentsList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPostContent() {
    return GlassCard(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(child: Text('أ', style: TextStyle(
                  fontFamily: AppTypography.arabicFontFamily,
                  fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary,
                ))),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('أحمد علي', style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(width: 4),
                        const Icon(Icons.verified, size: 14, color: AppColors.accent),
                      ],
                    ),
                    Text('منذ ساعة', style: const TextStyle(fontSize: 12, color: AppColors.textHint)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Text(
            'سعيد جداً بانضمامي لفريق تطوير تطبيقات Flutter في شركة تقنيات الابتكار! '
            'شكراً للفريق الرائع على هذه الفرصة.',
            style: AppTypography.arabicTextTheme.bodyLarge?.copyWith(height: 1.7),
          ),
        ],
      ),
    );
  }

  Widget _buildReactionRow() {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: AppDimensions.sm),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => setState(() {
              _isLiked = !_isLiked;
              _likeCount += _isLiked ? 1 : -1;
            }),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _isLiked ? AppColors.accent.withValues(alpha: 0.1) : AppColors.background,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(_isLiked ? Icons.favorite : Icons.favorite_outline,
                    size: 20, color: _isLiked ? AppColors.accent : AppColors.textHint),
                  const SizedBox(width: 6),
                  Text('$_likeCount', style: TextStyle(
                    fontWeight: FontWeight.w600, color: _isLiked ? AppColors.accent : AppColors.textHint,
                  )),
                ],
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          ...['like', 'celebrate', 'support', 'insightful', 'love'].map((r) => Padding(
            padding: const EdgeInsets.only(left: 4),
            child: GestureDetector(
              onTap: () => setState(() => _isLiked = true),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: _reactionIcon(r),
              ),
            ),
          )),
          const Spacer(),
          const Icon(Icons.share_outlined, color: AppColors.textHint, size: 20),
        ],
      ),
    );
  }

  Widget _reactionIcon(String type) {
    final icons = {
      'like': Icons.thumb_up_alt_outlined,
      'celebrate': Icons.celebration_outlined,
      'support': Icons.volunteer_activism_outlined,
      'insightful': Icons.lightbulb_outline,
      'love': Icons.favorite_outline,
    };
    return Icon(icons[type], size: 18, color: AppColors.textHint);
  }

  Widget _buildCommentInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: AppDimensions.sm),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(child: Text('أ', style: TextStyle(
              fontFamily: AppTypography.arabicFontFamily,
              fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary,
            ))),
          ),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: TextField(
              controller: _commentController,
              decoration: InputDecoration(
                hintText: 'اكتب تعليقاً...',
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
                hintStyle: TextStyle(fontSize: 14, color: AppColors.textHint.withValues(alpha: 0.5)),
              ),
              style: const TextStyle(fontSize: 14),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send_outlined, color: AppColors.accent, size: 22),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700));
  }

  Widget _buildCommentsList() {
    final comments = [
      _Comment('سارة محمد', 'ألف مبروك! 🎉 نجاح كبير', 'منذ ٣٠ دقيقة', true),
      _Comment('خالد عمر', ' congratulations! رائع جداً', 'منذ ساعة', false),
      _Comment('نورة أحمد', 'الله يبارك فيك ويوفقك', 'منذ ساعتين', false),
      _Comment('عمر حسن', 'مستحق والله، أنت مبدع', 'منذ ٣ ساعات', true),
      _Comment('ليلى سالم', 'أخيراً! كنت أعرف أنك ستوصل ❤️', 'منذ ٤ ساعات', false),
    ];

    return Column(
      children: comments.map((c) => Padding(
        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(child: Text(c.name[0], style: const TextStyle(
                fontFamily: AppTypography.arabicFontFamily,
                fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary,
              ))),
            ),
            const SizedBox(width: AppDimensions.sm),
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.all(AppDimensions.sm),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(c.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        if (c.isAuthor) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('كاتب', style: TextStyle(fontSize: 8, color: AppColors.accent)),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(c.content, style: const TextStyle(fontSize: 13, height: 1.4)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(c.time, style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
                        const SizedBox(width: AppDimensions.md),
                        Text('رد', style: const TextStyle(fontSize: 10, color: AppColors.accent, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      )).toList(),
    );
  }
}

class _Comment {
  final String name; final String content; final String time; final bool isAuthor;
  _Comment(this.name, this.content, this.time, this.isAuthor);
}
