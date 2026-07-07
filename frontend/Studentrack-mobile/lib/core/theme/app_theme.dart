import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary palette
  static const primary       = Color(0xFF2563EB);
  static const primaryDark   = Color(0xFF1D4ED8);
  static const primaryLight  = Color(0xFFDBEAFE);
  static const secondary     = Color(0xFF7C3AED);
  static const secondaryLight= Color(0xFFEDE9FE);
  static const accent        = Color(0xFF10B981);
  static const accentLight   = Color(0xFFD1FAE5);
  static const warning       = Color(0xFFF59E0B);
  static const warningLight  = Color(0xFFFEF3C7);
  static const danger        = Color(0xFFEF4444);
  static const dangerLight   = Color(0xFFFEE2E2);

  // Neutral
  static const dark          = Color(0xFF1E293B);
  static const dark2         = Color(0xFF334155);
  static const gray          = Color(0xFF64748B);
  static const grayLight     = Color(0xFF94A3B8);
  static const border        = Color(0xFFE2E8F0);
  static const background    = Color(0xFFF1F5F9);
  static const background2   = Color(0xFFF8FAFC);
  static const white         = Color(0xFFFFFFFF);

  // Gradient
  static const List<Color> primaryGradient  = [Color(0xFF2563EB), Color(0xFF7C3AED)];
  static const List<Color> heroGradient     = [Color(0xFF0F172A), Color(0xFF1E3A5F), Color(0xFF1E40AF)];
  static const List<Color> successGradient  = [Color(0xFF10B981), Color(0xFF0891B2)];
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.white,
      error: AppColors.danger,
    ),
    scaffoldBackgroundColor: AppColors.background,
    textTheme: GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: AppColors.dark),
      displayMedium: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: AppColors.dark),
      headlineLarge: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: AppColors.dark),
      headlineMedium: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: AppColors.dark),
      headlineSmall: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: AppColors.dark),
      titleLarge: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: AppColors.dark),
      titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppColors.dark),
      bodyLarge: GoogleFonts.inter(color: AppColors.dark2),
      bodyMedium: GoogleFonts.inter(color: AppColors.gray),
      labelLarge: GoogleFonts.inter(fontWeight: FontWeight.w600),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.white,
      foregroundColor: AppColors.dark,
      elevation: 0,
      centerTitle: false,
      iconTheme: IconThemeData(color: AppColors.dark),
    ),
    cardTheme: CardThemeData(
      color: AppColors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      margin: const EdgeInsets.all(0),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 2),
        padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.background2,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border, width: 2)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border, width: 2)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: GoogleFonts.inter(color: AppColors.grayLight, fontSize: 14),
      labelStyle: GoogleFonts.inter(color: AppColors.gray, fontWeight: FontWeight.w600),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.white,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.grayLight,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
      elevation: 12,
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1),
  );
}
