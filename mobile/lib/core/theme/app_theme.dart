import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Mirrors the "Trust & Authority" palette unified across all 3 web
/// frontends (frontend/src/theme/theme.ts, frontend-storefront, frontend-vendor).
class AppTheme {
  AppTheme._();

  static const _primaryLight = Color(0xFF0369A1);
  static const _primaryDark = Color(0xFF38BDF8);
  static const _secondaryLight = Color(0xFF334155);
  static const _secondaryDark = Color(0xFF94A3B8);
  static const _backgroundLight = Color(0xFFF8FAFC);
  static const _backgroundDark = Color(0xFF0B1120);
  static const _surfaceLight = Color(0xFFFFFFFF);
  static const _surfaceDark = Color(0xFF131B2E);
  static const _textPrimaryLight = Color(0xFF0F172A);
  static const _textPrimaryDark = Color(0xFFF1F5F9);
  static const _textSecondaryLight = Color(0xFF64748B);
  static const _textSecondaryDark = Color(0xFF94A3B8);
  static const _dividerLight = Color(0xFFE2E8F0);
  static const _dividerDark = Color(0xFF1E293B);
  static const _errorLight = Color(0xFFDC2626);
  static const _errorDark = Color(0xFFF87171);

  static ThemeData get light => _build(
        brightness: Brightness.light,
        primary: _primaryLight,
        secondary: _secondaryLight,
        background: _backgroundLight,
        surface: _surfaceLight,
        textPrimary: _textPrimaryLight,
        textSecondary: _textSecondaryLight,
        divider: _dividerLight,
        error: _errorLight,
        onPrimary: Colors.white,
      );

  static ThemeData get dark => _build(
        brightness: Brightness.dark,
        primary: _primaryDark,
        secondary: _secondaryDark,
        background: _backgroundDark,
        surface: _surfaceDark,
        textPrimary: _textPrimaryDark,
        textSecondary: _textSecondaryDark,
        divider: _dividerDark,
        error: _errorDark,
        onPrimary: const Color(0xFF0B1120),
      );

  static ThemeData _build({
    required Brightness brightness,
    required Color primary,
    required Color secondary,
    required Color background,
    required Color surface,
    required Color textPrimary,
    required Color textSecondary,
    required Color divider,
    required Color error,
    required Color onPrimary,
  }) {
    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: primary,
      onPrimary: onPrimary,
      secondary: secondary,
      onSecondary: Colors.white,
      error: error,
      onError: Colors.white,
      surface: surface,
      onSurface: textPrimary,
      outline: divider,
    );

    final baseTextTheme = GoogleFonts.plusJakartaSansTextTheme().apply(
      bodyColor: textPrimary,
      displayColor: textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: background,
      textTheme: baseTextTheme.copyWith(
        bodySmall: baseTextTheme.bodySmall?.copyWith(color: textSecondary),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(color: textSecondary),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: divider),
        ),
      ),
      dividerTheme: DividerThemeData(color: divider, thickness: 1),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: onPrimary,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        indicatorColor: primary.withValues(alpha: 0.12),
        surfaceTintColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: background,
        side: BorderSide(color: divider),
        labelStyle: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: textPrimary,
        contentTextStyle: GoogleFonts.plusJakartaSans(color: surface),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}
