import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/models/admin_models.dart';

class AdminCrudScreen extends StatefulWidget {
  final String title;
  final List<CrudItem> items;

  const AdminCrudScreen({super.key, required this.title, required this.items});

  @override
  State<AdminCrudScreen> createState() => _AdminCrudScreenState();
}

class _AdminCrudScreenState extends State<AdminCrudScreen> {
  late List<CrudItem> _items;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.items);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _items.where((item) {
      if (_searchController.text.isEmpty) return true;
      return item.nameAr.contains(_searchController.text) || item.name.contains(_searchController.text);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: AppTypography.arabicTextTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showAddDialog),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppDimensions.md),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.sm),
                child: TextField(
                  controller: _searchController,
                  textDirection: TextDirection.rtl,
                  decoration: InputDecoration(
                    hintText: 'بحث...',
                    hintTextDirection: TextDirection.rtl,
                    border: InputBorder.none,
                    prefixIcon: const Icon(Icons.search, color: AppColors.textHint, size: 20),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final item = filtered[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      padding: EdgeInsets.zero,
                      child: ListTile(
                        leading: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: Text(item.nameAr[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        title: Text(item.nameAr, style: AppTypography.arabicTextTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                        subtitle: Text('${item.name} • مستخدم في ${item.usageCount} سجل', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8, height: 8,
                              decoration: BoxDecoration(
                                color: item.isActive ? AppColors.success : AppColors.textHint,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(item.isActive ? 'نشط' : 'غير نشط', style: TextStyle(fontSize: 11, color: item.isActive ? AppColors.success : AppColors.textHint)),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () => _showEditDialog(item),
                              child: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textHint),
                            ),
                          ],
                        ),
                        onTap: () => setState(() {
                          final idx = _items.indexWhere((e) => e.id == item.id);
                          if (idx != -1) _items[idx] = CrudItem(id: item.id, name: item.name, nameAr: item.nameAr, description: item.description, usageCount: item.usageCount, isActive: !item.isActive);
                        }),
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

  void _showAddDialog() {
    final nameController = TextEditingController();
    final nameArController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('إضافة ${widget.title}', style: AppTypography.arabicTextTheme.titleMedium),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'الاسم (بالإنجليزية)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: nameArController,
              textDirection: TextDirection.rtl,
              decoration: InputDecoration(
                labelText: 'الاسم (بالعربية)',
                labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              if (nameController.text.isNotEmpty && nameArController.text.isNotEmpty) {
                setState(() {
                  _items.add(CrudItem(
                    id: '${_items.length + 1}',
                    name: nameController.text,
                    nameAr: nameArController.text,
                  ));
                });
                Navigator.pop(ctx);
              }
            },
            child: Text('إضافة', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(CrudItem item) {
    final nameController = TextEditingController(text: item.name);
    final nameArController = TextEditingController(text: item.nameAr);
    final descController = TextEditingController(text: item.description);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('تعديل ${item.nameAr}', style: AppTypography.arabicTextTheme.titleMedium),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'الاسم (بالإنجليزية)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: nameArController,
              textDirection: TextDirection.rtl,
              decoration: InputDecoration(
                labelText: 'الاسم (بالعربية)',
                labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              textDirection: TextDirection.rtl,
              decoration: InputDecoration(
                labelText: 'الوصف',
                labelStyle: TextStyle(fontFamily: AppTypography.arabicFontFamily),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              final idx = _items.indexWhere((e) => e.id == item.id);
              if (idx != -1) {
                setState(() {
                  _items[idx] = CrudItem(
                    id: item.id, name: nameController.text, nameAr: nameArController.text,
                    description: descController.text, usageCount: item.usageCount, isActive: item.isActive,
                  );
                });
              }
              Navigator.pop(ctx);
            },
            child: Text('حفظ', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }
}
