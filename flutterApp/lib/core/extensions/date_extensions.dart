import 'package:intl/intl.dart';

extension DateTimeExtensions on DateTime {
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return 'منذ $years سنة';
    }
    if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return 'منذ $months شهر';
    }
    if (difference.inDays > 7) {
      final weeks = (difference.inDays / 7).floor();
      return 'منذ $weeks أسبوع';
    }
    if (difference.inDays > 0) {
      return 'منذ ${difference.inDays} يوم';
    }
    if (difference.inHours > 0) {
      return 'منذ ${difference.inHours} ساعة';
    }
    if (difference.inMinutes > 0) {
      return 'منذ ${difference.inMinutes} دقيقة';
    }
    return 'الآن';
  }

  String get formattedDate {
    return DateFormat('yyyy/MM/dd').format(this);
  }

  String get formattedDateTime {
    return DateFormat('yyyy/MM/dd HH:mm').format(this);
  }

  String get formattedTime {
    return DateFormat('HH:mm').format(this);
  }

  String get arabicDate {
    final months = [
      '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    return '$day ${months[month]} $year';
  }
}
