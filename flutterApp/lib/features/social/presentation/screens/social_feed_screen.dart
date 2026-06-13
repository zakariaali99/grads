import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';

class SocialFeedScreen extends StatefulWidget {
  final Widget? createPostTarget;
  const SocialFeedScreen({super.key, this.createPostTarget});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final _posts = List.generate(6, (i) => _PostData(
    author: ['أحمد علي', 'سارة محمد', 'خالد عمر', 'نورة أحمد', 'عمر حسن', 'ليلى سالم'][i],
    role: ['مطور Flutter', 'مهندس Backend', 'مصمم UI/UX', 'محلل بيانات', 'مهندس DevOps', 'مطور ويب'][i],
    time: ['منذ ساعة', 'منذ ٣ ساعات', 'منذ ٥ ساعات', 'منذ يوم', 'منذ يومين', 'منذ ٣ أيام'][i],
    content: [
      'سعيد جداً بانضمامي لفريق تطوير تطبيقات Flutter في شركة تقنيات الابتكار! شكراً للفريق الرائع على هذه الفرصة.',
      'بحثت عن أفضل ممارسات الـ Clean Architecture في Flutter ووجدت أن Riverpod مع Repository Pattern يعطي أفضل نتيجة.',
      'أنهيت اليوم تصميم واجهة مستخدم جديدة لتطبيق إدارة المهام. استخدمت Figma و Material Design 3.',
      'شاركت في ورشة عمل عن تحليل البيانات باستخدام Python. كانت تجربة رائعة تعلمت فيها الكثير.',
      'أبحث عن فرصة عمل في مجال الـ DevOps. لدي خبرة في Docker, Kubernetes, و CI/CD pipelines.',
      'نصيحة للمطورين الجدد: استثمروا وقتكم في تعلم أساسيات البرمجة قبل التوجه للأطر.',
    ][i],
    likes: [24, 18, 32, 15, 8, 42][i],
    comments: [5, 3, 8, 2, 1, 12][i],
    isLiked: [true, false, true, false, false, true][i],
    reactionType: ['like', null, 'celebrate', null, null, 'love'][i],
    imageUrl: i.isEven ? null : null,
  ));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(AppDimensions.md, 0, AppDimensions.md, AppDimensions.xxl),
                itemCount: _posts.length,
                itemBuilder: (context, index) {
                  final post = _posts[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppDimensions.md),
                    child: _buildPost(post, index),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/social/create'),
        backgroundColor: AppColors.accent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, AppDimensions.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('المنصة الاجتماعية', style: AppTypography.arabicTextTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push('/notifications'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPost(_PostData post, int index) {
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
                child: Center(child: Text(post.author[0], style: const TextStyle(
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
                        Text(post.author, style: AppTypography.arabicTextTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(width: 4),
                        const Icon(Icons.verified, size: 14, color: AppColors.accent),
                      ],
                    ),
                    Row(
                      children: [
                        Text(post.role, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        const SizedBox(width: 6),
                        Text('•', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                        const SizedBox(width: 6),
                        Text(post.time, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton(
                icon: const Icon(Icons.more_horiz, size: 20, color: AppColors.textHint),
                itemBuilder: (_) => [
                  const PopupMenuItem(value: 'save', child: Text('حفظ')),
                  const PopupMenuItem(value: 'report', child: Text('إبلاغ')),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          GestureDetector(
            onTap: () => context.push('/social/post'),
            child: Text(post.content, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(height: 1.6)),
          ),
          const SizedBox(height: AppDimensions.sm),
          _buildReactionBar(post, index),
        ],
      ),
    );
  }

  Widget _buildReactionBar(_PostData post, int index) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => setState(() {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
          }),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: post.isLiked ? AppColors.accent.withValues(alpha: 0.1) : AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  post.isLiked ? Icons.favorite : Icons.favorite_outline,
                  size: 18,
                  color: post.isLiked ? AppColors.accent : AppColors.textHint,
                ),
                const SizedBox(width: 4),
                Text(_formatCount(post.likes), style: TextStyle(
                  fontSize: 12, color: post.isLiked ? AppColors.accent : AppColors.textHint,
                )),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        GestureDetector(
          onTap: () => context.push('/social/post'),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.chat_bubble_outline, size: 18, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(_formatCount(post.comments), style: const TextStyle(fontSize: 12, color: AppColors.textHint)),
              ],
            ),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () {},
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.share_outlined, size: 18, color: AppColors.textHint),
                SizedBox(width: 4),
                Text('مشاركة', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _formatCount(int count) {
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}k';
    return count.toString();
  }
}

class _PostData {
  String author; String role; String time; String content;
  int likes; int comments; bool isLiked;
  String? reactionType; String? imageUrl;

  _PostData({
    required this.author, required this.role, required this.time, required this.content,
    required this.likes, required this.comments, required this.isLiked,
    this.reactionType, this.imageUrl,
  });
}
