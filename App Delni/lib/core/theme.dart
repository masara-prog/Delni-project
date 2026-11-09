import 'package:flutter/material.dart';

/// Delni design tokens (Delni 2.0): the colours of the Delni logo (teal pin, deep navy road, desert sand).
/// The previous royal-blue design is kept in git at the tag app-design-v1.
class AppColors {
  static const primary = Color(0xFF00736F); // Logo teal, deepened so white text on it stays readable (5.6:1)
  static const primaryMid = Color(0xFF009A94); // Logo teal
  static const primaryGlow = Color(0xFF2DBFB3);
  static const navy = Color(0xFF0B1B2B); // Logo road navy, used for text
  static const background = Color(0xFFF6F7F5);
  static const card = Colors.white;
  static const muted = Color(0xFFEEF2F0);
  static const mutedText = Color(0xFF586A76);
  static const accent = Color(0xFF0E9F6E); // Success / available
  static const gold = Color(0xFFF2A93B); // Ratings
  static const brandOrange = Color(0xFFC9772E); // Logo sand, deepened for calls to action
  static const destructive = Color(0xFFE5484D);
  static const border = Color(0xFFE2E8E5);
  static const sand = Color(0xFFFBF8F3);
  static const desertSand = Color(0xFFE2B47C); // Logo sand, for highlights on dark surfaces

  static const primarySoft = Color(0xFFE2F2F0);
  static const accentSoft = Color(0xFFE3F6EE);
  static const goldSoft = Color(0xFFFDF1DC);
  static const orangeSoft = Color(0xFFF8EBDD);
  static const destructiveSoft = Color(0xFFFDECEC);
  static const onDarkSoft = Color(0xFFB7E8E2); // Secondary text and icons on teal/navy surfaces
}

class AppGradients {
  static const sun = LinearGradient(
    begin: AlignmentDirectional.topStart,
    end: AlignmentDirectional.bottomEnd,
    colors: [AppColors.primary, Color(0xFF0B3B4A)],
  );
  static const sea = LinearGradient(
    begin: AlignmentDirectional.topStart,
    end: AlignmentDirectional.bottomEnd,
    colors: [AppColors.primary, AppColors.primaryMid],
  );
  static const sand = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppColors.sand, Color(0xFFF3EEE5)],
  );
  static const hero = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0, 0.55, 1],
    colors: [Color(0x220B1B2B), Color(0x800B1B2B), Color(0xEB0B1B2B)],
  );
}

class AppShadows {
  static const soft = [BoxShadow(color: Color(0x140B1B2B), blurRadius: 16, offset: Offset(0, 4), spreadRadius: -6)];
  static const card = [BoxShadow(color: Color(0x100B1B2B), blurRadius: 24, offset: Offset(0, 8), spreadRadius: -8)];
  static const glow = [BoxShadow(color: Color(0x3300736F), blurRadius: 32, offset: Offset(0, 12), spreadRadius: -10)];
  static const navBar = [BoxShadow(color: Color(0x0F0B1B2B), blurRadius: 20, offset: Offset(0, -6))];
}

class AppRadius {
  static const sm = 12.0;
  static const md = 18.0;
  static const lg = 22.0;
  static const xl = 28.0;
}

/// Spacing scale (4pt grid).
class Gap {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
  static const page = 20.0;
}

class AppText {
  static const display = TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.navy, height: 1.25, letterSpacing: -0.2);
  static const h1 = TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.navy, height: 1.3);
  static const h2 = TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.navy, height: 1.35);
  static const h3 = TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700, color: AppColors.navy, height: 1.4);
  static const body = TextStyle(fontSize: 14.5, fontWeight: FontWeight.w500, color: AppColors.navy, height: 1.6);
  static const bodyMuted = TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500, color: AppColors.mutedText, height: 1.6);
  static const caption = TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.mutedText, height: 1.4);
  static const label = TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.navy);
  static const price = TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary);
}

class AppTheme {
  static const fontFamily = 'Cairo';

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.navy,
      onSecondary: Colors.white,
      tertiary: AppColors.accent,
      error: AppColors.destructive,
      surface: AppColors.card,
      onSurface: AppColors.navy,
    );
    final rounded = RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md));
    OutlineInputBorder border(Color c, [double w = 1]) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: c, width: w),
        );

    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
      dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.navy,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(fontFamily: fontFamily, fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.navy),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: const TextStyle(color: Color(0xFF8A99A3), fontSize: 13.5, fontWeight: FontWeight.w500),
        labelStyle: const TextStyle(color: AppColors.mutedText, fontSize: 13, fontWeight: FontWeight.w600),
        floatingLabelStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
        prefixIconColor: AppColors.mutedText,
        suffixIconColor: AppColors.mutedText,
        border: border(AppColors.border),
        enabledBorder: border(AppColors.border),
        focusedBorder: border(AppColors.primary, 1.6),
        errorBorder: border(AppColors.destructive),
        focusedErrorBorder: border(AppColors.destructive, 1.6),
        errorStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.4),
          disabledForegroundColor: Colors.white70,
          elevation: 0,
          minimumSize: const Size(64, 54),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          minimumSize: const Size(64, 54),
          side: const BorderSide(color: AppColors.border, width: 1.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        selectedColor: AppColors.primary,
        side: const BorderSide(color: AppColors.border),
        checkmarkColor: Colors.white,
        labelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.navy),
        secondaryLabelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        showCheckmark: false,
      ),
      cardTheme: CardThemeData(color: Colors.white, elevation: 0, margin: EdgeInsets.zero, shape: rounded),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        dragHandleColor: Color(0xFFD6D0C4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
        titleTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.navy),
        contentTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, color: AppColors.mutedText, height: 1.6),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.navy,
        contentTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        insetPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 70,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: AppColors.primarySoft,
        indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((s) => TextStyle(
              fontFamily: fontFamily,
              fontSize: 11.5,
              fontWeight: s.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w600,
              color: s.contains(WidgetState.selected) ? AppColors.primary : AppColors.mutedText,
            )),
        iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(
              size: 24,
              color: s.contains(WidgetState.selected) ? AppColors.primary : AppColors.mutedText,
            )),
      ),
      // Soft rounded "pill" indicator instead of an underline
      tabBarTheme: TabBarThemeData(
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.mutedText,
        indicator: BoxDecoration(color: AppColors.primarySoft, borderRadius: BorderRadius.circular(12)),
        indicatorSize: TabBarIndicatorSize.tab,
        labelPadding: const EdgeInsets.symmetric(horizontal: 16),
        splashBorderRadius: BorderRadius.circular(12),
        dividerColor: Colors.transparent,
        labelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w700),
        unselectedLabelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w600),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.all(Colors.white),
        trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? AppColors.accent : const Color(0xFFCBD2DC)),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? AppColors.primary : Colors.white),
        side: const BorderSide(color: Color(0xFFC9C2B4), width: 1.4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.primary),
      datePickerTheme: DatePickerThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        headerBackgroundColor: AppColors.primary,
        headerForegroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
      ),
    );
  }
}
