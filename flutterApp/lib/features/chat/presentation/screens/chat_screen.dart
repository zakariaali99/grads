import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  final _messages = [
    _MessageData('مرحباً، نشكرك على اهتمامك بالوظيفة', false, '١٠:٠٠ ص'),
    _MessageData('وأهلاً بك! شكراً لتواصلك', true, '١٠:٠٢ ص'),
    _MessageData('هل يمكننا تحديد موعد للمقابلة يوم الأحد القادم؟', false, '١٠:٠٥ ص'),
    _MessageData('نعم بالتأكيد، الساعة ١٠ صباحاً تناسبني', true, '١٠:٠٧ ص'),
    _MessageData('ممتاز، سنرسل لك رابط المقابلة عبر البريد الإلكتروني', false, '١٠:٠٨ ص'),
    _MessageData('هل هناك أي مستندات أحتاج لتجهيزها؟', true, '١٠:١٠ ص'),
    _MessageData('نعم، يرجى تجهيز السيرة الذاتية وأي شهادات لديك', false, '١٠:١٢ ص'),
    _MessageData('تمام، هتوفرلك الملفات المطلوبة', true, '١٠:١٥ ص'),
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(child: Text('س', style: TextStyle(
                fontFamily: AppTypography.arabicFontFamily,
                fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary,
              ))),
            ),
            const SizedBox(width: AppDimensions.sm),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('سارة محمد', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Row(
                  children: [
                    Container(
                      width: 8, height: 8,
                      decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    const Text('متصل الآن', style: TextStyle(fontSize: 12, color: AppColors.success)),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.videocam_outlined),
            onPressed: () {},
          ),
          PopupMenuButton(
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'profile', child: Text('عرض الملف الشخصي')),
              const PopupMenuItem(value: 'block', child: Text('حظر')),
              const PopupMenuItem(value: 'report', child: Text('إبلاغ')),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                    child: Align(
                      alignment: msg.isMe ? Alignment.centerLeft : Alignment.centerRight,
                      child: Container(
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: msg.isMe ? AppColors.accent.withValues(alpha: 0.1) : Theme.of(context).cardColor,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: msg.isMe ? const Radius.circular(16) : const Radius.circular(4),
                            bottomRight: msg.isMe ? const Radius.circular(4) : const Radius.circular(16),
                          ),
                          border: msg.isMe ? null : Border.all(color: Colors.grey.withValues(alpha: 0.1)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(msg.content, style: const TextStyle(fontSize: 15, height: 1.4)),
                            const SizedBox(height: 4),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(msg.time, style: TextStyle(
                                    fontSize: 10, color: (msg.isMe ? Colors.white : AppColors.textHint).withValues(alpha: 0.7),
                                  )),
                                  if (msg.isMe) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.done_all, size: 14, color: Colors.white70),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                border: Border(top: BorderSide(color: Colors.grey.withValues(alpha: 0.1))),
              ),
              padding: const EdgeInsets.fromLTRB(AppDimensions.sm, AppDimensions.sm, AppDimensions.sm, AppDimensions.lg),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.attach_file_outlined, color: AppColors.textHint),
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: TextField(
                          controller: _messageController,
                          decoration: InputDecoration(
                            hintText: 'اكتب رسالتك...',
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                            hintStyle: const TextStyle(fontSize: 14, color: AppColors.textHint),
                          ),
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Container(
                      decoration: const BoxDecoration(
                        color: AppColors.accent, shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.send_rounded, color: Colors.white, size: 22),
                        onPressed: () {
                          if (_messageController.text.isNotEmpty) {
                            setState(() {
                              _messages.add(_MessageData(_messageController.text, true, 'الآن'));
                              _messageController.clear();
                            });
                            Future.delayed(const Duration(milliseconds: 100), () {
                              if (_scrollController.hasClients) {
                                _scrollController.animateTo(
                                  _scrollController.position.maxScrollExtent,
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeOut,
                                );
                              }
                            });
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageData {
  final String content; final bool isMe; final String time;
  _MessageData(this.content, this.isMe, this.time);
}
