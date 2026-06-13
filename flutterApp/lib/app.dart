import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/services/app_settings_provider.dart';
import 'core/constants/enums.dart';

class GraduatorsApp extends ConsumerWidget {
  const GraduatorsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeVariant = ref.watch(themeModeProvider);
    final localeVariant = ref.watch(localeProvider);

    return MaterialApp.router(
      title: 'Graduators - خريجون',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: _resolveThemeMode(themeVariant),
      locale: Locale(localeVariant.code),
      supportedLocales: const [
        Locale('ar'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }

  ThemeMode _resolveThemeMode(ThemeVariant variant) {
    switch (variant) {
      case ThemeVariant.light:
        return ThemeMode.light;
      case ThemeVariant.dark:
        return ThemeMode.dark;
      case ThemeVariant.system:
        return ThemeMode.system;
    }
  }
}
