import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final _numberFormat = NumberFormat('#,##0');
  static final _currencyFormat = NumberFormat('#,##0.00', 'ar');

  static String formatNumber(int number) {
    return _numberFormat.format(number);
  }

  static String formatSalary(double min, double max, {String currency = 'LYD'}) {
    if (min == 0 && max == 0) return 'غير محدد';
    if (min == max) return '$_currencyFormat$min $currency';
    if (min == 0) return 'حتى $_currencyFormat$max $currency';
    if (max == 0) return 'من $_currencyFormat$min $currency';
    return '$_currencyFormat$min - $_currencyFormat$max $currency';
  }

  static String formatPercentage(double value, {int decimals = 0}) {
    return '${value.toStringAsFixed(decimals)}%';
  }

  static String formatPhone(String phone) {
    if (phone.length == 10) {
      return '${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}';
    }
    return phone;
  }

  static String formatGpa(double gpa) {
    return gpa.toStringAsFixed(2);
  }

  static String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}
