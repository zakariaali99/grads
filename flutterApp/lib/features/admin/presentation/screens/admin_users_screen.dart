import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/models/admin_models.dart';
import '../../data/models/mock_data.dart';

Color _statusColor(String status) {
  switch (status) {
    case 'active': return AppColors.success;
    case 'pending': return AppColors.warning;
    case 'blocked': return AppColors.error;
    default: return AppColors.textHint;
  }
}

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _searchController = TextEditingController();
  String _selectedRole = 'all';
  final _roles = ['all', 'graduate', 'employer', 'institution'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = mockUsers.where((u) {
      if (_selectedRole != 'all' && u.role != _selectedRole) return false;
      if (_searchController.text.isNotEmpty && !u.name.contains(_searchController.text)) return false;
      return true;
    }).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.md, AppDimensions.md, AppDimensions.sm),
              child: Text('المستخدمين', style: AppTypography.arabicTextTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.sm),
                child: TextField(
                  controller: _searchController,
                  textDirection: TextDirection.rtl,
                  decoration: InputDecoration(
                    hintText: 'بحث عن مستخدم...',
                    hintTextDirection: TextDirection.rtl,
                    border: InputBorder.none,
                    prefixIcon: const Icon(Icons.search, color: AppColors.textHint, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () => setState(() => _searchController.clear()))
                        : null,
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: _roles.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final role = _roles[index];
                  final isSelected = _selectedRole == role;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedRole = role),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.primary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        _roleLabel(role),
                        style: TextStyle(
                          fontFamily: AppTypography.arabicFontFamily,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: AppDimensions.sm),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final user = filtered[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      padding: EdgeInsets.zero,
                      child: ListTile(
                        leading: CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                          child: Text(user.name[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        title: Row(
                          children: [
                            Flexible(child: Text(user.name, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600))),
                            if (user.isVerified) ...[
                              const SizedBox(width: 4),
                              const Icon(Icons.verified, size: 14, color: AppColors.primary),
                            ],
                          ],
                        ),
                        subtitle: Text('${user.email} • ${_roleLabel(user.role)}', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _statusColor(user.status).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(user.status == 'active' ? 'نشط' : user.status == 'pending' ? 'معلق' : 'محظور',
                                style: TextStyle(fontSize: 11, color: _statusColor(user.status))),
                            ),
                            if (user.reportsCount > 0) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.error.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text('${user.reportsCount}', style: TextStyle(fontSize: 11, color: AppColors.error)),
                              ),
                            ],
                          ],
                        ),
                        onTap: () => _showUserActions(user),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserActions(AdminUser user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => GlassCard(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(user.name, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(user.email, style: TextStyle(color: AppColors.textHint, fontSize: 13)),
              const SizedBox(height: AppDimensions.md),
              Divider(height: 1, color: Theme.of(context).dividerColor.withValues(alpha: 0.1)),
              _actionItem(Icons.person_outline, 'عرض الملف الشخصي'),
              _actionItem(Icons.email_outlined, 'إرسال بريد إلكتروني'),
              if (user.status != 'blocked') _actionItem(Icons.block_outlined, 'حظر المستخدم', color: AppColors.error),
              if (user.status == 'blocked') _actionItem(Icons.check_circle_outline, 'إلغاء الحظر', color: AppColors.success),
              _actionItem(Icons.delete_outline, 'حذف الحساب', color: AppColors.error),
            ],
          ),
        ),
      ),
    );
  }

  Widget _actionItem(IconData icon, String label, {Color? color}) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.textSecondary, size: 20),
      title: Text(label, style: TextStyle(fontSize: 14, color: color ?? AppColors.textPrimary)),
      trailing: const Icon(Icons.chevron_left, size: 18, color: AppColors.textHint),
      onTap: () => Navigator.pop(context),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'all': return 'الكل';
      case 'graduate': return 'خريج';
      case 'employer': return 'صاحب عمل';
      case 'institution': return 'مؤسسة';
      case 'admin': return 'مشرف';
      default: return role;
    }
  }
}
