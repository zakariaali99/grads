class AppConstants {
  AppConstants._();

  static const String appName = 'Graduators';
  static const String appNameAr = 'خريجون';
  static const String version = '1.0.0';

  static const int otpLength = 6;
  static const int minPasswordLength = 8;
  static const int maxNameLength = 128;
  static const int maxBioLength = 500;
  static const int maxFileSize = 10 * 1024 * 1024;

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration toastDuration = Duration(seconds: 3);
  static const Duration splashDuration = Duration(seconds: 2);
}
