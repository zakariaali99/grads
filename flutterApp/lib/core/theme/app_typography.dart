import 'package:flutter/material.dart';

class AppTypography {
  AppTypography._();

  static const String arabicFontFamily = 'Tajawal';
  static const String englishFontFamily = 'Inter';

  static const TextTheme arabicTextTheme = TextTheme(
    displayLarge: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 32,
      fontWeight: FontWeight.w700,
      height: 1.3,
      letterSpacing: -0.5,
    ),
    displayMedium: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 28,
      fontWeight: FontWeight.w700,
      height: 1.3,
    ),
    displaySmall: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 24,
      fontWeight: FontWeight.w600,
      height: 1.3,
    ),
    headlineLarge: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 22,
      fontWeight: FontWeight.w600,
      height: 1.3,
    ),
    headlineMedium: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 20,
      fontWeight: FontWeight.w600,
      height: 1.4,
    ),
    headlineSmall: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 18,
      fontWeight: FontWeight.w600,
      height: 1.4,
    ),
    titleLarge: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 18,
      fontWeight: FontWeight.w500,
      height: 1.4,
    ),
    titleMedium: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 16,
      fontWeight: FontWeight.w500,
      height: 1.4,
    ),
    titleSmall: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 14,
      fontWeight: FontWeight.w500,
      height: 1.4,
    ),
    bodyLarge: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 16,
      fontWeight: FontWeight.w400,
      height: 1.6,
    ),
    bodyMedium: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 14,
      fontWeight: FontWeight.w400,
      height: 1.6,
    ),
    bodySmall: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 12,
      fontWeight: FontWeight.w400,
      height: 1.5,
    ),
    labelLarge: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 14,
      fontWeight: FontWeight.w600,
      height: 1.4,
    ),
    labelMedium: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 12,
      fontWeight: FontWeight.w600,
      height: 1.4,
    ),
    labelSmall: TextStyle(
      fontFamily: arabicFontFamily,
      fontSize: 10,
      fontWeight: FontWeight.w600,
      height: 1.4,
    ),
  );
}
