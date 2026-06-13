import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/enums.dart';

final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeVariant>(ThemeModeNotifier.new);

class ThemeModeNotifier extends Notifier<ThemeVariant> {
  @override
  ThemeVariant build() => ThemeVariant.system;

  void setTheme(ThemeVariant variant) => state = variant;
}

final localeProvider = NotifierProvider<LocaleNotifier, LocaleType>(LocaleNotifier.new);

class LocaleNotifier extends Notifier<LocaleType> {
  @override
  LocaleType build() => LocaleType.arabic;

  void setLocale(LocaleType locale) => state = locale;
}

enum LocaleType {
  arabic,
  english;

  String get code {
    switch (this) {
      case LocaleType.arabic:
        return 'ar';
      case LocaleType.english:
        return 'en';
    }
  }
}
