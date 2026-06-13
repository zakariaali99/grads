import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary palette
  static const Color primary = Color(0xFF0F1B2D);
  static const Color primaryLight = Color(0xFF1A2D4A);
  static const Color accent = Color(0xFF00D4FF);
  static const Color accentAlt = Color(0xFF0088FF);

  // Secondary palette
  static const Color secondary = Color(0xFFFFB800);
  static const Color secondaryLight = Color(0xFFFFD666);

  // Neutral palette
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1A1D21);
  static const Color backgroundDark = Color(0xFF0D1117);

  // Text
  static const Color textPrimary = Color(0xFF1A1D21);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textHint = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnAccent = Color(0xFF0F1B2D);

  // Status
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Glassmorphism
  static Color glassLight = Colors.white.withValues(alpha: 0.7);
  static Color glassDark = const Color(0xFF1E293B).withValues(alpha: 0.8);
  static Color glassBorderLight = Colors.white.withValues(alpha: 0.3);
  static Color glassBorderDark = Colors.white.withValues(alpha: 0.1);

  // Gradient helpers
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, Color(0xFF1A2D4A)],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent, accentAlt],
  );

  static const LinearGradient sunsetGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent, secondary],
  );

  // Application status colors
  static const Color statusPending = Color(0xFF9CA3AF);
  static const Color statusReviewed = Color(0xFF3B82F6);
  static const Color statusShortlisted = Color(0xFF8B5CF6);
  static const Color statusInterview = Color(0xFFF59E0B);
  static const Color statusAccepted = Color(0xFF10B981);
  static const Color statusRejected = Color(0xFFEF4444);
}
